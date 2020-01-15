import Debug from 'debug';
import mqtt from 'mqtt';
import {
    MQTT_USERNAME,
    MQTT_PASSWORD,
    MQTT_HOST,
    MQTT_PORT,
} from './constants';

const debug = Debug('mhz19-mqtt-client');

const mqttClient = mqtt.connect(`mqtt://${MQTT_HOST}:${MQTT_PORT}`, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    reconnectPeriod: 10 * 1000,
});

mqttClient.on('connect', function () {
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
mqttClient.on('error', (...args) => debug('error', ...args));
mqttClient.on('offline', (...args) => debug('offline', ...args));
mqttClient.on('disconnect', (...args) => debug('disconnect', ...args));
mqttClient.on('close', (...args) => debug('close', ...args));
mqttClient.on('reconnect', (...args) => debug('reconnect', ...args));
// mqttClient.on('packetsend', (...args) => debug('packetsend', ...args));
// mqttClient.on('packetreceive', (...args) => debug('packetreceive', ...args));

export default mqttClient;
