/**
 * Couchdb
 */

import Nano from 'nano';

import {
    COUCHDB_HOST,
    COUCHDB_PORT,
    DB_MHZ19,
    DB_HOME_ASSISTANT,
    DB_ZIGBEE_DEVICE_MESSAGES,
} from './constants';

const couchClient = Nano(`http://${COUCHDB_HOST}:${COUCHDB_PORT}`);

function useDb<D>(name: string) {
    return couchClient.db.use<D>(name);
}

export async function insert<D>(dbName: string, doc: D) {
    return useDb<D>(dbName).insert(doc);
}

export async function find<D>(dbName: string, query: Nano.MangoQuery) {
    return useDb<D>(dbName).find(query);
}

export async function insertMhzDoc(doc: IMhzDoc) {
    return useDb<IMhzDoc>(DB_MHZ19).insert(doc);
}

export async function insertZigbeeDeviceDoc(doc: IZigbeeDeviceDoc) {
    return useDb<IZigbeeDeviceDoc>(DB_ZIGBEE_DEVICE_MESSAGES).insert(doc);
}

export async function insertHomeassistantDoc(doc: IHassDoc) {
    return useDb<IHassDoc>(DB_HOME_ASSISTANT).insert(doc);
}

export async function queryMhzDocs(historyOption = 0) {
    const query = {
        selector: {
            timestamp: {
                "$gt": (new Date()).valueOf() - historyOption
            }
        },
        limit: 10000,
    };
    return useDb<IMhzDoc>(DB_MHZ19).find(query);
}

export async function queryConfigDocs() {
    const query = {
        selector: {
        },
    };
    return useDb<IHassDoc>(DB_HOME_ASSISTANT).find(query);
}
