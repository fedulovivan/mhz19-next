import Debug from 'debug';
// @ts-ignore
import { Device, Discovery } from 'yeelight-platform';

import {
    deleteYeelightDevice,
    insertIntoYeelightDeviceMessages,
    insertIntoYeelightDevices,
} from 'src/db';
import log, { withDebug } from 'src/logger';

const debug = withDebug('mhz19-yeelight-devices');
// const debug = Debug('mhz19-yeelight-devices');

const yeelightDevices: Map<string, Device> = new Map();

const discoveryService = new Discovery();
discoveryService.on('started', () => {
    debug('yeelight-platform Discovery Started');
});
discoveryService.on('didDiscoverDevice', async (device: IYeelightDevice) => {

    debug('yeelight-platform didDiscoverDevice:', device);

    const {
        id: deviceId,
        Location: location,
        model,
        support,
        host,
        port,
        power,
        ...json
    } = device;

    if (yeelightDevices.has(deviceId)) {
        log.warn(`"didDiscoverDevice" event received for device ${deviceId} which is already registered`);
        return;
    }

    const deviceClient: Device = new Device({
        host,
        port,
        interval: 30000, // polling interval
        tracked_attrs: ['power', 'bright'],
        debug: true,
    });
    yeelightDevices.set(deviceId, deviceClient);
    deviceClient.connect();
    deviceClient.on('connected', () => {
        debug(`yeelight device ${deviceId} "connected" event received`);
    });
    deviceClient.on('disconnected', async () => {
        if (!yeelightDevices.has(deviceId)) {
            log.warn(`"disconnected" event received for device ${deviceId} which is already deleted`);

            // hack to fix internal yeelight-platform bug with endless reconnects
            // clearTimeout(deviceClient.retry_timer);
            // deviceClient.retry_timer = null;
            // deviceClient.socket.destroy();
            // deviceClient.socket = null;

            return;
        }
        try {
            await deleteYeelightDevice(deviceId);
            yeelightDevices.delete(deviceId);
            debug(`yeelight device ${deviceId} is deleted`);
        } catch (e) {
            log.error(`error in deleteYeelightDevice: `, e);
        }
    });
    // deviceClient.on('socketEnd', () => debug('socketEnd'));
    // deviceClient.on('socketError', (err) => log.error('socketError: ', err));
    deviceClient.on('deviceUpdate', async (newProps: any) => {
        if (!yeelightDevices.has(deviceId)) {
            log.warn(`"deviceUpdate" event received for device ${deviceId} which is already deleted`);
            return;
        }
        try {
            await insertIntoYeelightDeviceMessages(
                deviceId,
                Date.now(),
                newProps
            );
        } catch (e) {
            log.error(`error in insertIntoYeelightDeviceMessages: `, e);
        }
    });

    try {
        await insertIntoYeelightDevices(
            deviceId,
            location,
            model,
            support,
            host,
            port,
            power,
            json,
        );
        debug(`yeelight device ${deviceId} is registered`);
    } catch (e) {
        log.error(`error in insertIntoYeelightDevices: `, e);
    }

});

// start listening but avoid blocking "main thread"
setTimeout(() => discoveryService.listen(), 0);

export default yeelightDevices;
