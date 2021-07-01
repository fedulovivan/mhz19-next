import Debug from 'debug';
import { Device, Discovery } from 'yeelight-platform';

import { insertIntoYeelightDeviceMessages, insertIntoYeelightDevices } from 'src/db2';
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

    const deviceClient: Device = new Device({ host, port });
    yeelightDevices.set(id, deviceClient);
    deviceClient.connect();
    deviceClient.on('connected', () => {
        log.info(`yeelight device ${id} connected`);
    });
    deviceClient.on('deviceUpdate', (newProps: any) => {
        insertIntoYeelightDeviceMessages(
            id,
            Date.now(),
            { result: newProps.result }
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
