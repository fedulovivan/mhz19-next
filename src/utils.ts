/* eslint-disable no-await-in-loop */

import axios from 'axios';
import { exec } from 'child_process';
import config from 'config';
import Debug from 'debug';
import { Response } from 'express';
import { MqttClient } from 'mqtt';
import os from 'os';

import {
    BEDROOM_CEILING_LIGHT,
    DEVICE_NAME_TO_ID,
    IKEA_400LM_LED_BULB,
} from 'src/constants';
import { fetchSonoffDevices, insertIntoDeviceMessagesUnified } from 'src/db';
import log, { withDebug } from 'src/logger';
import mqttClient from 'src/mqttClient';
import yeelightDevices from 'src/yeelightDevices';

// import { IMqttMessageDispatcherHandler, IZigbeeDeviceMessage } from 'src/typings';

// const debug = Debug('mhz19-dispatcher');
const debug = withDebug('mhz19-utils');

/**
 * AKA delayAsync
 */
export async function asyncTimeout(timeout: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}

export function sendError(res: Response, e: Error | string) {
    res.json({
        error: true,
        message: e instanceof Error ? e.message : e,
    });
}

export function mqttMessageDispatcher(
    mqttClient: MqttClient,
    handlersMap: Array<[
        topicPrefixOrDeviceName: string,
        handler: IMqttMessageDispatcherHandler,
    ]>,
) {
    mqttClient.on('message', async function (fullTopic, message) {

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

        if (fullTopic.startsWith('zigbee2mqtt/0x')/*  || fullTopic.startsWith('zigbee2mqtt/bridge') */) {
            const [, deviceId] = fullTopic.split('/');
            insertIntoDeviceMessagesUnified(deviceId, timestamp, json);
        }

        handlersMap.forEach(([topicPrefixOrDeviceName, handler]) => {
            const deviceId = DEVICE_NAME_TO_ID[topicPrefixOrDeviceName];
            const deviceName = deviceId ? topicPrefixOrDeviceName : undefined;
            if (fullTopic.startsWith(deviceId ? `zigbee2mqtt/${deviceId}` : topicPrefixOrDeviceName)) {
                handler({
                    fullTopic,
                    json,
                    timestamp,
                    rawMessage,
                    deviceId,
                    deviceName
                });
            }
        });
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

export function getAppUrl(): string {
    const ips = getServerIps();
    return `http://${ips[0]}:${config.app.port}`;
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
        log.error(e);
    }
}

export async function postBedroomCeilingLightMessage(state: 'on' | 'off') {
    debug(`sending state=${state} to ${BEDROOM_CEILING_LIGHT}...`);
    const bedroomCeilingLight = yeelightDevices.get(DEVICE_NAME_TO_ID[BEDROOM_CEILING_LIGHT]);
    bedroomCeilingLight.sendCommand({
        id: -1,
        method: 'set_power',
        params: [state, 'smooth', 0],
    });
}

export async function postIkeaLedBulb(state: 'on' | 'off') {
    debug(`sending state=${state} to ${IKEA_400LM_LED_BULB}...`);
    mqttClient.publish(`zigbee2mqtt/${DEVICE_NAME_TO_ID[IKEA_400LM_LED_BULB]}/set/state`, state);
    // https://www.zigbee2mqtt.io/guide/usage/mqtt_topics_and_messages.html#zigbee2mqtt-friendly-name-set
    // zigbee2mqtt/0x000d6ffffefc0f29/set/brightness 100
}

export function playAlertSigle() {
    return new Promise((resolve, reject) => {
        exec(`mpg123 ./siren.mp3`, (error, stdout, stderr) => {
            if (error) reject(error);
            resolve([stdout, stderr]);
        });
    });
}

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
                log.info(`Playing alert sound, repeat #${Alerter.repeats + 1}...`);
                await playAlertSigle();
                log.info(`Succeeded`);
                Alerter.playing = false;
            } catch (e) {
                log.info(`Playing failed`);
                Alerter.playing = false;
            }
            Alerter.repeats += 1;
            if (Alerter.repeats === Alerter.maxRepeats) {
                log.info(`Max repeats reached`);
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
