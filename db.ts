import nano from 'nano';

import {
    COUCHDB_HOST,
    COUCHDB_PORT,
} from './constants';

const couchClient = nano(`http://${COUCHDB_HOST}:${COUCHDB_PORT}`);

const mqttDb = couchClient.db.use('mqtt');
const configsDb = couchClient.db.use('configs');

export async function insertMhzDoc(doc) {
    return mqttDb.insert(doc);
}

export async function insertZigbeeDoc(doc) {
    return configsDb.insert(doc);
}

export async function queryMhzDocs(historyOption = 0) {
    const query = {
        selector: {
            timestamp: {
                "$gt": (new Date()).valueOf() - historyOption
            }
        },
        fields: ["co2", "timestamp"],
        limit: 10000
    };
    return mqttDb.find(query);
}
