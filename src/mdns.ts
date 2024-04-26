import EventEmitter from 'events';
import { isArray } from 'lodash-es';
import mdnsClass from 'multicast-dns';

import logger, { withDebug } from 'src/logger';
import type { ISonoffDevice, TSonoffDevicesMap } from 'src/typings';

import { notNil } from './utils';

const debug = withDebug('mdns');

const updatesChannel = new EventEmitter();

const mdns = mdnsClass();

const devices: TSonoffDevicesMap = new Map();

mdns.on('response', function (response) {
    debug(response);
    const { answers } = response;
    const sonoffDeviceData: Partial<ISonoffDevice> = {};
    answers.forEach(answer => {
        if (answer.type === 'A') {
            sonoffDeviceData.ip = answer.data;
        }
        if (answer.type === 'SRV') {
            sonoffDeviceData.port = answer.data.port;
        }
        if (answer.type === 'TXT' && isArray(answer.data)) {
            sonoffDeviceData.rawData = [];
            (answer.data as Array<Buffer>).forEach((bufferDataItem) => {
                if (bufferDataItem instanceof Buffer) {
                    const bufferString = bufferDataItem.toString('utf8');
                    (sonoffDeviceData.rawData!).push(bufferString);
                    if (bufferString.startsWith('data1=')) {
                        try {
                            const attributes = JSON.parse(bufferString.slice(6));
                            Object.assign(sonoffDeviceData, attributes);
                        } catch (e) {
                            logger.error('failed to parse json from data1');
                        }
                    } else if (bufferString.startsWith('type=')) {
                        sonoffDeviceData.type = bufferString.slice(5);
                    } else if (bufferString.startsWith('id=')) {
                        sonoffDeviceData.id = bufferString.slice(3);
                    }
                }
            });
        }
    });
    if (notNil(sonoffDeviceData.id) && notNil(sonoffDeviceData.type)) {
        devices.set(sonoffDeviceData.id, sonoffDeviceData as ISonoffDevice);
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
