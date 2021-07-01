import Debug from 'debug';
import { Response } from 'express';
import { MqttClient } from 'mqtt';

import { DEVICE_NAME_TO_ID } from 'src/constants';
import { insertIntoDeviceMessagesUnified } from 'src/db2';
import { IMqttMessageDispatcherHandler, IZigbeeDeviceMessage } from 'src/typings';

const debug = Debug('mhz19-dispatcher');

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
