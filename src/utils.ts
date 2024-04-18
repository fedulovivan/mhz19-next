/* eslint-disable no-await-in-loop */

import axios from 'axios';
import type { ExecException } from 'child_process';
import { exec } from 'child_process';
import { Response } from 'express';
import humanizeDuration from 'humanize-duration';
import { MqttClient } from 'mqtt';
import os from 'os';
// @ts-ignore
import { Device } from 'yeelight-platform';

import { DEVICE } from 'src/constants';
import { fetchSonoffDevices, insertIntoDeviceMessagesUnified } from 'src/db';
import * as lastDeviceState from 'src/lastDeviceState';
import logger, { withDebug } from 'src/logger';
import type { IMqttMessageDispatcherHandler, IZigbeeDeviceMessage } from 'src/typings';

const bedroomCeilingLight = new Device({
    host: '192.168.88.169', port: 55443
});
bedroomCeilingLight.connect();

const debug = withDebug('utils');

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

export function mqttMessageDispatcher(
    mqttClient: MqttClient,
    handlersMap: Array<[
        topicPrefixOrDeviceId: DEVICE | string,
        handler: IMqttMessageDispatcherHandler,
    ]>,
    excludedTopics?: Array<string>
) {
    mqttClient.on('message', async function (fullTopic, message) {

        if (excludedTopics?.length && excludedTopics.includes(fullTopic)) {
            return;
        }

        debug('\ntopic:', fullTopic);
        const rawMessage = message.toString();
        let json: IZigbeeDeviceMessage | null = null;
        const timestamp = (new Date()).valueOf();

        try {
            json = JSON.parse(rawMessage);
            debug('json:', json);
        } catch (e) {
            debug('string:', rawMessage);
        }

        let deviceId: DEVICE;
        if (fullTopic.startsWith('zigbee2mqtt/0x')) {
            deviceId = fullTopic.split('/')[1] as unknown as DEVICE;
        }

        // const isKnownDevice
        // const isHandlerForDeviceName = !!DEVICE_NAME_TO_ID[topicPrefixOrDeviceName];
        // const deviceIdFromMap = DEVICE_NAME_TO_ID[topicPrefixOrDeviceId];
        // deviceName: DEVICE[deviceIdFromTopic as keyof DEVICE],
        // deviceName: deviceIdFromMap ? topicPrefixOrDeviceId : undefined,

        handlersMap.forEach(([topicPrefixOrDeviceId, handler]) => {

            const isDeviceRule = topicPrefixOrDeviceId === deviceId;
            const isWildcardRule = fullTopic.startsWith(topicPrefixOrDeviceId as string);
            const shouldHandle = isDeviceRule || isWildcardRule;

            // isDeviceMessage,

            // debug({
            //     isDeviceRule,
            //     shouldHandle,
            //     isWildcardRule,
            //     fullTopic,
            //     topicPrefixOrDeviceId,
            // })

            if (shouldHandle) {
                handler({
                    fullTopic,
                    json,
                    timestamp,
                    rawMessage,
                    deviceId,
                });
            }
        });

        if (deviceId!) {
            insertIntoDeviceMessagesUnified(deviceId, timestamp, json);
            lastDeviceState.set(deviceId, json);
        }

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

export class Fifo {
    #maxLength = 3;
    #queue: Array<number> = [];
    #name: string;
    toString(): string {
        return this.#name;
    }
    constructor(name: string) {
        this.#name = name;
    }
    push(value: number) {
        this.#queue.push(value);
        if (this.length() > this.#maxLength) this.#queue.shift();
    }
    get(): Array<number> {
        return this.#queue;
    }
    length(): number {
        return this.#queue.length;
    }
    reset(): void {
        this.#queue = [];
    }
    full(): boolean {
        return this.length() === this.#maxLength;
    }
}

export async function postSonoffSwitchMessage(cmd: 'on' | 'off', deviceId: string) {
    if (!deviceId) throw new Error('id is required');
    const devices = await fetchSonoffDevices({ id: deviceId });
    if (devices.length !== 1) throw new Error('expected to fetch one device from db');
    const hostPort = [devices[0].ip, devices[0].port].join(':');
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
    const host = await exec2(`uptime -p`);
    const now = new Date();
    const appUptime = now.getTime() - STARTED_AT.getTime();
    return {
        host: host[0].replace('up ', ''),
        application: humanizeDuration(appUptime, { round: true, largest: 3 }),
    };
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

export class Alerter {
    static repeats = 0;
    static maxRepeats = 15;
    static raised: boolean;
    static playing: boolean;
    static async on() {
        Alerter.repeats = 0;
        Alerter.raised = true;
        while (Alerter.raised && !Alerter.playing && Alerter.repeats < Alerter.maxRepeats) {
            Alerter.playing = true;
            try {
                debug(`Playing alert sound, repeat #${Alerter.repeats + 1}...`);
                await playAlertSingle();
                debug(`Succeeded`);
                Alerter.playing = false;
            } catch (e) {
                debug(`Playing failed`);
                Alerter.playing = false;
            }
            Alerter.repeats += 1;
            if (Alerter.repeats === Alerter.maxRepeats) {
                debug(`Max repeats reached`);
            }
            await asyncTimeout(1000);
        }
    }
    static isRaised() {
        return this.raised;
    }
    static off() {
        Alerter.repeats = 0;
        Alerter.raised = false;
    }
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

/** deprecated */
// export async function postIkeaLedBulb(state: 'on' | 'off') {
//     debug(`sending state=${state} to ${DEIKEA_400LM_LED_BULB}...`);
//     mqttClient.publish(`zigbee2mqtt/${DEVICE_NAME_TO_ID[IKEA_400LM_LED_BULB]}/set/state`, state);
//     // https://www.zigbee2mqtt.io/guide/usage/mqtt_topics_and_messages.html#zigbee2mqtt-friendly-name-set
//     // zigbee2mqtt/0x000d6ffffefc0f29/set/brightness 100
// }
