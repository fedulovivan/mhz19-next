import 'src/httpServer';

import {
    ActionsExecutor,
    mappings,
    supportedOutputActions,
} from 'src/automation-engine';
import bot from 'src/bot';
// import {
//     createOrUpdateSonoffDevice,
//     createOrUpdateZigbeeDevice,
//     fetchDeviceCustomAttributes,
//     insertIntoValveStatusMessages,
// } from 'src/db';
import {
    DEVICE,
    DEVICE_CUSTOM_ATTRIBUTE_LAST_SEEN_FOR_BOT_NOTIFY,
    DEVICE_NAME,
    DeviceClass,
    LAST_SEEN_FOR_BOT_NOTIFY,
} from 'src/constants';
import Device from 'src/db/Device';
import model from 'src/db/Device';
import type { IDeviceCustomAttributeModel } from 'src/db/DeviceCustomAttribute';
import DeviceCustomAttribute from 'src/db/DeviceCustomAttribute';
import Message from 'src/db/Message';
import * as lastDeviceState from 'src/lastDeviceState';
import { withDebug } from 'src/logger';
import mdns from 'src/mdns';
import mqttClient from 'src/mqttClient';
import type {
    IMqttMessageDispatcherHandler,
    IZigbee2MqttBridgeDevice,
    TSonoffDevicesMap,
} from 'src/typings';
import {
    getChatId,
    mqttMessageDispatcher,
    notNil,
    saveGraphvizNetworkmap,
} from 'src/utils';

const debug = withDebug('server');

const lastSeenTimers: Map<DEVICE, NodeJS.Timeout> = new Map();

let deviceCustomAttributes: Array<IDeviceCustomAttributeModel>;

/**
 * some zigbee devices do not bother sending periodic updates,
 * so there is no sence to monitor their last seen status
 */
const LAST_SEEN_BLACKLIST = [
    DEVICE.IKEA_ONOFF_SWITCH,
    DEVICE.LIFE_CONTROL_DOOR_SENSOR_NEW,
    DEVICE.APPLE_COLLECTION_DOOR,
    DEVICE.STORAGE_ROOM_DOOR,
    DEVICE.SPARE_POWER_PLUG,    
];

const LAST_SEEN_WHITELIST = [
    DEVICE.TOILET_VALVES_MANIPULATOR,
    DEVICE.KITCHEN_VALVES_MANIPULATOR,
    DEVICE.LEAKAGE_SENSOR_BATHROOM,
    DEVICE.LEAKAGE_SENSOR_KITCHEN,
    DEVICE.LEAKAGE_SENSOR_TOILET,
    DEVICE.STORAGE_ROOM_CEILING_LIGHT,
    DEVICE.STORAGE_ROOM_DOOR,
    DEVICE.MOVEMENT_SENSOR,
    DEVICE.APPLE_COLLECTION_DOOR,
];

bot.sendMessage(getChatId(), "Application started");

// fetchDeviceCustomAttributes().then(result => {
DeviceCustomAttribute.findAll().then(result => {
    // save fetched attributes
    deviceCustomAttributes = result;
    // launch timers on startup
    // so we dont need to capture first device message to trigger trackLastSeenAndNotify loop
    LAST_SEEN_WHITELIST.forEach(deviceId => {
        trackLastSeenAndNotify(deviceId);
    });
});

async function trackLastSeenAndNotify(deviceId: DEVICE) {
    if (LAST_SEEN_BLACKLIST.includes(deviceId)) return;
    if (lastSeenTimers.has(deviceId)) {
        clearTimeout(lastSeenTimers.get(deviceId)!);
    }
    const attr = deviceCustomAttributes.find(item => (
        item.dataValues.device_id === deviceId
        && item.dataValues.attribute_type === 'DEVICE_CUSTOM_ATTRIBUTE_LAST_SEEN_FOR_BOT_NOTIFY'
    ));
    const timeout = notNil(attr?.dataValues?.value) ? parseInt(attr.dataValues.value, 10) : LAST_SEEN_FOR_BOT_NOTIFY;
    // const timeout = (
    //     deviceCustomAttributes?.[deviceId]?.[DEVICE_CUSTOM_ATTRIBUTE_LAST_SEEN_FOR_BOT_NOTIFY]
    //     ?? LAST_SEEN_FOR_BOT_NOTIFY
    // );
    lastSeenTimers.set(
        deviceId,
        setTimeout(
            function() {
                bot.sendMessage(getChatId(), `Have not seen ${DEVICE_NAME[deviceId] ?? deviceId} for a while...`);
                trackLastSeenAndNotify(deviceId);
            },
            timeout,
        ),
    );
}

export const actionsExecutor = new ActionsExecutor({
    mappings,
    supportedOutputActions,
    // supportedAdapters: {
    //     Mqtt: () => mqttClient,
    //     Sonoff: () => postSonoffSwitchMessage,
    //     Yeelight: () => yeelightDeviceSetPower,
    //     Telegram: () => (msg: string) => sendTelegramMessageTrottled(msg),
    // }
});

mdns.on('update', (devicesMap: TSonoffDevicesMap) => {

    // const models = Array.from(devicesMap.values()).map(device => {
    //     return {
    //         device_id: device.id,
    //         device_class: DeviceClass.SONOFF,
    //         json: device,
    //     };
    // });
    // Device.bulkCreate(models, { updateOnDuplicate: ['device_id'] });

    Array.from(devicesMap.values()).forEach(device => {
        Device.upsert({
            device_id: device.id,
            device_class: DeviceClass.SONOFF,
            json: device,
        });
    });

});

function handleLeakage(leakage: boolean, deviceName: string): void {
    // const appUrl = getAppUrl();
    if (leakage) {
        mqttClient.publish(`/VALVE/${DEVICE.KITCHEN_VALVES_MANIPULATOR}/STATE/SET`, "close");
        mqttClient.publish(`/VALVE/${DEVICE.TOILET_VALVES_MANIPULATOR}/STATE/SET`, "close");
        // if (!Alerter.isRaised()) {
        //     Alerter.on();
        //     const msg = `Leakage detected for "${deviceName}"! Alert on.\n${appUrl}`;
        //     bot.sendMessage((config as unknown as IConfig).telegram.chatId, msg);
        //     botSendButtons((config as unknown as IConfig).telegram.chatId);
        //     debug(msg);
        // }
    }/*  else {
        if (Alerter.isRaised()) {
            Alerter.off();
            const msg = `Leakage warning ceased for "${deviceName}". Alert off.\n${appUrl}`;
            bot.sendMessage((config as unknown as IConfig).telegram.chatId, msg);
            botSendButtons((config as unknown as IConfig).telegram.chatId);
            debug(msg);
        }
    } */
}

// const leakageSensorHandler: IMqttMessageDispatcherHandler<IAqaraWaterSensorMessage> = ({
//     deviceId, timestamp, json
// }) => {
//     // debug('leakageSensorHandler');
//     handleLeakage(json?.water_leak!!, DEVICE_NAME[deviceId]);
// };

const bridgeDevicesHandler: IMqttMessageDispatcherHandler<Array<IZigbee2MqttBridgeDevice>> = ({ json }) => {
    const devices = json;
    if (devices?.length) {

        // const models = devices
        //     .filter(devices => devices.friendly_name !== 'Coordinator')
        //     .map(device => {
        //         return {
        //             device_id: device.friendly_name,
        //             device_class: DeviceClass.ZIGBEE,
        //             json: device,
        //         };
        //     });
        // Device.bulkCreate(models, { updateOnDuplicate: ['device_id'] });

        devices.forEach(device => {
            if (device.friendly_name !== 'Coordinator') {
                Device.upsert({
                    device_id: device.friendly_name,
                    device_class: DeviceClass.ZIGBEE,
                    json: device,
                });
            }
        });
    }
};

const zigbee2mqttBridgeResponseNetworkmapHandler: IMqttMessageDispatcherHandler = async ({ json }) => {
    // debug('zigbee2mqttBridgeResponseNetworkmapHandler');
    if (json?.data?.type === 'graphviz') {
        debug("saving network map...");
        await saveGraphvizNetworkmap(json.data.value);
        debug("network map saved");
    }
};

const valveStateStatusHandler: IMqttMessageDispatcherHandler = (payload) => {
    const { timestamp, json } = payload;
    if (json) {
        handleLeakage(json.leakage, 'Valves manipulator box');
        lastDeviceState.set(String(json.chipid) as DEVICE, json);
        trackLastSeenAndNotify(String(json.chipid) as DEVICE);
        Message.create({
            device_id: String(json.chipid),
            json,
        });
        // insertIntoValveStatusMessages(
        //     timestamp,
        //     json,
        // );
    }
};

const zigbee2MqttWildcardHandler: IMqttMessageDispatcherHandler = ({
    fullTopic,
    json,
    timestamp,
    rawMessage,
    deviceId,
}) => {
    // debug('zigbee2MqttWildcardHandler');
    // debug({
    //     fullTopic,
    //     json,
    //     timestamp,
    //     rawMessage,
    //     deviceId,
    // });
    if (deviceId && json) {
        trackLastSeenAndNotify(deviceId);
        actionsExecutor.handleZigbeeMessage(deviceId, json);
    }
};

const EXCLUDED_TOPICS = ['zigbee2mqtt/bridge/logging'];

mqttMessageDispatcher(
    mqttClient,
    [

        // handle status messages from valves manipulator box
        [`/VALVE/${DEVICE.KITCHEN_VALVES_MANIPULATOR}/STATE/STATUS`, valveStateStatusHandler],
        [`/VALVE/${DEVICE.TOILET_VALVES_MANIPULATOR}/STATE/STATUS`, valveStateStatusHandler],

        // devices connected to the bridge
        // see https://www.zigbee2mqtt.io/guide/usage/mqtt_topics_and_messages.html#zigbee2mqtt-bridge-devices
        ['zigbee2mqtt/bridge/devices', bridgeDevicesHandler],

        // rsponse to "zigbee2mqtt/bridge/request/networkmap" command
        ['zigbee2mqtt/bridge/response/networkmap', zigbee2mqttBridgeResponseNetworkmapHandler],

        // play alert and sent telegram message when leakage sensors turn their water_leak state
        // [DEVICE.LEAKAGE_SENSOR_KITCHEN, leakageSensorHandler],
        // [DEVICE.LEAKAGE_SENSOR_BATHROOM, leakageSensorHandler],
        // [DEVICE.LEAKAGE_SENSOR_TOILET, leakageSensorHandler],

        // connect ActionsExecutor
        ['zigbee2mqtt/0x', zigbee2MqttWildcardHandler],

    ],
    EXCLUDED_TOPICS,
);

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
//                 debug(`mean power for apple tv is ${meanPower}w, threshold ${powerThreshold}w, automatically switching on audioengine speakers`);
//                 mqttClient.publish(`zigbee2mqtt/${DEVICE_NAME_TO_ID[AUDIOENGINE_POWER_PLUG]}/set/state`, "on");
//                 lastStates[TV_POWER_PLUG] = "on";
//             }
//             if (appleTvLastPowerValues.full() && meanPower < powerThreshold && lastStates[TV_POWER_PLUG] !== "off") {
//                 debug(`mean power for apple tv is ${meanPower}w, threshold ${powerThreshold}w, automatically switching off audioengine speakers`);
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
//         // console.debug({ topic, json, timestamp });
//         // console.debug(topic, JSON.stringify(json));
//     }
// ],
// [
//     "zigbee2mqtt/0x00158d0003a010a5", function(topic: string, json: IAqaraPowerPlugMessage | null, timestamp: number) {
//         console.debug(topic, JSON.stringify(json));
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
// console.debug(queue01.toString(), queue01.get(), { stdDevValue, meanValue });

// const bathCeilingLight = new Device({ host: DEVICE_NAME_TO_ID[BATHROOM_CEILING_LIGHT], port: 55443 });
// bathCeilingLight.connect();
// const toiletCeilingLight = new Device({ host: DEVICE_NAME_TO_ID[TOILET_CEILING_LIGHT], port: 55443 });
// toiletCeilingLight.connect();
// const bedroomCeilingLight = new Device({ host: DEVICE_NAME_TO_ID[BEDROOM_CEILING_LIGHT], port: 55443 });
// bedroomCeilingLight.connect();

// const kitchenSwitchHandler: IMqttMessageDispatcherHandler<IWallSwitchMessage> = async ({ json }) => {
//     // switch all on
//     if (json?.action === 'single_left') {
//         postSonoffSwitchMessage("on", DEVICE_NAME_TO_ID[KITCHEN_CEILING_LIGHT]);
//         postSonoffSwitchMessage("on", DEVICE_NAME_TO_ID[STORAGE_ROOM_VENT]);
//     }
//     // switch all off
//     if (json?.action === 'single_right') {
//         postSonoffSwitchMessage("off", DEVICE_NAME_TO_ID[KITCHEN_CEILING_LIGHT]);
//         postSonoffSwitchMessage("off", DEVICE_NAME_TO_ID[STORAGE_ROOM_VENT]);
//     }
//     // switch ceiling lights off
//     if (json?.action === 'hold_left') {
//         postSonoffSwitchMessage("off", DEVICE_NAME_TO_ID[KITCHEN_CEILING_LIGHT]);
//     }
//     // switch undercabinet lights off
//     if (json?.action === 'hold_right') {
//         postSonoffSwitchMessage("off", DEVICE_NAME_TO_ID[STORAGE_ROOM_VENT]);
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
//     //         (config as unknown as IConfig).telegram.chatId,
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
