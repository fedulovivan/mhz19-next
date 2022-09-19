// import config from 'config';
import Debug from 'debug';
import mqtt from 'mqtt';

import { KITCHEN_VALVES_MANIPULATOR, TOILET_VALVES_MANIPULATOR } from 'lib/constants';

const debug = Debug('mhz19-mqtt-client');

const mqttClient = mqtt.connect(
    `mqtt://${/* config.mqttBroker.host */process.env.MQTT_HOST}:${/* config.mqttBroker.port */process.env.MQTT_PORT}`, {
        username: /* config.mqttBroker.username */process.env.MQTT_USERNAME,
        password: /* config.mqttBroker.password */process.env.MQTT_PASSWORD,
        reconnectPeriod: 10 * 1000,
    }
);

mqttClient.on('connect', function () {

    mqttClient.subscribe([
        'zigbee2mqtt/#',
        `/VALVE/${KITCHEN_VALVES_MANIPULATOR}/STATE/STATUS`,
        `/VALVE/${TOILET_VALVES_MANIPULATOR}/STATE/STATUS`,
    ]);

    // ask zigbee2mqtt coordinator to send list of connected devices
    const requestConnectedDevices = () => {
        mqttClient.publish('zigbee2mqtt/bridge/config/devices/get', '');
    };
    // ask zigbee2mqtt coordinator to send networkmap to be renderred by graphviz
    const requestNetworkMap = () => {
        mqttClient.publish('zigbee2mqtt/bridge/request/networkmap', 'graphviz');
    };

    // requestConnectedDevices();
    // setInterval(requestConnectedDevices, 60 * 1000);

    requestNetworkMap();
    setInterval(requestNetworkMap, 60 * 60 * 1000);

});
mqttClient.on('error', (...args) => debug('error', ...args));
mqttClient.on('offline', (...args: any) => debug('offline', ...args));
mqttClient.on('disconnect', (...args: any) => debug('disconnect', ...args));
mqttClient.on('close', (...args: any) => debug('close', ...args));
mqttClient.on('reconnect', (...args: any) => debug('reconnect', ...args));

export default mqttClient;

// extra debug
// mqttClient.on('packetsend', (...args) => debug('packetsend', ...args));
// mqttClient.on('packetreceive', (...args) => debug('packetreceive', ...args));
// 'homeassistant/#',
// '/ESP/MH/DATA',
// '/ESP/MH/CO2',
// '/ESP/MH/CO2',
// '/ESP/MH/DEBUG',
