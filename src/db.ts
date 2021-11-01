/* eslint-disable camelcase */

import { oneLine } from 'common-tags';
import Debug from 'debug';
import sqlite3, { Statement } from 'sqlite3';

import { DEVICE_NAME_TO_ID, TEMPERATURE_SENSOR } from 'src/constants';

const debug = Debug('mhz19-db');

const db = new sqlite3.Database('database.bin');

let insert_into_valve_status_messages: Statement;
let insert_into_zigbee_devices: Statement;
let insert_into_device_messages_unified: Statement;
let insert_into_yeelight_devices: Statement;
let insert_into_yeelight_device_messages: Statement;
let insert_into_device_custom_attributes: Statement;
let delete_from_yeelight_devices: Statement;

db.serialize(function() {

    db.run(`PRAGMA foreign_keys = ON`);
    db.run(`
        CREATE TABLE IF NOT EXISTS yeelight_devices (
            timestamp INTEGER,
            id STRING UNIQUE,
            location STRING,
            model STRING,
            support STRING,
            host STRING,
            port INTEGER,
            power STRING,
            json STRING
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS yeelight_device_messages (
            device_id STRING,
            timestamp INTEGER,
            json STRING,
            FOREIGN KEY(device_id) REFERENCES yeelight_devices(id) ON DELETE CASCADE
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS zigbee_devices (
            description STRING,
            friendly_name STRING,
            last_seen INTEGER,
            model STRING,
            model_id STRING,
            network_address STRING,
            power_source STRING,
            type STRING,
            vendor STRING,
            voltage REAL,
            battery REAL,
            custom_description STRING
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS valve_status_messages (
            data TEXT,
            timestamp INTEGER
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS device_messages_unified (
            device_id STRING,
            timestamp INTEGER,
            json STRING
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS device_custom_attributes (
            device_id STRING,
            attribute_type STRING,
            value STRING,
            UNIQUE(device_id, attribute_type)
        )
    `);

    db.run(`DELETE FROM zigbee_devices`);
    db.run(`DELETE FROM yeelight_devices`);
    db.run(`DELETE FROM yeelight_device_messages`);
    db.run(`DELETE FROM device_custom_attributes`);

    // prepare insert/update/delete statements
    insert_into_valve_status_messages = db.prepare(`
        INSERT INTO valve_status_messages VALUES(?, ?)
    `);
    insert_into_zigbee_devices = db.prepare(`
        INSERT INTO zigbee_devices VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert_into_device_messages_unified = db.prepare(`
        INSERT INTO device_messages_unified VALUES(?, ?, ?)
    `);
    insert_into_yeelight_device_messages = db.prepare(`
        INSERT INTO yeelight_device_messages VALUES(?, ?, ?)
    `);
    insert_into_yeelight_devices = db.prepare(`
        INSERT INTO yeelight_devices VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert_into_device_custom_attributes = db.prepare(`
        INSERT INTO device_custom_attributes VALUES(?, ?, ?)
    `);
    delete_from_yeelight_devices = db.prepare(`
        DELETE FROM yeelight_devices WHERE id = ?
    `);

});

/**
 * (!) usage of promisify crashes nodejs, so using custom wrapper
 * const query = promisify(db.all);
 */
function select(
    qstring: string,
    params: any = undefined,
): Promise<Array<Record<string, any>>> {
    // debug(`executing query: `, qstring, params);
    return new Promise((resolve, reject) => {
        db.all(qstring, params, (error, rows) => {
            if (error) {
                return reject(error);
            }
            resolve(rows);
        });
    });
}

function runStatement(
    statement: Statement,
    ...args: Array<any>
): Promise<void> {
    // debug(`executing statement: `, statement.toString(), args);
    return new Promise<void>((resolve, reject) => {
        statement.run(
            ...args,
            (error: Error) => {
                if (error) reject(error); else resolve();
            },
        );
    });
}

export async function deleteYeelightDevice(id: string) {
    return runStatement(
        delete_from_yeelight_devices,
        id
    );
}

export async function insertIntoDeviceMessagesUnified(
    deviceId: string,
    timestamp: number,
    json: IZigbeeDeviceMessage | null
) {
    return runStatement(
        insert_into_device_messages_unified,
        deviceId,
        timestamp,
        json ? JSON.stringify(json) : null,
    );
}

export async function insertIntoYeelightDeviceMessages(
    deviceId: string,
    timestamp: number,
    json: any
) {
    return runStatement(
        insert_into_yeelight_device_messages,
        deviceId,
        timestamp,
        json ? JSON.stringify(json) : null,
    );
}

export async function insertIntoValveStatusMessages(
    data: string,
    timestamp: number
) {
    return runStatement(
        insert_into_valve_status_messages,
        data,
        timestamp
    );
}

export async function insertIntoDeviceCustomAttributes(
    deviceId: string,
    attributeType: string,
    value: string,
) {
    return runStatement(
        insert_into_device_custom_attributes,
        deviceId,
        attributeType,
        value,
    );
}

export async function insertIntoYeelightDevices(
    id: string,
    location: string,
    model: string,
    support: string,
    host: string,
    port: number,
    power: string,
    json: Record<string, any>,
): Promise<void> {
    return runStatement(
        insert_into_yeelight_devices,
        Date.now(),
        id,
        location,
        model,
        support,
        host,
        port,
        power,
        json ? JSON.stringify(json) : null,
    );
}

export function unwrapJson(rows: Array<Record<string, any> | { json: string }>) {
    return rows.map(({ json, ...rest }) => ({
        ...rest,
        ...JSON.parse(json),
    }));
}

export async function fetchLastTemperatureSensorMessage() {
    const rows = await select(oneLine`
        SELECT * FROM device_messages_unified
        WHERE device_id = '${DEVICE_NAME_TO_ID[TEMPERATURE_SENSOR]}'
        ORDER BY timestamp DESC
        LIMIT 1
    `);
    return unwrapJson(rows);
}

export async function fetchYeelightDevices() {
    const rows = await select(`SELECT * FROM yeelight_devices`);
    return unwrapJson(rows);
}

export async function fetchZigbeeDevices() {
    return select(`SELECT * FROM zigbee_devices`);
}

export async function fetchDeviceCustomAttributes() {
    return select(`SELECT * FROM device_custom_attributes`);
}

export async function fetchDeviceMessagesUnified(historyWindowSize?: number) {
    const where = historyWindowSize ? `WHERE timestamp > ${Date.now() - historyWindowSize}` : "";
    const rows = await select(oneLine`
        SELECT * FROM device_messages_unified
        ${where}
        ORDER BY timestamp DESC
    `);
    return unwrapJson(rows);
}

export async function fetchYeelightDeviceMessages(
    historyWindowSize?: number,
    deviceId?: string,
    commandId?: number,
): Promise<Array<IYeelightDeviceMessage>> {
    const where = [];
    const params: any = {};
    if (historyWindowSize) {
        where.push(`timestamp > $timestamp`);
        params.$timestamp = Date.now() - historyWindowSize;
    }
    if (deviceId) {
        where.push(`device_id = $deviceId`);
        params.$deviceId = deviceId;
    }
    if (commandId) {
        where.push(`json_extract(json, '$.id') = ${commandId}`);
    }
    const rows = await select(oneLine`
        SELECT * FROM yeelight_device_messages
        WHERE ${where.join(' AND ')}
        ORDER BY timestamp DESC
    `, params);
    return unwrapJson(rows);
}

export async function fetchStats() {
    const results = await Promise.all([
        select(`SELECT COUNT(*) AS zigbee_devices FROM zigbee_devices`),
        select(`SELECT COUNT(*) AS valve_status_messages FROM valve_status_messages`),
        select(`SELECT COUNT(*) AS device_messages_unified FROM device_messages_unified`),
        select(`SELECT COUNT(*) AS yeelight_devices FROM yeelight_devices`),
        select(`SELECT COUNT(*) AS yeelight_device_messages FROM yeelight_device_messages`),
    ]);
    return results.reduce((memo, result) => ({ ...memo, ...result[0] }), {});
}

export function insertIntoZigbeeDevices(
    json: IZigbee2mqttBridgeConfigDevice
) {
    return runStatement(
        insert_into_zigbee_devices,
        json.description,
        json.friendly_name,
        json.lastSeen,
        json.model,
        json.modelID,
        json.networkAddress,
        json.powerSource,
        json.type,
        json.vendor,
        null,
        null,
        null,
    );
}

export default db;

// select(`SELECT COUNT(*) AS temperature_sensor_messages FROM temperature_sensor_messages`),

// export async function fetchTemperatureSensorMessages(historyWindowSize?: number) {
//     const where = historyWindowSize ? `WHERE timestamp > ${Date.now() - historyWindowSize}` : "";
//     return select(oneLine`
//         SELECT * FROM temperature_sensor_messages
//         ${where}
//         ORDER BY timestamp DESC
//     `);
// }

// export function insertIntoTemperatureSensorMessages(
//     deviceId: undefined | string,
//     timestamp: number,
//     json: IAqaraTemperatureSensorMessage,
// ) {
//     insert_into_temperature_sensor_messages.run(
//         deviceId,
//         timestamp,
//         json.battery,
//         json.humidity,
//         json.linkquality,
//         json.pressure,
//         json.temperature,
//         json.voltage,
//     );
// }
// export function updateLastSeen(
//     friendlyName: string | undefined,
//     lastSeen: number,
//     voltage: number | undefined,
//     battery: number | undefined
// ) {
//     debug('updateLastSeen', friendlyName);
//     update_zigbee_device.run(
//         lastSeen,
//         voltage,
//         battery,
//         friendlyName
//     );
// }

// migration from temperature_sensor_messages to device_messages_unified
// db.all(`SELECT * FROM temperature_sensor_messages ORDER BY timestamp`, (error, rows) => {
//     if (error) {
//         console.error(error);
//         return;
//     }
//     rows.forEach((row, index) => {
//         const {
//             device_id,
//             timestamp,
//             ...json
//         } = row;
//         console.log(timestamp, index);
//         insertIntoDeviceMessagesUnified(device_id, timestamp, json);
//     });
// });

// let insert_into_temperature_sensor_messages: Statement;
// let update_zigbee_device: Statement;

// db.run(`
//     CREATE TABLE IF NOT EXISTS temperature_sensor_messages (
//         device_id STRING,
//         timestamp INTEGER,
//         battery REAL,
//         humidity REAL,
//         linkquality REAL,
//         pressure REAL,
//         temperature REAL,
//         voltage REAL
//     )
// `);

// db.run(`DROP TABLE temperature_sensor_messages`);
