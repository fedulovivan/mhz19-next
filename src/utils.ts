import config from 'config';
import Debug from 'debug';
import { Response } from 'express';
import { MqttClient } from 'mqtt';
import os from 'os';

import { DEVICE_NAME_TO_ID } from 'src/constants';
import { insertIntoDeviceMessagesUnified } from 'src/db';
import { IMqttMessageDispatcherHandler, IZigbeeDeviceMessage } from 'src/typings';

const debug = Debug('mhz19-dispatcher');

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
        message: e.message || e,
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
