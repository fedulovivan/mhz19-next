import type { QueryHookOptions } from '@apollo/client/react/types/types.d';
import path from 'path';

export const APP_HOST = 'localhost';

export const ROOT = path.join(__dirname, '..');
export const DIST_FS_PATH = `${ROOT}/dist`;
export const IMAGES_FS_PATH = `${ROOT}/images`;

export const GRAPHQL_URI = '/graphql';
export const IMAGES_URI = '/images';

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;

export const HISTORY_WINDOW_DAY = DAY;
export const HISTORY_WINDOW_3DAYS = DAY * 3;
export const HISTORY_WINDOW_7DAYS = DAY * 7;
export const HISTORY_WINDOW_14DAYS = DAY * 14;
export const HISTORY_WINDOW_30DAYS = DAY * 30;

export const NO_DATA_GAP = HOUR;
export const LAST_SEEN_OUTDATION = 90 * MINUTE;

export const LAST_SEEN_FOR_BOT_NOTIFY = 90 * MINUTE;
// export const LAST_SEEN_FOR_BOT_NOTIFY = 90 * SECOND;

export const IPHONE_15_PRO_IP = "192.168.88.71";
export const IPHONE_14_IP = "192.168.88.62";
export const PIXEL_5_IP = "192.168.88.68";
export const REDMI_12_NOTE_IP = "192.168.88.63";

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

/**
 * (!) note that string enums do not support reverse mapping:
 * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-4.html#string-enums
 */
export enum DEVICE {
    KITCHEN_VALVES_MANIPULATOR = "6613075",
    TOILET_VALVES_MANIPULATOR = "18225",
    SONOFF_MINI_PINK_LABEL = "10011cec96",
    STORAGE_ROOM_VENT = "10012db92b",
    LIFE_CONTROL_DOOR_SENSOR = "0x00158d0000c2fa6e",
    LIFE_CONTROL_DOOR_SENSOR_NEW = "0x00158d0000bedf87",
    STORAGE_ROOM_CEILING_LIGHT = "0xe0798dfffed39ed1",
    BEDROOM_CEILING_LIGHT = "0x00000000064c5293",
    IKEA_ONOFF_SWITCH = "0x50325ffffe6ca5da",
    MOVEMENT_SENSOR = "0x00158d000a823bb0",
    WALL_SWITCH_BEDROOM = "0x00158d00042446ec",
    WALL_SWITCH_SECOND = "0x00158d0004244bda",
    TEMPERATURE_SENSOR = "0x00158d00067cb0c9",
    LEAKAGE_SENSOR_BATHROOM = "0x00158d000405811b",
    LEAKAGE_SENSOR_KITCHEN = "0x00158d0004035e3e",
    LEAKAGE_SENSOR_TOILET = "0x00158d00040356af",
    IKEA_400LM_LED_BULB = "0x000d6ffffefc0f29",
    SONOFF_DOOR_SENSOR = "0x00124b002510b59d",
}

/**
 * (!) note that string enums do not support reverse mapping:
 * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-4.html#string-enums
 */
export const DEVICE_NAME: Record<DEVICE, string> = {
    [DEVICE.KITCHEN_VALVES_MANIPULATOR]: "KITCHEN_VALVES_MANIPULATOR",
    [DEVICE.TOILET_VALVES_MANIPULATOR]: "TOILET_VALVES_MANIPULATOR",
    [DEVICE.SONOFF_MINI_PINK_LABEL]: "SONOFF_MINI_PINK_LABEL",
    [DEVICE.STORAGE_ROOM_VENT]: "STORAGE_ROOM_VENT",
    [DEVICE.LIFE_CONTROL_DOOR_SENSOR]: "LIFE_CONTROL_DOOR_SENSOR",
    [DEVICE.LIFE_CONTROL_DOOR_SENSOR_NEW]: "LIFE_CONTROL_DOOR_SENSOR_NEW",
    [DEVICE.STORAGE_ROOM_CEILING_LIGHT]: "STORAGE_ROOM_CEILING_LIGHT",
    [DEVICE.BEDROOM_CEILING_LIGHT]: "BEDROOM_CEILING_LIGHT",
    [DEVICE.IKEA_ONOFF_SWITCH]: "IKEA_ONOFF_SWITCH",
    [DEVICE.MOVEMENT_SENSOR]: "MOVEMENT_SENSOR",
    [DEVICE.WALL_SWITCH_BEDROOM]: "WALL_SWITCH_BEDROOM",
    [DEVICE.WALL_SWITCH_SECOND]: "WALL_SWITCH_SECOND",
    [DEVICE.TEMPERATURE_SENSOR]: "TEMPERATURE_SENSOR",
    [DEVICE.LEAKAGE_SENSOR_BATHROOM]: "LEAKAGE_SENSOR_BATHROOM",
    [DEVICE.LEAKAGE_SENSOR_KITCHEN]: "LEAKAGE_SENSOR_KITCHEN",
    [DEVICE.LEAKAGE_SENSOR_TOILET]: "LEAKAGE_SENSOR_TOILET",
    [DEVICE.IKEA_400LM_LED_BULB]: "IKEA_400LM_LED_BULB",
    [DEVICE.SONOFF_DOOR_SENSOR]: "SONOFF_DOOR_SENSOR",
}

export const DEVICE_CUSTOM_ATTRIBUTE_NAME = 'name';
export const DEVICE_CUSTOM_ATTRIBUTE_IS_HIDDEN = 'isHidden';
export const DEVICE_CUSTOM_ATTRIBUTE_LAST_SEEN_FOR_BOT_NOTIFY = 'lastSeenForBotNotify';

export const QUERY_OPTIONS: QueryHookOptions = {
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
