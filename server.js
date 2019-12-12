import Express from 'express';
import SocketIo from 'socket.io';
import Mqtt from 'mqtt';
import http from 'http';
import debug from 'debug';
import nano from 'nano';

import {
    APP_HOST,
    APP_PORT,
    PUBLIC_PATH,
    MQTT_USERNAME,
    MQTT_PASSWORD,
    MQTT_HOST,
    MQTT_PORT,
    COUCHDB_HOST,
    COUCHDB_PORT,
} from './constants.js';

const log = debug('mhz19');

const express = Express();
const httpServer = http.Server(express);

const socketIo = SocketIo(httpServer, { origins: `http://${APP_HOST}:${APP_PORT}` });

const mqttClient = Mqtt.connect(`mqtt://${MQTT_HOST}:${MQTT_PORT}`, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
});

const couchClient = nano(`http://${COUCHDB_HOST}:${COUCHDB_PORT}`);
const mqttDb = couchClient.db.use('mqtt');
const configsDb = couchClient.db.use('configs');

mqttClient.on('connect', async function () {
    mqttClient.subscribe([
        'zigbee2mqtt/#',
        'homeassistant/#',
        '/ESP/MH/CO2',
        '/ESP/MH/TEMP',
        '/ESP/MH/DEBUG',
    ]);
});

mqttClient.on('message', async function (topic, message) {
    log('\ntopic:', topic);
    const raw = message.toString();
    let parsed = null;
    const timestamp = (new Date).valueOf();
    try {
        parsed = JSON.parse(raw);
        log('json:', parsed);
    } catch(e) {
        log('string:', raw);
    }
    if (parsed && (topic.startsWith('homeassistant/sensor') || topic.startsWith('homeassistant/binary_sensor'))) {
        try {
            await configsDb.insert(parsed);
        } catch (e) {
            console.error(e);
        }
    }
    if (topic === '/ESP/MH/CO2') {
        const co2 = parseInt(message, 10);
        try {
            await mqttDb.insert({
                co2,
                timestamp,
            });
        } catch (e) {
            console.error(e);
        }
    }
    socketIo.sockets.emit('mqtt-message', { topic, parsed, raw: !parsed ? raw : null, timestamp });
});

express.use(Express.static(PUBLIC_PATH));

httpServer.listen(APP_PORT, (err) => {
    if (err) {
        log(`failed to launch server: ${err}`);
    } else {
        log(`listening on ${APP_HOST}:${APP_PORT}`)
        const browserLink = `http://${APP_HOST}:${APP_PORT}/`;
        log(`open browser at ${browserLink}`)
    }
});

async function mqttFind(socket, historyOption) {
    const query = {
        selector: {
            timestamp: {
                "$gt": (new Date()).valueOf() - historyOption
            }
        },
        fields: ["co2", "timestamp"],
        limit: 10000
    };
    try {
        const response = await mqttDb.find(query);
        socket.emit('bootstrap', {
            docs: response.docs
        });
    } catch (e) {
        socket.emit('bootstrap', {
            error: e.message
        });
        log(`mqtt.find failed: ${e.message}`);
    }
}

socketIo.on('connection', async function(socket) {

    log(`new ws connection id=${socket.id}`);

    mqttFind(socket, parseInt(socket.handshake.query.historyOption, 10));

    socket.on('disconnect', () => {
        log(`ws id=${socket.id} disconnected`);
    });

    socket.on('setHistoryOption', (historyOption) => {
        log(`setHistoryOption received`, historyOption);
        mqttFind(socket, parseInt(historyOption, 10));
    });

});

/* (new Date()).valueOf() - historyOption */