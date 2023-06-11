// import mqttClient from 'src/mqttClient';

import { withCategory } from '../logger';
import { TOutputActionImpl, TPayloadConditionFunctionImpl } from './types';

const log = withCategory('mhz19-automation-engine');

export const PostSonoffSwitchMessage: TOutputActionImpl = (deviceId, data, supportedAdapters) => {
    log.debug(`Executing PostSonoffSwitchMessage action`);
    const adapter = supportedAdapters.Sonoff();
    adapter(data, deviceId);
};

export const YeelightDeviceSetPower: TOutputActionImpl = (deviceId, data, supportedAdapters) => {
    log.debug(`Executing YeelightDeviceSetPower action`);
    const adapter = supportedAdapters.Yeelight();
    adapter(deviceId, data);
};

export const Zigbee2MqttSetState: TOutputActionImpl = (deviceId, data, supportedAdapters) => {
    log.debug(`Executing Zigbee2MqttSetState action`);
    const adapter = supportedAdapters.Mqtt();
    adapter.publish(`zigbee2mqtt/${deviceId}/set/state`, data);
};

// export const YeelightDeviceSetPower: TOutputActionImpl = (deviceId, data, supportedAdapters) => {

// }
