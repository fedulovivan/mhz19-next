import config from 'config';
import Debug from 'debug';
import mqtt from 'mqtt';

const debug = Debug('mhz19-mqtt-client');

const mqttClient = mqtt.connect(`mqtt://${config.mqttBroker.host}:${config.mqttBroker.port}`, {
    username: config.mqttBroker.username,
    password: config.mqttBroker.password,
    reconnectPeriod: 10 * 1000,
});

mqttClient.on('connect', function () {

    mqttClient.subscribe([
        'zigbee2mqtt/#',
        '/VALVE/STATE/STATUS'
    ]);

    // ask zigbee2mqtt coordinator to send list of connected devices
    const requestConnectedDevices = () => {
        mqttClient.publish('zigbee2mqtt/bridge/config/devices/get', '');
    };
    // ask zigbee2mqtt coordinator to send networkmap to be renderred by graphviz
    const requestNetworkMap = () => {
        mqttClient.publish('zigbee2mqtt/bridge/networkmap', 'graphviz');
    };

    requestConnectedDevices();
    requestNetworkMap();
    setInterval(requestNetworkMap, 60 * 60 * 1000);
    setInterval(requestConnectedDevices, 60 * 60 * 1000);

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
