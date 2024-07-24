import { MqttClient } from 'mqtt';

import { DEVICE } from 'src/constants';
import Message from 'src/db/Message';
import * as lastDeviceState from 'src/lastDeviceState';
import { withDebug } from 'src/logger';
import type { IMqttMessageDispatcherHandler, IZigbeeDeviceMessage } from 'src/typings';

import { notNil } from './';

const debug = withDebug('mqtt-message-dispatcher');

export default function mqttMessageDispatcher(
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

        let deviceId: DEVICE;
        if (fullTopic.startsWith('zigbee2mqtt/0x') || fullTopic.startsWith('device-pinger/')) {
            deviceId = fullTopic.split('/')[1] as unknown as DEVICE;
        }

        try {
            json = JSON.parse(rawMessage);
            if (deviceId!) debug('json:', json);
        } catch (e) {
            debug('string:', rawMessage);
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

            // insertIntoDeviceMessagesUnified(deviceId, timestamp, json);
            Message.create({
                device_id: deviceId,
                json,
            });

            lastDeviceState.set(deviceId, json);
        }

    });
}
