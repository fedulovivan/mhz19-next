import Express from 'express';
import SocketIo from 'socket.io';
import mqtt from 'mqtt';
import http from 'http';
import debug from 'debug';

import last from 'lodash/last';

import restApi from './rest-api';

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
    PUBLIC_PATH,
    MQTT_USERNAME,
    MQTT_PASSWORD,
    MQTT_HOST,
    MQTT_PORT,
    DB_ZIGBEE_DEVICES,
} from './constants';

const START_TIME = (new Date()).valueOf();

const debuglog = debug('mhz19');

const express = Express();
const httpServer = new http.Server(express);

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
    // query coordinator for the list of connected devices
    mqttClient.publish('zigbee2mqtt/bridge/config/devices/get', '');
});

mqttClient.on('message', async function (topic, message) {
    debuglog('\ntopic:', topic);
    const raw = message.toString();
    let json = null;
    const timestamp = (new Date).valueOf();
    try {
        json = JSON.parse(raw);
        debuglog('json:', json);
    } catch(e) {
        debuglog('string:', raw);
    }
    if (json && topic.startsWith('zigbee2mqtt')) {
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
    }
    if (json && topic.startsWith('homeassistant')) {
        insertHomeassistantDoc({
            topic,
            timestamp,
            ...json,
        });
        return;
    }
    if (json && topic === '/ESP/MH/DATA') {
        const doc = {
            timestamp,
            ...json,
        };
        insertMhzDoc(doc);
        socketIo.sockets.emit('mhzDoc', doc);
        return;
    }
    console.error('unknown topic:', topic, raw);
});

express.use(Express.static(PUBLIC_PATH));

express.use(restApi);

httpServer.listen(APP_PORT, () => {
    debuglog(`listening on ${APP_HOST}:${APP_PORT}`)
    const browserLink = `http://${APP_HOST}:${APP_PORT}/`;
    debuglog(`open browser at ${browserLink}`)
});

async function mhzDocsQueryAndEmit(socket: SocketIo.Socket, historyOption: number) {
    try {

        // console.time('mqttFind');
        // console.timeEnd('mqttFind');

        const response = await queryMhzDocs(historyOption);

        const response2 = await find(
            DB_ZIGBEE_DEVICES,
            { selector: { timestamp: { "$gt": START_TIME } } }
        );

        socket.emit('bootstrap', {
            mhzDocs: response.docs,
            zigbeeDevices: last(response2.docs).message,
        });

    } catch (e) {
        socket.emit('bootstrap', {
            error: e.message
        });
        debuglog(`mqtt.find failed: ${e.message}`);
    }
}

socketIo.on('connection', async function(socket) {

    debuglog(`new ws connection id=${socket.id}`);

    mhzDocsQueryAndEmit(socket, parseInt(socket.handshake.query.historyOption, 10));

    socket.on('disconnect', () => {
        debuglog(`ws id=${socket.id} disconnected`);
    });

    socket.on('queryMhzDocs', (historyOption) => {
        debuglog(`queryMhzDocs received`, historyOption);
        mhzDocsQueryAndEmit(socket, parseInt(historyOption, 10));
    });

});
