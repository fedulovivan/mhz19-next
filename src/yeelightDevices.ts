import Debug from 'debug';
import { Device, Discovery } from 'yeelight-platform';

import {
    deleteYeelightDevice,
    insertIntoYeelightDeviceMessages,
    insertIntoYeelightDevices,
} from 'src/db';
import log from 'src/logger';
import { IYeelightDevice } from 'src/typings/index.d';

const debug = Debug('mhz19-yeelight-devices');

const yeelightDevices: Map<string, Device> = new Map();

const discoveryService = new Discovery();
discoveryService.on('started', () => {
    debug('yeelight-platform Discovery Started');
});
discoveryService.on('didDiscoverDevice', async (device: IYeelightDevice) => {

    debug('yeelight-platform didDiscoverDevice:', device);

    const {
        id,
        Location: location,
        model,
        support,
        host,
        port,
        power,
        ...json
    } = device;

    if (yeelightDevices.has(id)) {
        log.warn(`yeelight device ${id} already registered`);
        return;
    }

    const deviceClient: Device = new Device({
        host,
        port,
        interval: 30000, // polling interval
        tracked_attrs: ['power', 'bright'],
        debug: true,
    });
    yeelightDevices.set(id, deviceClient);
    deviceClient.connect();
    deviceClient.on('connected', () => {
        log.info(`yeelight device ${id} "connected" event received`);
    });
    deviceClient.on('disconnected', () => {
        // log.info(`yeelight device ${id} "disconnected" event received`);
        deleteYeelightDevice(id);
    });
    // deviceClient.on('socketEnd', () => log.info('socketEnd'));
    // deviceClient.on('socketError', (err) => log.error('socketError: ', err));
    deviceClient.on('deviceUpdate', (newProps: any) => {
        insertIntoYeelightDeviceMessages(
            id,
            Date.now(),
            newProps
        );
    });

    try {

        await insertIntoYeelightDevices(
            id,
            location,
            model,
            support,
            host,
            port,
            power,
            json,
        );

    } catch (e) {
        log.error(`error in insertIntoYeelightDevices: `, e);
    }

});

// start listening but avoid blocking "main thread"
setTimeout(() => discoveryService.listen(), 0);

export default yeelightDevices;
