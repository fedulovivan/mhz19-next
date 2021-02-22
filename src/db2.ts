import sqlite3, { Statement } from 'sqlite3';

const db = new sqlite3.Database(':memory:');

let insert_into_valve_status_messages: Statement;

db.serialize(function() {
    db.run(`CREATE TABLE valve_status_messages (data TEXT, timestamp INTEGER)`);
    insert_into_valve_status_messages = db.prepare(`INSERT INTO valve_status_messages VALUES(?, ?)`);
});

export function insertIntoValveStatusMessages(data: string, timestamp: number) {
    insert_into_valve_status_messages.run(data, timestamp);
    // insert_into_valve_status_messages.finalize();
}

export default db;