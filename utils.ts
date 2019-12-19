
import mqtt from 'mqtt';
import Debug from 'debug';

const debug = Debug('mhz19-dispatcher');

export function sendError(res: Express.Response, e: Error) {
    const { message } = e;
    res.json({
        error: true,
        message,
    });
}

export function mqttMessageDispatcher(
    mqttClient: mqtt.MqttClient,
    mapping: {
        [topicPrefix: string]: (
            topic: string,
            json: object | null,
            timestamp: number,
            raw: string,
        ) => void
    },
) {
    mqttClient.on('message', async function (topic, message) {
        debug('\ntopic:', topic);
        const raw = message.toString();
        let json: object | null = null;
        const timestamp = (new Date).valueOf();
        try {
            json = JSON.parse(raw);
            debug('json:', json);
        } catch(e) {
            debug('string:', raw);
        }
        const topicPrefix = Object.keys(mapping).find(
            topicPrefix => topic.startsWith(topicPrefix)
        );
        const topicHandler = topicPrefix && mapping[topicPrefix];
        if (!topicHandler) {
            console.error('unknown topic:', topic, raw);
            return;
        }
        topicHandler(topic, json, timestamp, raw);
    });
}