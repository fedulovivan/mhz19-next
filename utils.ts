
import mqtt from 'mqtt';
import Debug from 'debug';

export function sendError(res, e) {
    const { message } = e;
    res.json({
        error: true,
        message,
    });
}

export function mqttMessageDispatcher(
    mqttClient: mqtt.MqttClient,
    debug: Debug.Debugger,
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
        Object.keys(mapping).find(topicPrefix => {
            if (topic.startsWith(topicPrefix)) {
                const handler = mapping[topicPrefix];
                handler(topic, json, timestamp, raw);
                return true;
            }
            return false;
        });
        console.error('unknown topic:', topic, raw);
    });
}