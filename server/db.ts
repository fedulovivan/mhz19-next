/* eslint-disable camelcase */

import { oneLine } from 'common-tags';
import { set } from 'lodash-es';
import sqlite3, { Statement } from 'sqlite3';

import { DEVICE_NAME_TO_ID, TEMPERATURE_SENSOR } from 'lib/constants';
import type {
    IDeviceCustomAttribute,
    ISonoffDevice,
    IYeelightDeviceMessage,
    IZigbee2mqttBridgeConfigDevice,
    IZigbee2MqttBridgeDevice,
    IZigbeeDeviceMessage,
} from 'lib/typings';

import { withCategory } from './logger';

const log = withCategory('mhz19-db');

const db = new sqlite3.Database('database.bin');

interface StatementWrapper {
    sql: string;
    statement: Statement;
}

// let insert_into_valve_status_messages: StatementWrapper;
// let insert_into_zigbee_devices: StatementWrapper;
// let insert_into_device_messages_unified: StatementWrapper;
// let insert_into_yeelight_devices: StatementWrapper;
// let insert_into_yeelight_device_messages: StatementWrapper;
// let insert_into_device_custom_attributes: StatementWrapper;
// let update_device_custom_attributes: StatementWrapper;
// let delete_from_yeelight_devices: StatementWrapper;
// let insert_into_sonoff_devices: StatementWrapper;
// let update_sonoff_devices: StatementWrapper;
// let insert_into_zigbee_devices_v2: StatementWrapper;
// let update_zigbee_devices_v2: StatementWrapper;

const stmts: Record<string,StatementWrapper> = {};

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
            custom_description STRING,
            UNIQUE(friendly_name, model)
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS zigbee_devices_v2 (
            ieee_address STRING,
            friendly_name STRING,
            model_id STRING,
            type STRING,
            timestamp INTEGER,
            json STRING,
            UNIQUE(ieee_address)
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS valve_status_messages (
            timestamp INTEGER,
            json STRING
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
    db.run(`DELETE FROM zigbee_devices_v2`);
    db.run(`DELETE FROM yeelight_devices`);
    db.run(`DELETE FROM yeelight_device_messages`);
    db.run(`DELETE FROM sonoff_devices`);

    // db.run(`DELETE FROM valve_status_messages`);

    // prepare insert/update/delete statements
    stmts.insert_into_valve_status_messages = prepareStatement(`
        INSERT INTO valve_status_messages VALUES(
            $timestamp,
            $json
        )
    `);
    stmts.insert_into_zigbee_devices = prepareStatement(`
        INSERT OR IGNORE INTO zigbee_devices VALUES(
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    `);
    stmts.insert_into_device_messages_unified = prepareStatement(`
        INSERT INTO device_messages_unified VALUES(
            $device_id,
            $timestamp,
            $json
        )
    `);
    stmts.insert_into_yeelight_device_messages = prepareStatement(`
        INSERT INTO yeelight_device_messages VALUES(?, ?, ?)
    `);
    stmts.insert_into_yeelight_devices = prepareStatement(`
        INSERT INTO yeelight_devices VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmts.insert_into_device_custom_attributes = prepareStatement(`
        INSERT OR IGNORE INTO device_custom_attributes VALUES(?, ?, ?)
    `);
    stmts.update_device_custom_attributes = prepareStatement(`
        UPDATE device_custom_attributes SET value = ? WHERE device_id = ? AND attribute_type = ?
    `);
    stmts.delete_from_yeelight_devices = prepareStatement(`
        DELETE FROM yeelight_devices WHERE id = ?
    `);
    stmts.insert_into_sonoff_devices = prepareStatement(`
        INSERT OR IGNORE INTO sonoff_devices VALUES(
            $timestamp,
            $device_id,
            $ip,
            $port,
            $json
        )
    `);
    stmts.update_sonoff_devices = prepareStatement(`
        UPDATE sonoff_devices SET timestamp = $timestamp, json = $json WHERE device_id = $device_id
    `);
    stmts.insert_into_zigbee_devices_v2 = prepareStatement(`
        INSERT INTO zigbee_devices_v2 VALUES(
            $ieee_address,
            $friendly_name,
            $model_id,
            $type,
            $timestamp,
            $json
        )
    `);
    stmts.update_zigbee_devices_v2 = prepareStatement(`
            UPDATE
                zigbee_devices_v2
            SET
                friendly_name = $friendly_name,
                model_id = $model_id,
                type = $type,
                timestamp = $timestamp,
                json = $json
            WHERE
                ieee_address = $ieee_address
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
 * promisify(db.all) -> crash...
 */
function select(
    qstring: string,
    params: any = undefined,
): Promise<Array<Record<string, any>>> {
    log.debug(`executing query: `, qstring, params);
    return new Promise((resolve, reject) => {
        db.all(qstring, params, (error, rows) => {
            if (error) {
                return reject(error);
            }
            resolve(rows as any);
        });
    });
}

function prepareStatement(sql: string): StatementWrapper {
    return {
        sql,
        statement: db.prepare(sql),
    };
}

function runStatement(
    wrapper: StatementWrapper,
    ...args: Array<any>
): Promise<void> {
    log.debug(`executing statement: `, oneLine`${wrapper.sql}`, args);
    return new Promise<void>((resolve, reject) => {
        wrapper.statement.run(
            ...args,
            (error: Error) => {
                if (error) reject(error); else resolve();
            },
        );
    });
}

export async function deleteYeelightDevice(id: string) {
    return runStatement(
        stmts.delete_from_yeelight_devices,
        id
    );
}

export async function insertIntoDeviceMessagesUnified(
    deviceId: string,
    timestamp: number,
    json: IZigbeeDeviceMessage | null
) {
    return runStatement(
        stmts.insert_into_device_messages_unified, {
            $device_id: deviceId,
            $timestamp: timestamp,
            $json: json ? JSON.stringify(json) : null,
        }
    );
}

export async function insertIntoYeelightDeviceMessages(
    deviceId: string,
    timestamp: number,
    json: any
) {
    return runStatement(
        stmts.insert_into_yeelight_device_messages,
        deviceId,
        timestamp,
        json ? JSON.stringify(json) : null,
    );
}

export async function insertIntoValveStatusMessages(
    timestamp: number,
    json: any,
) {
    return runStatement(
        stmts.insert_into_valve_status_messages, {
            $timestamp: timestamp,
            $json: json ? JSON.stringify(json) : null,
        }
    );
}

export function toMap(rows: Array<any>) {
    const result = {};
    rows.forEach(row => {
        set(result, `${row.device_id}.${row.attribute_type}`, row.value);
    });
    return result;
}

export async function fetchDeviceCustomAttributes(
    params: Partial<IDeviceCustomAttribute> = {},
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
        stmts.insert_into_device_custom_attributes,
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
        stmts.update_device_custom_attributes,
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
            stmts.update_sonoff_devices, {
                $timestamp: timestamp,
                $json: JSON.stringify(device.attributes),
                $device_id: device.id,
            }
        );
    }
    if (existing.length === 0) {
        return runStatement(
            stmts.insert_into_sonoff_devices, {
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

export async function fetchZigbeeDevicesV2(ieeeAddress?: string) {
    const where = [];
    const params: any = {};
    if (ieeeAddress) {
        where.push(`ieee_address = $ieeeAddress`);
        params.$ieeeAddress = ieeeAddress;
    }
    const rows = await select(oneLine`
        SELECT * FROM zigbee_devices_v2
        ${where.length ? "WHERE" : ""} ${where.join(" AND ")}
        ORDER BY model_id, ieee_address
    `, params);
    return unwrapJson(rows);
}

export async function createOrUpdateZigbeeDevice(device: IZigbee2MqttBridgeDevice) {
    const {
        ieee_address,
        friendly_name,
        model_id,
        type,
        ...rest
    } = device;
    const json = JSON.stringify(rest);
    const timestamp = Date.now();
    const existing = await fetchZigbeeDevicesV2(ieee_address);
    if (existing.length === 1) {
        return runStatement(
            stmts.update_zigbee_devices_v2, {
                $friendly_name: friendly_name,
                $model_id: model_id,
                $type: type,
                $timestamp: timestamp,
                $json: json,
                $ieee_address: ieee_address,
            }
        );
    }
    if (existing.length === 0) {
        return runStatement(
            stmts.insert_into_zigbee_devices_v2, {
                $ieee_address: ieee_address,
                $friendly_name: friendly_name,
                $model_id: model_id,
                $type: type,
                $timestamp: timestamp,
                $json: json,
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
        stmts.insert_into_yeelight_devices,
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

/** @deprecated */
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

export async function fetchValveStatusMessages(
    historyWindowSize?: number,
    origin?: string,
) {
    const where = [];
    const params: any = {};
    if (historyWindowSize) {
        where.push(`timestamp > $timestamp`);
        params.$timestamp = Date.now() - historyWindowSize;
    }
    if (origin) {
        where.push(`json_extract(json, '$.origin') like $origin`);
        params.$origin = `%${origin}%`;
    }
    const rows = await select(oneLine`
        SELECT * FROM valve_status_messages
        ${where.length ? "WHERE" : ""} ${where.join(" AND ")}
        ORDER BY timestamp DESC
    `, params);
    return unwrapJson(rows);
}

export async function fetchDeviceMessagesUnified(
    historyWindowSize?: number,
    deviceId?: string,
    onlyLastMessage = false,
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
        ${where.length ? "WHERE" : ""} ${where.join(" AND ")}
        ORDER BY timestamp DESC
        ${onlyLastMessage ? " LIMIT 1" : ""}
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
        stmts.insert_into_zigbee_devices,
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

// db.run(`DROP TABLE valve_status_messages`);
// db.run(`delete from device_messages_unified where device_id = '0x00158d00067cb0c9' and json is NULL`);

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
//     log.debug('updateLastSeen', friendlyName);
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

// deletion replaced with INSERT OR IGNORE
// db.run(`DELETE FROM device_custom_attributes`);
// db.run(`
//     ALTER TABLE valve_status_messages
//     RENAME COLUMN data TO json
// `);

// db.run(`DROP TABLE sonoff_devices`);
// db.run(`DROP TABLE zigbee_devices`);
// db.run(`DROP TABLE valve_status_messages`);

// SELECT
//   datetime(TIMESTAMP/1000, 'unixepoch', 'localtime'),
//   json_extract(json, '$.time') as time
// from valve_status_messages where time < 50 ORDER BY timestamp DESC

// db.run(`DROP TABLE zigbee_devices_v2`);