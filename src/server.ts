/* eslint-disable no-underscore-dangle */
/* eslint-disable no-lonely-if */

import 'src/http';

import config from 'config';
import Debug from 'debug';

import {
    ActionsExecutor,
    mapping,
    supportedOutputActions,
} from 'src/automation-engine';
import bot, { botSendButtons } from 'src/bot';
import {
    BEDROOM_CEILING_LIGHT,
    DEVICE_CUSTOM_ATTRIBUTE_NAME,
    DEVICE_NAME_TO_ID,
    IKEA_400LM_LED_BULB,
    IKEA_ONOFF_SWITCH,
    KITCHEN_CEILING_LIGHT,
    KITCHEN_UNDERCABINET_LIGHT,
    KITCHEN_VALVES_MANIPULATOR,
    LEAKAGE_SENSOR_BATHROOM,
    LEAKAGE_SENSOR_KITCHEN,
    LEAKAGE_SENSOR_TOILET,
    TOILET_VALVES_MANIPULATOR,
    WALL_SWITCH_BEDROOM,
    WALL_SWITCH_KITCHEN,
} from 'src/constants';
import {
    createOrUpdateSonoffDevice,
    createOrUpdateZigbeeDevice,
    insertIntoDeviceCustomAttributes,
    insertIntoValveStatusMessages,
    insertIntoZigbeeDevices,
} from 'src/db';
import log, { withDebug } from 'src/logger';
import updatesChannel from 'src/mdns';
import mqttClient from 'src/mqttClient';
import {
    Alerter,
    asyncTimeout,
    getAppUrl,
    mqttMessageDispatcher,
    postSonoffSwitchMessage,
    saveGraphvizNetworkmap,
    yeelightDeviceSetPower,
} from 'src/utils';

// import yeelightDevices from 'src/yeelightDevices';

const debug = Debug('mhz19-server');

const actionsExecutor = new ActionsExecutor({
    mapping,
    supportedOutputActions,
    supportedAdapters: {
        Mqtt: () => mqttClient,
        Sonoff: () => postSonoffSwitchMessage,
        Yeelight: () => yeelightDeviceSetPower,
    }
});

updatesChannel.on('update', (devicesMap: TSonoffDevicesMap) => {
    Array.from(devicesMap.values()).forEach(device => {
        createOrUpdateSonoffDevice(device);
    });
});

// const deviceCustomAttributes: Array<[string, TDeviceCustomAttribute, string]> = [
//     ['0x00000000064c5293', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Bedroom Ceiling Light'],
//     ['0x0000000003b6cd80', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Toilet Ceiling Light'],
//     ['0x0000000003b6cf16', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Bathroom Ceiling Light'],
//     ['0x00158d000405811b', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Leakage Sensor Bathroom'],
//     ['0x00158d0004035e3e', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Leakage Sensor Kitchen'],
//     ['0x00158d00040356af', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Leakage Sensor Toilet'],
//     ['0x00158d00042446ec', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Bedroom Switch'],
//     ['0x00158d0004244bda', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Kitchen Switch'],
//     ['10011cec96', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Kitchen Undercabinet Light'],
//     ['10011c1eeb', DEVICE_CUSTOM_ATTRIBUTE_NAME, 'Kitchen Ceiling Light'],
// ];

// deviceCustomAttributes.forEach(([deviceId, attributeType, value]) => {
//     insertIntoDeviceCustomAttributes({ deviceId, attributeType, value });
// });

function handleLeakage(leakage?: boolean, deviceName?: string): void {
    const appUrl = getAppUrl();
    if (leakage) {
        mqttClient.publish(`/VALVE/${KITCHEN_VALVES_MANIPULATOR}/STATE/SET`, "close");
        mqttClient.publish(`/VALVE/${TOILET_VALVES_MANIPULATOR}/STATE/SET`, "close");
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
}

const leakageSensorHandler: IMqttMessageDispatcherHandler<IAqaraWaterSensorMessage> = ({
    deviceId, timestamp, json, deviceName
}) => {
    handleLeakage(json?.water_leak, deviceName);
};

// const kitchenSwitchHandler: IMqttMessageDispatcherHandler<IWallSwitchMessage> = async ({ json }) => {
//     // switch all on
//     if (json?.action === 'single_left') {
//         postSonoffSwitchMessage("on", DEVICE_NAME_TO_ID[KITCHEN_CEILING_LIGHT]);
//         postSonoffSwitchMessage("on", DEVICE_NAME_TO_ID[KITCHEN_UNDERCABINET_LIGHT]);
//     }
//     // switch all off
//     if (json?.action === 'single_right') {
//         postSonoffSwitchMessage("off", DEVICE_NAME_TO_ID[KITCHEN_CEILING_LIGHT]);
//         postSonoffSwitchMessage("off", DEVICE_NAME_TO_ID[KITCHEN_UNDERCABINET_LIGHT]);
//     }
//     // switch ceiling lights off
//     if (json?.action === 'hold_left') {
//         postSonoffSwitchMessage("off", DEVICE_NAME_TO_ID[KITCHEN_CEILING_LIGHT]);
//     }
//     // switch undercabinet lights off
//     if (json?.action === 'hold_right') {
//         postSonoffSwitchMessage("off", DEVICE_NAME_TO_ID[KITCHEN_UNDERCABINET_LIGHT]);
//     }
// };

// const bedroomSwitchHandler: IMqttMessageDispatcherHandler<IWallSwitchMessage> = ({ timestamp, deviceId, json }) => {
//     if (json?.action === 'single_left') {
//         yeelightDeviceSetPower(DEVICE_NAME_TO_ID[BEDROOM_CEILING_LIGHT], 'on');
//     }
//     if (json?.action === 'single_right') {
//         yeelightDeviceSetPower(DEVICE_NAME_TO_ID[BEDROOM_CEILING_LIGHT], 'off');
//     }
//     // postIkeaLedBulb('on');
//     // postIkeaLedBulb('off');
//     // const bedroomCeilingLightDeviceId = DEVICE_NAME_TO_ID[BEDROOM_CEILING_LIGHT];
//     // const bedroomCeilingLight = yeelightDevices.get(bedroomCeilingLightDeviceId);
//     // if (!bedroomCeilingLight) {
//     //     bot.sendMessage(
//     //         config.telegram.chatId,
//     //         `yeelightDevice ${bedroomCeilingLightDeviceId} (${BEDROOM_CEILING_LIGHT}) is not registered`
//     //     );
//     //     return;
//     // }
// };

// const ikeaOnoffSwitchHandler: IMqttMessageDispatcherHandler<IIkeaOnoffSwitchMessage> = ({ deviceId, json }) => {
//     if (json?.action === 'on' || json?.action === 'off') {
//         mqttClient.publish(`zigbee2mqtt/0x00158d000391f252/set/state`, json.action);
//         mqttClient.publish(`zigbee2mqtt/0x00158d0003a010a5/set/state`, json.action);
//         // postBedroomCeilingLightMessage(json.action);
//         // postIkeaLedBulb(json.action);
//     }
// };

const bridgeDevicesHandler: IMqttMessageDispatcherHandler<Array<IZigbee2MqttBridgeDevice>> = ({ json }) => {
    const devices = json;
    if (devices?.length) {
        devices.forEach(device => {
            createOrUpdateZigbeeDevice(device);
            // if (device.friendly_name !== 'Coordinator') {
            //     insertIntoZigbeeDevices(device);
            // }
        });
    }
};

const zigbee2mqttBridgeResponseNetworkmapHandler: IMqttMessageDispatcherHandler = async ({ json }) => {
    log.info("saving network map...");
    if (json?.data?.type === 'graphviz') {
        await saveGraphvizNetworkmap(json.data.value);
    }
    log.info("network map saved");
};

const valveStateStatusHandler: IMqttMessageDispatcherHandler = (payload) => {
    const { timestamp, json } = payload;
    if (json) {
        handleLeakage(json.leakage, 'valves-manipulator-box');
        insertIntoValveStatusMessages(
            timestamp,
            json,
        );
    }
};

const zigbee2MqttWildcardHandler: IMqttMessageDispatcherHandler = ({ deviceId, json }) => {
    if (deviceId) {
        actionsExecutor.handleZigbeeMessage(deviceId, json);
    }
};

mqttMessageDispatcher(mqttClient, [

    // handle status messages from valves manipulator box
    [`/VALVE/${KITCHEN_VALVES_MANIPULATOR}/STATE/STATUS`, valveStateStatusHandler],
    [`/VALVE/${TOILET_VALVES_MANIPULATOR}/STATE/STATUS`, valveStateStatusHandler],

    // devices connected to the bridge
    // see https://www.zigbee2mqtt.io/guide/usage/mqtt_topics_and_messages.html#zigbee2mqtt-bridge-devices
    ['zigbee2mqtt/bridge/devices', bridgeDevicesHandler],

    // rsponse to "zigbee2mqtt/bridge/request/networkmap" command
    ['zigbee2mqtt/bridge/response/networkmap', zigbee2mqttBridgeResponseNetworkmapHandler],

    // play alert and sent telegram message when leakage sensors turn their water_leak state
    [LEAKAGE_SENSOR_KITCHEN, leakageSensorHandler],
    [LEAKAGE_SENSOR_BATHROOM, leakageSensorHandler],
    [LEAKAGE_SENSOR_TOILET, leakageSensorHandler],

    // connect ActionsExecutor
    ['zigbee2mqtt', zigbee2MqttWildcardHandler],

], [
    'zigbee2mqtt/bridge/logging'
]);

// switch bedroom ceiling light on/off
// [WALL_SWITCH_BEDROOM, bedroomSwitchHandler],

// switch kitchen working lights on/off
// [WALL_SWITCH_KITCHEN, kitchenSwitchHandler],

// handle messages from tradfri on/off switch
// [IKEA_ONOFF_SWITCH, ikeaOnoffSwitchHandler],

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

// const bathCeilingLight = new Device({ host: DEVICE_NAME_TO_ID[BATHROOM_CEILING_LIGHT], port: 55443 });
// bathCeilingLight.connect();
// const toiletCeilingLight = new Device({ host: DEVICE_NAME_TO_ID[TOILET_CEILING_LIGHT], port: 55443 });
// toiletCeilingLight.connect();
// const bedroomCeilingLight = new Device({ host: DEVICE_NAME_TO_ID[BEDROOM_CEILING_LIGHT], port: 55443 });
// bedroomCeilingLight.connect();
