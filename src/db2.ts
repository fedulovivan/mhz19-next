/* eslint-disable camelcase */

import Debug from 'debug';
import sqlite3, { Statement } from 'sqlite3';

import { IZigbeeDeviceMessage } from 'src/typings';
import { IAqaraTemperatureSensorMessage, IZigbee2mqttBridgeConfigDevice } from 'src/typings/index.d';

const debug = Debug('mhz19-db2');

const db = new sqlite3.Database('database.bin');
// const db = new sqlite3.Database(':memory:');

let insert_into_valve_status_messages: Statement;
// let insert_into_temperature_sensor_messages: Statement;
let insert_into_zigbee_devices: Statement;
let insert_into_device_messages_unified: Statement;
// let update_zigbee_device: Statement;

db.serialize(function() {

    // create all tables
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
            battery REAL
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS valve_status_messages (
            data TEXT,
            timestamp INTEGER
        )
    `);

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

    db.run(`
        CREATE TABLE IF NOT EXISTS device_messages_unified (
            device_id STRING,
            timestamp INTEGER,
            json STRING
        )
    `);

    // clean list of registered devices on startup
    db.run(`DELETE FROM zigbee_devices`);

    // db.run(`DELETE FROM device_messages_unified WHERE timestamp = 1624201243638`);

    // prepare insert/update statements
    insert_into_valve_status_messages = db.prepare(`
        INSERT INTO valve_status_messages VALUES(?, ?)
    `);
    // insert_into_temperature_sensor_messages = db.prepare(`
    //     INSERT INTO temperature_sensor_messages VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    // `);
    insert_into_zigbee_devices = db.prepare(`
        INSERT INTO zigbee_devices VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert_into_device_messages_unified = db.prepare(`
        INSERT INTO device_messages_unified VALUES(?, ?, ?)
    `);
    // update_zigbee_device = db.prepare(`
    //     UPDATE zigbee_devices
    //     SET last_seen = ?, voltage =?, battery = ?
    //     WHERE friendly_name = ?
    // `);

});

export function insertIntoDeviceMessagesUnified(
    deviceId: string,
    timestamp: number,
    json: IZigbeeDeviceMessage | null
) {
    insert_into_device_messages_unified.run(
        deviceId,
        timestamp,
        json ? JSON.stringify(json) : null,
    );
}

export function insertIntoValveStatusMessages(data: string, timestamp: number) {
    insert_into_valve_status_messages.run(data, timestamp);
}

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

export function insertIntoZigbeeDevices(
    json: IZigbee2mqttBridgeConfigDevice
) {
    insert_into_zigbee_devices.run(
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
    );
}

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

export default db;
