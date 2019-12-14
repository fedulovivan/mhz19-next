import {
    COUCHDB_HOST,
    COUCHDB_PORT,
    DB_MHZ19,
    DB_HOME_ASSISTANT,
    DB_ZIGBEE_DEVICE_MESSAGES,
} from './constants';

import nano from 'nano';

const couchClient = nano(`http://${COUCHDB_HOST}:${COUCHDB_PORT}`);

function useDb(name: string) {
    return couchClient.db.use(name);
}

export async function insert(dbName, doc) {
    return useDb(dbName).insert(doc);
}

export async function find(dbName, query) {
    return useDb(dbName).find(query);
}

export async function insertMhzDoc(doc: IMhzDoc) {
    return couchClient.db.use(DB_MHZ19).insert(doc);
}

export async function insertZigbeeDeviceDoc(doc: IZigbeeDeviceDoc) {
    return couchClient.db.use(DB_ZIGBEE_DEVICE_MESSAGES).insert(doc);
}

export async function insertHomeassistantDoc(doc: object) {
    return couchClient.db.use(DB_HOME_ASSISTANT).insert(doc);
}

export async function queryMhzDocs(historyOption = 0) {
    const query = {
        selector: {
            timestamp: {
                "$gt": (new Date()).valueOf() - historyOption
            }
        },
        limit: 10000,
        // fields: ["co2", "timestamp", "temp"],
    };
    return useDb(DB_MHZ19).find(query);
}

export async function queryConfigDocs(/* historyOption = 0 */) {
    const query = {
        selector: {
        //     timestamp: {
        //         "$gt": (new Date()).valueOf() - historyOption
        //     }
        },
        // fields: ["co2", "timestamp"],
        // limit: 10000
    };
    return useDb(DB_HOME_ASSISTANT).find(query);
}
