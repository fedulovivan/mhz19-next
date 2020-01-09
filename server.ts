
import mqtt from 'mqtt';
import Debug from 'debug';
import httpServer from './http';
import RpcServer from './rpc/rpcServer';
import { METHOD_GET_BOOTSTRAP_DATA, METHOD_ADD_MHZ_DOC, METHOD_SET_DEVICE_STATE } from './rpc';

import {
    mqttMessageDispatcher
} from './utils';

import {
    insertMhzDoc,
    insertHomeassistantDoc,
    insertZigbeeDeviceDoc,
    queryMhzDocs,
    find,
} from './db';

import {
    MQTT_USERNAME,
    MQTT_PASSWORD,
    MQTT_HOST,
    MQTT_PORT,
    DB_ZIGBEE_DEVICE_MESSAGES,
} from './constants';

// const TelegramBot = require('node-telegram-bot-api');
// const debug = Debug('mhz19-root');

const START_TIME = (new Date()).valueOf();

const rpcServer = new RpcServer(httpServer);

let zigbeeDevices: Array<IZigbeeDeviceRegistrationInfo> = [];

rpcServer.respondTo(METHOD_GET_BOOTSTRAP_DATA, async (requestPayload: object) => {
    const { historyOption } = requestPayload as any;
    const mhzDocsResponse = await queryMhzDocs(historyOption);
    const { docs: zigbeeDevivesMessages } = await find<IAqaraWaterSensorMessage>(
        DB_ZIGBEE_DEVICE_MESSAGES, {
            selector: {
                topic: {
                    // eslint-disable-next-line
                    $regex: "zigbee2mqtt/0x[a-z0-9]+"
                },
                timestamp: { $gt: START_TIME - 3600 * 24 * 1000 },
            },
            limit: 999,
        }
    );
    return {
        mhzDocs: mhzDocsResponse.docs,
        zigbeeDevivesMessages,
        zigbeeDevices,
    };
});

const mqttClient = mqtt.connect(`mqtt://${MQTT_HOST}:${MQTT_PORT}`, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
});

mqttClient.on('connect', async function () {
    mqttClient.subscribe([
        'zigbee2mqtt/#',
        'homeassistant/#',
        '/ESP/MH/DATA',
        // '/ESP/MH/CO2',
        // '/ESP/MH/CO2',
        // '/ESP/MH/DEBUG',
    ]);
    // ask zigbee2mqtt coordinator for the list of paired devices
    mqttClient.publish('zigbee2mqtt/bridge/config/devices/get', '');
});

mqttMessageDispatcher(mqttClient, {

    // zigbee2mqtt
    zigbee2mqtt: function(topic, json, timestamp) {

        if (!json) return;

        if (topic === 'zigbee2mqtt/bridge/log' && (json as any).type === 'devices') {
            // list of registered zigbee devices received in respond to zigbee2mqtt/bridge/config/devices/get
            zigbeeDevices = (json as any).message;
        } else {
            // either message from device or message from zigbee2mqtt/bridge/config
            insertZigbeeDeviceDoc({
                topic,
                timestamp,
                ...json,
            });
        }

        // message from device
        const deviceState = topic.match(/^zigbee2mqtt\/(0x\w+)$/);
        if (deviceState) {
            const friendly_name = deviceState[1];
            rpcServer.call(METHOD_SET_DEVICE_STATE, {
                friendly_name,
                timestamp,
                ...json,
            });
        }
    },

    // homeassistant
    homeassistant: function(topic, json, timestamp, raw) {
        insertHomeassistantDoc({
            topic,
            timestamp,
            ...json,
        });
    },

    // /ESP/MH/DATA
    '/ESP/MH/DATA': function(topic, json, timestamp, raw) {
        const doc: IMhzDoc = {
            timestamp,
            ...json,
        };
        insertMhzDoc(doc);
        rpcServer.call(METHOD_ADD_MHZ_DOC, doc);
    }

});
