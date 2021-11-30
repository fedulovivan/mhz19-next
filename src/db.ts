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
let update_device_custom_attributes: Statement;
let delete_from_yeelight_devices: Statement;
let insert_into_sonoff_devices: Statement;
let update_sonoff_devices: Statement;

db.serialize(function() {

    // db.run(`DROP TABLE sonoff_devices`);
    // db.run(`DROP TABLE zigbee_devices`);

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
            custom_description STRING,
            UNIQUE(friendly_name, model)
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
    db.run(`
        CREATE TABLE IF NOT EXISTS sonoff_devices (
            timestamp INTEGER,
            device_id STRING,
            ip STRING,
            port INTEGER,
            json STRING,
            UNIQUE(device_id)
        )
    `);

    db.run(`DELETE FROM zigbee_devices`);
    db.run(`DELETE FROM yeelight_devices`);
    db.run(`DELETE FROM yeelight_device_messages`);
    db.run(`DELETE FROM sonoff_devices`);

    // db.run(`DELETE FROM valve_status_messages`);

    // deletion replaced with INSERT OR IGNORE
    // db.run(`DELETE FROM device_custom_attributes`);

    // prepare insert/update/delete statements
    insert_into_valve_status_messages = db.prepare(`
        INSERT INTO valve_status_messages VALUES(?, ?)
    `);
    insert_into_zigbee_devices = db.prepare(`
        INSERT OR IGNORE INTO zigbee_devices VALUES(
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
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
        INSERT OR IGNORE INTO device_custom_attributes VALUES(?, ?, ?)
    `);
    update_device_custom_attributes = db.prepare(`
        UPDATE device_custom_attributes SET value = ? WHERE device_id = ? AND attribute_type = ?
    `);
    delete_from_yeelight_devices = db.prepare(`
        DELETE FROM yeelight_devices WHERE id = ?
    `);
    insert_into_sonoff_devices = db.prepare(`
        INSERT OR IGNORE INTO sonoff_devices VALUES(
            $timestamp,
            $device_id,
            $ip,
            $port,
            $json
        )
    `);
    update_sonoff_devices = db.prepare(`
        UPDATE sonoff_devices SET timestamp = $timestamp, json = $json WHERE device_id = $device_id
    `);
});

export function unwrapJson(rows: Array<Record<string, any> | { json: string }>) {
    return rows.map(({ json, ...rest }) => ({
        ...rest,
        ...JSON.parse(json),
    }));
}

/**
 * (!) usage of promisify crashes nodejs, so using custom wrapper
 * const query = promisify(db.all);
 */
function select(
    qstring: string,
    params: any = undefined,
): Promise<Array<Record<string, any>>> {
    debug(`executing query: `, qstring, params);
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

export async function fetchDeviceCustomAttributes(
    params: Partial<IDeviceCustomAttribute> = {}
) {
    const where: Array<string> = [];
    const { deviceId, attributeType } = params;
    if (deviceId) where.push(`device_id = '${deviceId}'`);
    if (attributeType) where.push(`attribute_type = '${attributeType}'`);
    return select(`SELECT * FROM device_custom_attributes ${where.length ? "WHERE" : ""} ${where.join(" AND ")}`);
}

export async function insertIntoDeviceCustomAttributes({
    deviceId,
    attributeType,
    value,
}: IDeviceCustomAttribute) {
    return runStatement(
        insert_into_device_custom_attributes,
        deviceId,
        attributeType,
        value,
    );
}

export async function updateDeviceCustomAttributes({
    deviceId,
    attributeType,
    value,
}: IDeviceCustomAttribute) {
    return runStatement(
        update_device_custom_attributes,
        value,
        deviceId,
        attributeType,
    );
}

export async function createOrUpdateDeviceCustomAttribute({
    deviceId,
    attributeType,
    value,
}: IDeviceCustomAttribute) {
    const existing = await fetchDeviceCustomAttributes({ deviceId, attributeType });
    if (existing.length === 1) {
        return updateDeviceCustomAttributes({
            deviceId,
            attributeType,
            value,
        });
    }
    if (existing.length === 0) {
        return insertIntoDeviceCustomAttributes({
            deviceId,
            attributeType,
            value,
        });
    }
    throw new Error(
        oneLine`
            Unexpected conditions: ${existing.length} existing attributes
            for ${JSON.stringify({ deviceId, attributeType })},
            while expected zero or 1
        `
    );
}

export async function fetchSonoffDevices(params: Partial<Pick<ISonoffDevice, 'id'>> = {}) {
    const where: Array<string> = [];
    const { id } = params;
    if (id) where.push(`device_id = '${id}'`);
    const rows = await select(`SELECT * FROM sonoff_devices ${where.length ? "WHERE" : ""} ${where.join(" AND ")}`);
    return unwrapJson(rows);
}

export async function createOrUpdateSonoffDevice(device: ISonoffDevice) {
    const { id, timestamp } = device;
    const existing = await fetchSonoffDevices({ id });
    if (existing.length === 1) {
        return runStatement(
            update_sonoff_devices, {
                $timestamp: timestamp,
                $json: JSON.stringify(device.attributes),
                $device_id: device.id,
            }
        );
    }
    if (existing.length === 0) {
        return runStatement(
            insert_into_sonoff_devices, {
                $timestamp: timestamp,
                $device_id: device.id,
                $ip: device.ip,
                $port: device.port,
                $json: JSON.stringify(device.attributes),
            }
        );
    }
    throw new Error(`Unexpected conditions`);
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

export async function fetchZigbeeDevices(deviceId?: string) {
    const where = [];
    const params: any = {};
    if (deviceId) {
        where.push(`friendly_name = $deviceId`);
        params.$deviceId = deviceId;
    }
    return select(oneLine`
        SELECT * FROM zigbee_devices
        ${where.length ? "WHERE" : ""} ${where.join(" AND ")}
        ORDER BY model, friendly_name
    `, params);
}

export async function fetchValveStatusMessages(historyWindowSize?: number) {
    const where = historyWindowSize ? `WHERE timestamp > ${Date.now() - historyWindowSize}` : "";
    return select(oneLine`
        SELECT * FROM valve_status_messages
        ${where}
        ORDER BY timestamp DESC
    `);
}

export async function fetchDeviceMessagesUnified(
    historyWindowSize?: number,
    deviceId?: string,
) {
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
    const rows = await select(oneLine`
        SELECT * FROM device_messages_unified
        WHERE ${where.join(' AND ')}
        ORDER BY timestamp DESC
    `, params);
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
        select(`SELECT COUNT(*) AS sonoff_devices FROM sonoff_devices`),
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
