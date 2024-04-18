import EventEmitter from 'events';
import isArray from 'lodash';
import mdnsClass from 'multicast-dns';

import logger, { withDebug } from 'src/logger';
import type { ISonoffDevice, TSonoffDevicesMap } from 'src/typings';

const updatesChannel = new EventEmitter();

const mdns = mdnsClass();

const devices: TSonoffDevicesMap = new Map();

mdns.on('response', function (response) {
    const { answers } = response;
    let sonoffDeviceId: string | null = null;
    const sonoffDeviceData: Partial<ISonoffDevice> = {};
    answers.forEach(answer => {
        if (answer.type === 'A') {
            sonoffDeviceData.ip = answer.data;
        }
        if (answer.type === 'SRV') {
            sonoffDeviceData.port = answer.data.port;
        }
        if (answer.type === 'TXT' && isArray(answer.data)) {
            (answer.data as Array<Buffer>).forEach((bufferDataItem) => {
                if (bufferDataItem instanceof Buffer) {
                    const bufferString = bufferDataItem.toString('utf8');
                    if (bufferString.startsWith('data1=')) {
                        sonoffDeviceData.rawData1 = bufferString;
                        try {
                            sonoffDeviceData.attributes = JSON.parse(bufferString.slice(6));
                        } catch (e) {
                            logger.error('failed to parse json from data1');
                        }
                    }
                    if (bufferString.startsWith('id=')) {
                        sonoffDeviceId = bufferString.slice(3);
                        sonoffDeviceData.id = sonoffDeviceId;
                    }
                }
            });
        }
    });
    if (sonoffDeviceId) {
        sonoffDeviceData.timestamp = Date.now();
        devices.set(sonoffDeviceId, sonoffDeviceData as ISonoffDevice);
    }
    updatesChannel.emit('update', devices);
});

mdns.query({
    questions: [{
        name: '_ewelink._tcp.local',
        type: 'A'
    }]
});

export default updatesChannel;
