import { exec } from 'child_process';
import config from 'config';
import { Observable } from 'rxjs';
import { Device, Discovery } from 'yeelight-platform';

import {
  AUDIOENGINE_POWER_PLUG,
  BATHROOM_CEILING_LIGHT,
  BEDROOM_CEILING_LIGHT,
  DEVICE_NAME_TO_ID,
  LEAKAGE_SENSOR_BATHROOM,
  LEAKAGE_SENSOR_KITCHEN,
  LEAKAGE_SENSOR_TOILET,
  SWITCH_1,
  TOILET_CEILING_LIGHT,
  TV_POWER_PLUG,
} from 'src/constants';
import mqttClient from 'src/mqttClient';
import {
  IAqaraPowerPlugMessage,
  IAqaraWaterSensorMessage,
  IMqttMessageDispatcherHandler,
  IWallSwitchMessage,
} from 'src/typings';
import { mqttMessageDispatcher } from 'src/utils';

// console.log(config);
// process.exit();

const TelegramBot = require('node-telegram-bot-api');
// const token = 'foo';
// const chatId = 123;
const bot = new TelegramBot(config.telegram.token);

// discover all yeelight devices
// const YeeDiscovery = require('yeelight-platform').Discovery
// const discoveryService = new Discovery();
// discoveryService.on('started', () => {
//     console.log('** Discovery Started **')
// });
// discoveryService.on('didDiscoverDevice', (device) => {
//     console.log(device)
// });
// discoveryService.listen();

// set command to device
// const YeeDevice = require('yeelight-platform').Device
// const device = new YeeDevice({host: "192.168.88.203", port: 55443})
// device.connect()
// device.on('deviceUpdate', (newProps) => {
//     console.log(newProps)
// })
// device.on('connected', () => {
//     device.sendCommand({
//         id: -1,
//         method: 'set_power',
//         params: ["off", 'smooth', 1000]
//     })
// })
// bathCeilingLight.on('connected', () => {
//     bathCeilingLight.sendCommand({
//         id: -1,
//         method: 'set_power',
//         params: ['on', 'smooth', 1000],
//     });
// });

const bathCeilingLight = new Device({ host: DEVICE_NAME_TO_ID[BATHROOM_CEILING_LIGHT], port: 55443 });
bathCeilingLight.connect();

const toiletCeilingLight = new Device({ host: DEVICE_NAME_TO_ID[TOILET_CEILING_LIGHT], port: 55443 });
toiletCeilingLight.connect();

const bedroomCeilingLight = new Device({ host: DEVICE_NAME_TO_ID[BEDROOM_CEILING_LIGHT], port: 55443 });
bedroomCeilingLight.connect();

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


async function asyncTimeout(timeout: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}

class Fifo {
    #maxLength = 20;
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
        return this.#queue.length
    }
    reset(): void {
        this.#queue = [];
    }
    full(): boolean {
        return this.length() === this.#maxLength;
    }
}

const queue01 = new Fifo(TV_POWER_PLUG);

function playAlertSigle() {
    return new Promise((resolve, reject) => {
        exec(`mpg123 ./siren.mp3`, (error, stdout, stderr) => {
            if (error) reject(error);
            resolve([stdout, stderr]);
        });
    });
}

class Alerter {
    static repeats = 0;
    static maxRepeats = 15;
    static enabled: boolean;
    static playing: boolean;
    static async on() {
        Alerter.repeats = 0;
        Alerter.enabled = true;
        while (Alerter.enabled && !Alerter.playing && Alerter.repeats < Alerter.maxRepeats) {
            Alerter.playing = true;
            try {
                console.log(`Playing alert sound, repeat #${Alerter.repeats + 1}...`);
                await playAlertSigle();
                console.log(`Succeeded`);
                Alerter.playing = false;
            } catch (e) {
                console.log(`Playing failed`);
                Alerter.playing = false;
            }
            Alerter.repeats += 1;
            if (Alerter.repeats === Alerter.maxRepeats) {
                console.log(`Max repeats reached`);
            }
            await asyncTimeout(1000);
        }
    }
    static state() {
        return this.enabled;
    }
    static off() {
        Alerter.repeats = 0;
        Alerter.enabled = false;
    }
}

const leakageSensorHandler: IMqttMessageDispatcherHandler = ({ json, deviceName }) => {
    if (json.water_leak) {
        if (!Alerter.state()) {
            Alerter.on();
            const msg = `Leakage detected for "${deviceName}"! Alert on.`;
            console.log(msg);
            bot.sendMessage(config.telegram.chatId, msg);
        }
    } else {
        if (Alerter.state()) {
            Alerter.off();
            const msg = `Leakage warning ceased for "${deviceName}". Alert off.`;
            console.log(msg);
            bot.sendMessage(config.telegram.chatId, msg);
        }
    }
}

setInterval(() => {
    mqttClient.publish(`zigbee2mqtt/${DEVICE_NAME_TO_ID[TV_POWER_PLUG]}/get/state`, ""/* JSON.stringify({ "power": "" }) */);
}, 30000);

mqttMessageDispatcher(mqttClient, [
    // todo
    [
        TV_POWER_PLUG, ({ json }) => {
            // console.log(json);
            // if (json?.state === 'OFF') {
            //     console.log('Already switched off');
            //     return;
            // }
            if (json?.power) {
                queue01.push(json.power);
                const meanValue = mean(queue01.get());
                const stdDevValue = stdDev(queue01.get());
                console.log(queue01.toString(), queue01.get(), { stdDevValue, meanValue });
                if (queue01.full() && meanValue < 5) {
                    mqttClient.publish(`${DEVICE_NAME_TO_ID[AUDIOENGINE_POWER_PLUG]}/set/state`, "off");
                }
                // if (queue01.length() > 2 && meanValue >= 5) {
                //     mqttClient.publish(`${DEVICE_NAME_TO_ID[AUDIOENGINE_POWER_PLUG]}/set/state`, "on");
                // }
                // if (queue01.length() > 10 && result < 0.02) {
                //     mqttClient.publish(`${DEVICE_NAME_TO_ID[AUDIOENGINE_POWER_PLUG]}/set/state`, "off");
                //     queue01.reset();
                // }
            }
        }
    ],

    // play alert if leakage sensors turn their state to water_leak
    [LEAKAGE_SENSOR_KITCHEN, leakageSensorHandler],
    [LEAKAGE_SENSOR_BATHROOM, leakageSensorHandler],
    [LEAKAGE_SENSOR_TOILET, leakageSensorHandler],

    // swich bedroom ceiling light on/off
    [
        SWITCH_1, ({ json }) => {
            if(json.action === 'single_left') {
                bedroomCeilingLight.sendCommand({
                    id: -1,
                    method: 'set_power',
                    params: ['on', 'smooth', 0],
                });
            }
            if(json.action === 'single_right') {
                bedroomCeilingLight.sendCommand({
                    id: -1,
                    method: 'set_power',
                    params: ['off', 'smooth', 0],
                });
            }
        }
    ]
]);

// [
//     "zigbee2mqtt", function(topic, json, timestamp) {
//         // console.log({ topic, json, timestamp });
//         // console.log(topic, JSON.stringify(json));
//     }
// ],
// [
//     "zigbee2mqtt/0x00158d0003a010a5", function(topic: string, json: IAqaraPowerPlugMessage | null, timestamp: number) {
//         console.log(topic, JSON.stringify(json));
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