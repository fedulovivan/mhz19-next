import { DEVICE_NAME } from 'src/constants';
import { withDebug } from 'src/logger';

import type { TOutputActionImpl } from './index.d';

const debug = withDebug('automation-engine');

export const PostSonoffSwitchMessage: TOutputActionImpl = (dstDeviceId, data, supportedAdapters) => {
    debug(`Executing PostSonoffSwitchMessage action`);
    const adapter = supportedAdapters.Sonoff();
    adapter(data, dstDeviceId);
};

export const YeelightDeviceSetPower: TOutputActionImpl = (dstDeviceId, data, supportedAdapters) => {
    debug(`Executing YeelightDeviceSetPower action`);
    const adapter = supportedAdapters.Yeelight();
    adapter(dstDeviceId, data);
};

export const Zigbee2MqttSetState: TOutputActionImpl = (dstDeviceId, data, supportedAdapters) => {
    debug(`Executing Zigbee2MqttSetState action for dstDeviceId=${dstDeviceId} (${DEVICE_NAME[dstDeviceId!]})`);
    const adapter = supportedAdapters.Mqtt();
    adapter.publish(`zigbee2mqtt/${dstDeviceId}/set/state`, data);
};

export const ValveSetState: TOutputActionImpl = (dstDeviceId, data, supportedAdapters) => {
    debug(`Executing ValveSetState action for dstDeviceId=${dstDeviceId} (${DEVICE_NAME[dstDeviceId!]})`);
    const adapter = supportedAdapters.Mqtt();
    adapter.publish(`/VALVE/${dstDeviceId}/STATE/SET`, data);
};

export const TelegramBotMessage: TOutputActionImpl = (dstDeviceId, data, supportedAdapters) => {
    debug(`Executing TelegramBotMessage action`);
    const adapter = supportedAdapters.Telegram();
    adapter(data);
};
