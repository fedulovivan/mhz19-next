export const APP_HOST = 'localhost';
export const APP_PORT = 8888;

export const DIST_PATH = `${__dirname}/dist`;
export const IMAGES_PATH = `${__dirname}/images`;

export const MINUTE = 60 * 1000;
export const HOUR = 3600 * 1000;
export const DAY = HOUR * 24;

export const MQTT_USERNAME = 'mosquitto';
export const MQTT_PASSWORD = '5Ysm3jAsVP73nva';
export const MQTT_HOST = '192.168.88.207';
export const MQTT_PORT = 1883;

export const COUCHDB_HOST = 'localhost';
export const COUCHDB_PORT = 5984;

export const DB_MHZ19 = 'mhz19';
export const DB_HOME_ASSISTANT = 'home-assistant';
export const DB_ZIGBEE_DEVICE_MESSAGES = 'zigbee-device-messages';

export const HISTORY_OPTIONS = [
    { name: '1 minute', value: MINUTE },
    { name: '15 minutes', value: MINUTE * 15 },
    { name: '30 minutes', value: MINUTE * 30 },
    { name: '1 hour', value: HOUR },
    { name: '4 hours', value: HOUR * 4 },
    { name: '12 hours', value: HOUR * 12 },
    { name: '1 day', value: DAY },
];

export const ZIGBEE_DEVICE_MODEL_LUMI_WATER_LEAK = 'SJCGQ11LM';
export const ZIGBEE_DEVICE_MODEL_LUMI_POWER_PLUG = 'ZNCZ02LM';
