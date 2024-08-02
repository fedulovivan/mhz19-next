import mqtt from 'mqtt';

import { DEVICE } from 'src/constants';
import { withDebug } from 'src/logger';

const debug = withDebug('mqtt-client');

const mqttClient = mqtt.connect(`mqtt://${process.env.MQTT_HOST ?? "mosquitto"}:${process.env.MQTT_PORT ?? 1883}`, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    reconnectPeriod: 10 * 1000,
});

mqttClient.on('connect', function () {

    mqttClient.subscribe([
        'zigbee2mqtt/#',
        'device-pinger/+/status',
        `/VALVE/${DEVICE.KITCHEN_VALVES_MANIPULATOR}/STATE/STATUS`,
        `/VALVE/${DEVICE.TOILET_VALVES_MANIPULATOR}/STATE/STATUS`,
    ]);

    // ask zigbee2mqtt coordinator to send list of connected devices
    const requestConnectedDevices = () => {
        mqttClient.publish('zigbee2mqtt/bridge/config/devices/get', '');
    };
    // ask zigbee2mqtt coordinator to send networkmap to be renderred by graphviz
    const requestNetworkMap = () => {
        mqttClient.publish('zigbee2mqtt/bridge/request/networkmap', 'graphviz');
    };

});
mqttClient.on('error', (...args) => debug('error', ...args));
mqttClient.on('offline', (...args: any) => debug('offline', ...args));
mqttClient.on('disconnect', (...args: any) => debug('disconnect', ...args));
mqttClient.on('close', (...args: any) => debug('close', ...args));
mqttClient.on('reconnect', (...args: any) => debug('reconnect', ...args));

export default mqttClient;

// requestConnectedDevices();
// setInterval(requestConnectedDevices, 60 * 1000);
// requestNetworkMap();
// setInterval(requestNetworkMap, 60 * 60 * 1000);
// extra debug
// mqttClient.on('packetsend', (...args) => debug('packetsend', ...args));
// mqttClient.on('packetreceive', (...args) => debug('packetreceive', ...args));
// 'homeassistant/#',
// '/ESP/MH/DATA',
// '/ESP/MH/CO2',
// '/ESP/MH/CO2',
// '/ESP/MH/DEBUG',
