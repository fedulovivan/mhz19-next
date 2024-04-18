import bot from 'src/bot';
import { DEVICE, DEVICE_NAME } from 'src/constants';
import { withDebug } from 'src/logger';
import mqttClient from 'src/mqttClient';
import {
    getChatId,
    notNil,
    postSonoffSwitchMessage,
    yeelightDeviceSetPower,
} from 'src/utils';

import type { TOutputActionImpl } from './index.d';

const debug = withDebug('automation-engine');

export const PostSonoffSwitchMessage: TOutputActionImpl = async (dstDeviceId, data) => {
    debug(`Executing PostSonoffSwitchMessage action`);
    return postSonoffSwitchMessage(data as any, dstDeviceId as DEVICE);
};

export const YeelightDeviceSetPower: TOutputActionImpl = async (dstDeviceId, data) => {
    debug(`Executing YeelightDeviceSetPower action`);
    return yeelightDeviceSetPower(dstDeviceId as DEVICE, data as any);
};

export const Zigbee2MqttSetState: TOutputActionImpl = async (dstDeviceId, data) => {
    debug(`Executing Zigbee2MqttSetState action for dstDeviceId=${dstDeviceId} (${DEVICE_NAME[dstDeviceId!]})`);
    mqttClient.publish(`zigbee2mqtt/${dstDeviceId}/set/state`, data as any);
};

export const ValveSetState: TOutputActionImpl = async (dstDeviceId, data) => {
    debug(`Executing ValveSetState action for dstDeviceId=${dstDeviceId} (${DEVICE_NAME[dstDeviceId!]})`);
    mqttClient.publish(`/VALVE/${dstDeviceId}/STATE/SET`, data as any);
};

export const TelegramBotMessage: TOutputActionImpl = async (dstDeviceId, data) => {
    debug(`Executing TelegramBotMessage action`);
    bot.sendMessage(getChatId(), data as any);
};
