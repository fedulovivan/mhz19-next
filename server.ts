
import SocketIo from 'socket.io';
import mqtt from 'mqtt';
import Debug from 'debug';
import last from 'lodash/last';
import httpServer from './http';

import {
    mqttMessageDispatcher
} from './utils';

import {
    insertMhzDoc,
    insertHomeassistantDoc,
    insertZigbeeDeviceDoc,
    queryMhzDocs,
    insert,
    find,
} from './db'

import {
    APP_HOST,
    APP_PORT,
    MQTT_USERNAME,
    MQTT_PASSWORD,
    MQTT_HOST,
    MQTT_PORT,
    DB_ZIGBEE_DEVICES,
} from './constants';

const debug = Debug('mhz19-root');

const START_TIME = (new Date()).valueOf();

const socketIo = SocketIo(httpServer, { origins: `http://${APP_HOST}:${APP_PORT}` });

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
    // ask zigbee2mqtt coordinator for the list of known connected devices
    mqttClient.publish('zigbee2mqtt/bridge/config/devices/get', '');
});

mqttMessageDispatcher(mqttClient, debug, {

    'zigbee2mqtt': function(topic, json, timestamp, raw) {
        if (!json) return;
        if (topic === 'zigbee2mqtt/bridge/log' && json.type === 'devices') {
            insert(DB_ZIGBEE_DEVICES, {
                timestamp,
                ...json
            });
            return;
        }
        insertZigbeeDeviceDoc({
            topic,
            timestamp,
            ...json,
        });
        const deviceState = topic.match(/^zigbee2mqtt\/(0x\w+)$/);
        if (deviceState) {
            const friendly_name = deviceState[1];
            socketIo.sockets.emit('deviceState', {
                friendly_name,
                timestamp,
                ...json,
            });
        }
        return;
    },

    'homeassistant': function(topic, json, timestamp, raw) {
        insertHomeassistantDoc({
            topic,
            timestamp,
            ...json,
        });
        return;
    },

    '/ESP/MH/DATA': function(topic, json, timestamp, raw) {
        const doc: IMhzDoc = {
            timestamp,
            ...json,
        };
        insertMhzDoc(doc);
        socketIo.sockets.emit('mhzDoc', doc);
        return;
    }

});

async function mhzDocsQueryAndEmit(socket: SocketIo.Socket, historyOption: number) {
    try {
        const mhzDocsResponse = await queryMhzDocs(historyOption);
        const zigbeeDocsResponse = await find<IZigbeeDeviceDoc>(
            DB_ZIGBEE_DEVICES,
            { selector: { timestamp: { "$gt": START_TIME } } }
        );
        const lastZigbeeDoc = last(zigbeeDocsResponse.docs);
        socket.emit('bootstrap', {
            mhzDocs: mhzDocsResponse.docs,
            zigbeeDevices: lastZigbeeDoc && lastZigbeeDoc.message,
        });
    } catch (e) {
        socket.emit('bootstrap', {
            error: e.message
        });
        debug(`mqtt.find failed: ${e.message}`);
    }
}

socketIo.on('connection', async function(socket) {
    debug(`new ws connection id=${socket.id}`);
    mhzDocsQueryAndEmit(socket, parseInt(socket.handshake.query.historyOption, 10));
    socket.on('disconnect', () => {
        debug(`ws id=${socket.id} disconnected`);
    });
    socket.on('queryMhzDocs', (historyOption) => {
        debug(`queryMhzDocs received`, historyOption);
        mhzDocsQueryAndEmit(socket, parseInt(historyOption, 10));
    });
});
