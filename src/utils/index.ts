/* eslint-disable no-await-in-loop */

import axios from 'axios';
import type { ExecException } from 'child_process';
import { exec } from 'child_process';
import { Response } from 'express';
import humanizeDuration from 'humanize-duration';
import { MqttClient } from 'mqtt';
import os from 'os';
// @ts-ignore
import { Device as YeelightDevice } from 'yeelight-platform';

import { BEDROOM_CEILING_LIGHT_IP, DEVICE } from 'src/constants';
// import { fetchSonoffDevices, insertIntoDeviceMessagesUnified } from 'src/db';
import Device from 'src/db/Device';
import type { IDeviceCustomAttributeModel } from 'src/db/DeviceCustomAttribute';
import DeviceCustomAttribute from 'src/db/DeviceCustomAttribute';
import Message from 'src/db/Message';
import * as lastDeviceState from 'src/lastDeviceState';
import logger, { withDebug } from 'src/logger';
import type { IMqttMessageDispatcherHandler, IZigbeeDeviceMessage } from 'src/typings';

import mqttMessageDispatcher from './mqttMessageDispatcher';
import Queue from './queue';

const bedroomCeilingLight = new YeelightDevice({
    host: BEDROOM_CEILING_LIGHT_IP,
    port: 55443,
});
bedroomCeilingLight.connect();

const debug = withDebug('utils-main');

export const STARTED_AT = new Date();

/**
 * search tags: delayAsync
 */
export async function asyncTimeout(timeout: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}

export function sendError(res: Response, e: Error | string) {
    res.status(500).json({
        error: true,
        message: e instanceof Error ? e.message : e,
    });
}

export function getOptInt(input?: string): number | undefined {
    if (input) {
        return parseInt(input, 10);
    }
}

export function getServerIps(): Array<string> {
    const interfaces = os.networkInterfaces();
    const result: Array<string> = [];
    Object.keys(interfaces).forEach(ikey => {
        const interfaceIps = interfaces[ikey];
        interfaceIps?.forEach(iface => {
            if (!iface.internal && iface.family === 'IPv4') {
                result.push(iface.address);
            }
        });
    });
    return result;
}

export function getChatId(): number {
    return parseInt(process.env.TELEGRAM_CHATID!, 10);
}

export function getAppPort(): number {
    return /* parseInt(process.env.APP_PORT!, 10) */8888;
}

export function getAppUrl(): string {
    const ips = getServerIps();
    return `http://${ips[0]}:${getAppPort()}`;
}

export function mean(values: Array<number>): number {
    return values.reduce((memo, value) => {
        memo += value;
        return memo;
    }, 0) / values.length;
}

export function stdDev(values: Array<number>): number {
    const meanValue = mean(values);
    const variance = values.reduce((memo, value) => {
        memo += (value - meanValue) ** 2;
        return memo;
    }, 0) / values.length;
    return Math.sqrt(variance);
}

export async function postSonoffSwitchMessage(cmd: 'on' | 'off', deviceId: string) {
    if (!deviceId) throw new Error('id is required');
    // const devices = await fetchSonoffDevices({ id: deviceId });
    const devices = await Device.findAll({ where: { device_id: deviceId } });
    if (devices.length !== 1) throw new Error('expected to fetch one device from db');
    const deviceJson = devices[0].dataValues.json;
    const hostPort = [deviceJson?.ip, deviceJson?.port].join(':');
    const url = `http://${hostPort}/zeroconf/switch`;
    const payload = { "data": { "switch": cmd } };
    debug(`sending to sonoff relay. url="${url}" payload="${JSON.stringify(payload)}" ...`);
    try {
        const result = await axios.post(url, payload);
        debug('relay response ', result.data);
        return result.data;
    } catch (e) {
        logger.error(e);
    }
    // to get current state
    // POST { "deviceid": "", "data": { } } to /zeroconf/info
    // response
    // {
    //   "seq": 2,
    //   "error": 0,
    //   "data": {
    //     "switch": "off",
    //     "startup": "off",
    //     "pulse": "off",
    //     "pulseWidth": 500,
    //     "ssid": "eWeLink",
    //     "otaUnlock": false,
    //     "fwVersion": "3.5.0",
    //     "deviceid": "100000140e",
    //     "bssid": "ec:17:2f:3d:15:e",
    //     "signalStrength": -25
    //   }
    // }
}

export async function yeelightDeviceSetPower(deviceId: string, state: 'on' | 'off') {
    // const bedroomCeilingLight = yeelightDevices.get(deviceId);
    // if (bedroomCeilingLight) {
    // }
    bedroomCeilingLight.sendCommand({
        id: -1,
        method: 'set_power',
        params: [state, 'smooth', 0],
    });
}

export const uptime = async () => {

    // uptime's option "pretty" is available only in ubuntu, so we ought to parse more complex string to make implementation universal
    // macos v1 "13:21  up 1 day, 19 hrs, 4 users, load averages: 1.07 1.83 2.14"
    // macos v2 "13:41  up 1 day, 19:20, 4 users, load averages: 1.92 1.82 1.83"
    // ubuntu "13:20:22 up 22 days,  1:32,  2 users,  load average: 0.42, 0.29, 0.21"
    // alpine "12:39:53 up 22 days, 51 min,  0 users,  load average: 0.37, 0.37, 0.34"
    const [stdout] = await exec2(`uptime`);
    const ss = stdout.split(/up/);
    const sss = ss[1].split(/,\s+\d+ users/);
    const host = sss[0].trim();

    const now = new Date();
    const appUptime = now.getTime() - STARTED_AT.getTime();
    const application = humanizeDuration(appUptime, { round: true, largest: 3 });

    return { host, application };
};

export const exec2 = (cmd: string) => new Promise<[stdout: string, stderr: string]>((resolve, reject) => {
    exec(cmd, (error: ExecException | null, stdout: string, stderr: string) => {
        if (error) reject(error);
        resolve([stdout.trim(), stderr.trim()])
    });
});

export const playAlertSingle = () => exec2(`mpg123 ./assets/siren.mp3`);

// export function playAlertSingle() {
//     return new Promise((resolve, reject) => {
//         exec(`mpg123 ./siren.mp3`, (error, stdout, stderr) => {
//             if (error) reject(error);
//             resolve([stdout, stderr]);
//         });
//     });
// }

export function saveGraphvizNetworkmap(data: string, format: 'svg' | 'png' = 'svg') {
    return new Promise((resolve, reject) => {
        exec(`echo '${data}' | circo -T${format} > ./images/networkmap.${format}`, (error, stdout, stderr) => {
            if (error) reject(error);
            resolve([stdout, stderr]);
        });
    });
}

export function isNil(input: any): input is undefined | null {
    return input === undefined || input === null;
}

/**
 * type guard borrowed at https://stackoverflow.com/a/62753258/1012298
 */
export function notNil<T>(input: T | undefined | null | void): input is T {
    return !isNil(input);
}

export { mqttMessageDispatcher, Queue };

/** deprecated */
// export async function postIkeaLedBulb(state: 'on' | 'off') {
//     debug(`sending state=${state} to ${DEIKEA_400LM_LED_BULB}...`);
//     mqttClient.publish(`zigbee2mqtt/${DEVICE_NAME_TO_ID[IKEA_400LM_LED_BULB]}/set/state`, state);
//     // https://www.zigbee2mqtt.io/guide/usage/mqtt_topics_and_messages.html#zigbee2mqtt-friendly-name-set
//     // zigbee2mqtt/0x000d6ffffefc0f29/set/brightness 100
// }
