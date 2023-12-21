import { MqttClient } from 'mqtt';

import { DEVICE_NAME_TO_ID } from 'lib/constants';
import type { IMqttMessageDispatcherHandler, IZigbeeDeviceMessage } from 'lib/typings';

import { insertIntoDeviceMessagesUnified } from './db';
import { withCategory } from './logger';
import MessageModel from './sqlite/Message';

const log = withCategory('mhz19-dispatcher');

export default function mqttMessageDispatcher(
    mqttClient: MqttClient,
    handlersMap: Array<[
        topicPrefixOrDeviceName: string,
        handler: IMqttMessageDispatcherHandler,
    ]>,
    excludedTopics?: Array<string>
) {
    mqttClient.on('message', async function (fullTopic, message) {

        if (excludedTopics?.length && excludedTopics.includes(fullTopic)) {
            return;
        }

        log.debug('on message, topic:', fullTopic);
        const rawMessage = message.toString();
        let json: IZigbeeDeviceMessage | null = null;
        const now = new Date();

        try {
            json = JSON.parse(rawMessage);
            log.debug('on message, json payload:', json);
        } catch (e) {
            log.debug('on message, string payload:', JSON.stringify(rawMessage));
        }

        let deviceIdFromTopic: string;
        if (fullTopic.startsWith('zigbee2mqtt/0x')/*  || fullTopic.startsWith('zigbee2mqtt/bridge') */) {
            [, deviceIdFromTopic] = fullTopic.split('/');

            // insert into db, old approach
            insertIntoDeviceMessagesUnified(deviceIdFromTopic, now.valueOf(), json);

            // insert into db, new approach
            try {
                await MessageModel.create({
                    device_id: deviceIdFromTopic,
                    timestamp: now,
                    json,
                });
            } catch (e) {
                log.error(e);
            }

        }

        handlersMap.forEach(([topicPrefixOrDeviceName, handler]) => {
            const deviceIdFromMap = DEVICE_NAME_TO_ID[topicPrefixOrDeviceName];
            if (fullTopic.startsWith(deviceIdFromMap ? `zigbee2mqtt/${deviceIdFromMap}` : topicPrefixOrDeviceName)) {
                handler({
                    fullTopic,
                    json,
                    timestamp: now.valueOf(),
                    rawMessage,
                    deviceId: deviceIdFromTopic,
                    deviceName: deviceIdFromMap ? topicPrefixOrDeviceName : undefined,
                });
            }
        });
    });
}