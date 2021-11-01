/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-lonely-if */

import 'src/http';

import axios from 'axios';
import { exec } from 'child_process';
import config from 'config';
import Debug from 'debug';

import bot, { botSendButtons } from 'src/bot';
import {
    BEDROOM_CEILING_LIGHT,
    DEVICE_CUSTOM_ATTRIBUTE_NAME,
    DEVICE_NAME_TO_ID,
    KITCHEN_UNDERCABINET_LIGHT,
    LEAKAGE_SENSOR_BATHROOM,
    LEAKAGE_SENSOR_KITCHEN,
    LEAKAGE_SENSOR_TOILET,
    SWITCH_1,
    SWITCH_2,
} from 'src/constants';
import {
    insertIntoDeviceCustomAttributes,
    insertIntoValveStatusMessages,
    insertIntoZigbeeDevices,
} from 'src/db';
import log from 'src/logger';
import mqttClient from 'src/mqttClient';
import {
    asyncTimeout,
    getAppUrl,
    mqttMessageDispatcher,
} from 'src/utils';
import yeelightDevices from 'src/yeelightDevices';

const debug = Debug('mhz19-server');

const deviceCustomAttributes: Array<[string, string, string]> = [

    ['0x00000000064c5293', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Bedroom Ceiling Light'],

    ['0x0000000003b6cd80', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Toilet Ceiling Light'],
    ['0x0000000003b6cf16', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Bathroom Ceiling Light'],

    ['0x00158d000405811b', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Leakage Sensor Bathroom'],
    ['0x00158d0004035e3e', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Leakage Sensor Kitchen'],
    ['0x00158d00040356af', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Leakage Sensor Toilet'],

    ['0x00158d00042446ec', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Bedroom Switch'],
    ['0x00158d0004244bda', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Kitchen Switch'],
];

deviceCustomAttributes.forEach(row => {
    insertIntoDeviceCustomAttributes(...row);
});

// const miio = require('miio');
// const devices = miio.devices();
// devices.on('avaialable', a => log.info('avaialable', a));
// devices.on('unavailable', a => log.info('unavailable', a));
// devices.on('error', a => log.info('error', a));

// const bathCeilingLight = new Device({ host: DEVICE_NAME_TO_ID[BATHROOM_CEILING_LIGHT], port: 55443 });
// bathCeilingLight.connect();
// const toiletCeilingLight = new Device({ host: DEVICE_NAME_TO_ID[TOILET_CEILING_LIGHT], port: 55443 });
// toiletCeilingLight.connect();
// const bedroomCeilingLight = new Device({ host: DEVICE_NAME_TO_ID[BEDROOM_CEILING_LIGHT], port: 55443 });
// bedroomCeilingLight.connect();

function mean(values: Array<number>): number {
    return values.reduce((memo, value) => {
        memo += value;
        return memo;
    }, 0) / values.length;
}

function stdDev(values: Array<number>): number {
    const meanValue = mean(values);
    const variance = values.reduce((memo, value) => {
        memo += (value - meanValue) ** 2;
        return memo;
    }, 0) / values.length;
    return Math.sqrt(variance);
}

class Fifo {
    #maxLength = 3;
    #queue: Array<number> = [];
    #name: string;
    toString(): string {
        return this.#name;
    }
    constructor(name: string) {
        this.#name = name;
    }
    push(value: number) {
        this.#queue.push(value);
        if (this.length() > this.#maxLength) this.#queue.shift();
    }
    get(): Array<number> {
        return this.#queue;
    }
    length(): number {
        return this.#queue.length;
    }
    reset(): void {
        this.#queue = [];
    }
    full(): boolean {
        return this.length() === this.#maxLength;
    }
}

function playAlertSigle() {
    return new Promise((resolve, reject) => {
        exec(`mpg123 ./siren.mp3`, (error, stdout, stderr) => {
            if (error) reject(error);
            resolve([stdout, stderr]);
        });
    });
}

function saveGraphvizNetworkmap(data: string, format: 'svg' | 'png' = 'svg') {
    return new Promise((resolve, reject) => {
        exec(`echo '${data}' | circo -T${format} > ./images/networkmap.${format}`, (error, stdout, stderr) => {
            if (error) reject(error);
            resolve([stdout, stderr]);
        });
    });
}

class Alerter {
    static repeats = 0;
    static maxRepeats = 15;
    static raised: boolean;
    static playing: boolean;
    static async on() {
        Alerter.repeats = 0;
        Alerter.raised = true;
        while (Alerter.raised && !Alerter.playing && Alerter.repeats < Alerter.maxRepeats) {
            Alerter.playing = true;
            try {
                log.info(`Playing alert sound, repeat #${Alerter.repeats + 1}...`);
                await playAlertSigle();
                log.info(`Succeeded`);
                Alerter.playing = false;
            } catch (e) {
                log.info(`Playing failed`);
                Alerter.playing = false;
            }
            Alerter.repeats += 1;
            if (Alerter.repeats === Alerter.maxRepeats) {
                log.info(`Max repeats reached`);
            }
            await asyncTimeout(1000);
        }
    }
    static isRaised() {
        return this.raised;
    }
    static off() {
        Alerter.repeats = 0;
        Alerter.raised = false;
    }
}

const leakageSensorHandler: IMqttMessageDispatcherHandler = ({
    deviceId, timestamp, json, deviceName
}) => {
    const appUrl = getAppUrl();
    if (json?.water_leak) {
        mqttClient.publish(`/VALVE/STATE/SET`, "on");
        if (!Alerter.isRaised()) {
            Alerter.on();
            const msg = `Leakage detected for "${deviceName}"! Alert on.\n${appUrl}`;
            bot.sendMessage(config.telegram.chatId, msg);
            botSendButtons(config.telegram.chatId);
            log.info(msg);
        }
    } else {
        if (Alerter.isRaised()) {
            Alerter.off();
            const msg = `Leakage warning ceased for "${deviceName}". Alert off.\n${appUrl}`;
            bot.sendMessage(config.telegram.chatId, msg);
            botSendButtons(config.telegram.chatId);
            log.info(msg);
        }
    }
};

async function postSonoffSwitchMessage(cmd: 'on' | 'off', device: string) {
    log.info(`switching kitchen working light "${cmd}" ...`);
    try {
        const result = await axios.post(
            `http://${DEVICE_NAME_TO_ID[device]}/zeroconf/switch`,
            { "data": { "switch": cmd } }
        );
        log.info('relay response ', result.data);
    } catch (e) {
        log.error(e);
    }
}

mqttMessageDispatcher(mqttClient, [

    [
        `/VALVE/STATE/STATUS`, (payload) => {
            const { rawMessage, timestamp } = payload;
            insertIntoValveStatusMessages(rawMessage, timestamp);
        }
    ],

    [
        'zigbee2mqtt/bridge/config/devices', ({ json }) => {
            const devices = <Array<IZigbee2mqttBridgeConfigDevice>>json;
            if (devices?.length) {
                devices.forEach(device => {
                    insertIntoZigbeeDevices(device);
                });
            }
        }
    ],

    [
        'zigbee2mqtt/bridge/networkmap/graphviz', async ({ rawMessage }) => {
            log.info("saving network map...");
            const result = await saveGraphvizNetworkmap(rawMessage);
            log.info("network map saved");
        }
    ],

    // play alert and sent telegram message when leakage sensors turn their water_leak state
    [LEAKAGE_SENSOR_KITCHEN, leakageSensorHandler],
    [LEAKAGE_SENSOR_BATHROOM, leakageSensorHandler],
    [LEAKAGE_SENSOR_TOILET, leakageSensorHandler],

    // switch bedroom ceiling light on/off
    [
        SWITCH_1, ({ timestamp, deviceId, json }) => {

            const bedroomCeilingLightDeviceId = DEVICE_NAME_TO_ID[BEDROOM_CEILING_LIGHT];
            const bedroomCeilingLight = yeelightDevices.get(bedroomCeilingLightDeviceId);

            if (!bedroomCeilingLight) {
                bot.sendMessage(
                    config.telegram.chatId,
                    `yeelightDevice ${bedroomCeilingLightDeviceId} (${BEDROOM_CEILING_LIGHT}) is not registered`
                );
                return;
            }

            if (json?.action === 'single_left') {
                log.info("switching on bedroom ceiling light");
                bedroomCeilingLight.sendCommand({
                    id: -1,
                    method: 'set_power',
                    params: ['on', 'smooth', 0],
                });
            }
            if (json?.action === 'single_right') {
                log.info("switching off bedroom ceiling light");
                bedroomCeilingLight.sendCommand({
                    id: -1,
                    method: 'set_power',
                    params: ['off', 'smooth', 0],
                });
            }
        }
    ],

    // switch kitchen working lights on/off
    [
        SWITCH_2, async ({ json }) => {
            if (json?.action === 'single_left') {
                postSonoffSwitchMessage("on", KITCHEN_UNDERCABINET_LIGHT);
            }
            if (json?.action === 'single_right') {
                postSonoffSwitchMessage("off", KITCHEN_UNDERCABINET_LIGHT);
            }
        }
    ],

]);

// [
//     TEMPERATURE_SENSOR, ({ deviceId, json, timestamp }) => {
//         insertIntoTemperatureSensorMessages(
//             deviceId,
//             timestamp,
//             <IAqaraTemperatureSensorMessage>json,
//         );
//     }
// ],

// switch speakers power depending on the mean power consumption of tv
// [
//     TV_POWER_PLUG, ({ json }) => {
//         if (json?.power) {
//             appleTvLastPowerValues.push(json.power);
//             const meanPower = Math.round(mean(appleTvLastPowerValues.get()));
//             if (appleTvLastPowerValues.full() && meanPower >= powerThreshold && lastStates[TV_POWER_PLUG] !== "on") {
//                 log.info(`mean power for apple tv is ${meanPower}w, threshold ${powerThreshold}w, automatically switching on audioengine speakers`);
//                 mqttClient.publish(`zigbee2mqtt/${DEVICE_NAME_TO_ID[AUDIOENGINE_POWER_PLUG]}/set/state`, "on");
//                 lastStates[TV_POWER_PLUG] = "on";
//             }
//             if (appleTvLastPowerValues.full() && meanPower < powerThreshold && lastStates[TV_POWER_PLUG] !== "off") {
//                 log.info(`mean power for apple tv is ${meanPower}w, threshold ${powerThreshold}w, automatically switching off audioengine speakers`);
//                 mqttClient.publish(`zigbee2mqtt/${DEVICE_NAME_TO_ID[AUDIOENGINE_POWER_PLUG]}/set/state`, "off");
//                 lastStates[TV_POWER_PLUG] = "off";
//             }
//         }
//     }
// ],

// setInterval(() => {
//     mqttClient.publish(`zigbee2mqtt/${DEVICE_NAME_TO_ID[TV_POWER_PLUG]}/get/state`, "");
// }, 60000);

// const lastStates: Record<string, "on" | "off" | null> = {};
// const powerThreshold = 10;
// const appleTvLastPowerValues = new Fifo(TV_POWER_PLUG);

// [
//     "zigbee2mqtt", function(topic, json, timestamp) {
//         // console.log.info({ topic, json, timestamp });
//         // console.log.info(topic, JSON.stringify(json));
//     }
// ],
// [
//     "zigbee2mqtt/0x00158d0003a010a5", function(topic: string, json: IAqaraPowerPlugMessage | null, timestamp: number) {
//         console.log.info(topic, JSON.stringify(json));
//         // if (json?.power) mean2.push(json.power);
//     }
// ]

// test scenarious
// 1 switch living room light on wireless switch click
// 2 switch off speakers when mean power consumption within period lowers defined threshold

// audioendine power plug
// mhz19-dispatcher topic: zigbee2mqtt/0x00158d000391f252 +22s
// mhz19-dispatcher json: {
// consumption: 17.87,
// energy: 17.87,
// linkquality: 115,
// power: 0,
// state: 'ON',
// temperature: 34
// }

// mhz19-dispatcher topic: zigbee2mqtt/0x00158d0003a010a5 +7m
// mhz19-dispatcher json: {
// consumption: 230.59,
// energy: 230.59,
// linkquality: 115,
// power: 15,
// state: 'ON',
// temperature: 42
// }

// const stdDevValue = stdDev(queue01.get());
// console.log.info(queue01.toString(), queue01.get(), { stdDevValue, meanValue });
