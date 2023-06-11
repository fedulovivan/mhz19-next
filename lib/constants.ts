// import type { QueryHookOptions } from '@apollo/client/react/types/types.d';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT = path.join(__dirname, '../..');

export const APP_HOST = 'localhost';

// export const ROOT = '/Users/ivanf/Desktop/Projects/mhz19-next/server';
export const DIST_FS_PATH = `${ROOT}/dist-client`;
// export const IMAGES_FS_PATH = `${ROOT}/images`;

export const GRAPHQL_URI = '/graphql';
export const IMAGES_URI = '/images';

export const MINUTE = 60 * 1000;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;

export const HISTORY_WINDOW_DAY = DAY;
export const HISTORY_WINDOW_3DAYS = DAY * 3;
export const HISTORY_WINDOW_7DAYS = DAY * 7;
export const HISTORY_WINDOW_14DAYS = DAY * 14;
export const HISTORY_WINDOW_30DAYS = DAY * 30;

export const NO_DATA_GAP = HOUR;
export const LAST_SEEN_OUTDATION = 90 * MINUTE;

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

export const BATHROOM_CEILING_LIGHT = 'bathroom-ceiling-light';
export const BEDROOM_CEILING_LIGHT = 'bedroom-ceiling-light';
export const LEAKAGE_SENSOR_BATHROOM = 'leakage-sensor-bathroom'; // 1
export const LEAKAGE_SENSOR_TOILET = 'leakage-sensor-toilet'; // 2
export const LEAKAGE_SENSOR_KITCHEN = 'leakage-sensor-kitchen'; // 3
export const WALL_SWITCH_BEDROOM = 'wall-switch-bedroom';
export const WALL_SWITCH_KITCHEN = 'wall-switch-kitchen';
export const TOILET_CEILING_LIGHT = 'toilet-ceiling-light';
export const TEMPERATURE_SENSOR = 'temperature-sensor';
export const KITCHEN_UNDERCABINET_LIGHT = 'kitchen-undercabinet-light';
export const KITCHEN_CEILING_LIGHT = 'kitchen-ceiling-light';
export const IKEA_ONOFF_SWITCH = 'ikea-onoff-switch';
export const IKEA_400LM_LED_BULB = 'ikea-400lm-led-bulb';

export const KITCHEN_VALVES_MANIPULATOR = 6613075;
export const TOILET_VALVES_MANIPULATOR = 18225;

export const DEVICE_NAME_TO_ID: Record<string, string> = {
    [LEAKAGE_SENSOR_BATHROOM]: '0x00158d000405811b',
    [LEAKAGE_SENSOR_KITCHEN]: '0x00158d0004035e3e',
    [LEAKAGE_SENSOR_TOILET]: '0x00158d00040356af',
    [WALL_SWITCH_BEDROOM]: '0x00158d00042446ec',
    [WALL_SWITCH_KITCHEN]: '0x00158d0004244bda',
    [TEMPERATURE_SENSOR]: '0x00158d00067cb0c9',
    [BEDROOM_CEILING_LIGHT]: '0x00000000064c5293',
    [KITCHEN_UNDERCABINET_LIGHT]: '10011cec96',
    [KITCHEN_CEILING_LIGHT]: '10011c1eeb',
    [IKEA_ONOFF_SWITCH]: '0x50325ffffe6ca5da',
    [IKEA_400LM_LED_BULB]: '0x000d6ffffefc0f29',
};

export const DEVICE_CUSTOM_ATTRIBUTE_NAME = 'name';
export const DEVICE_CUSTOM_ATTRIBUTE_IS_HIDDEN = 'isHidden';

export const QUERY_OPTIONS/* : QueryHookOptions */ = {
    pollInterval: 10000,
    fetchPolicy: "network-only",
};

// export const COUCHDB_HOST = 'localhost';
// export const COUCHDB_PORT = 5984;
// export const DB_MHZ19 = 'mhz19';
// export const DB_HOME_ASSISTANT = 'home-assistant';
// export const DB_ZIGBEE_DEVICE_MESSAGES = 'zigbee-device-messages';
// export const AUDIOENGINE_POWER_PLUG = 'audioengine-power-plug';
// export const TV_POWER_PLUG = 'tv-power-plug';
// [AUDIOENGINE_POWER_PLUG]: '0x00158d000391f252',
// [TV_POWER_PLUG]: '0x00158d0003a010a5',
