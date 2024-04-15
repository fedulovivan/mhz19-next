/* eslint-disable no-shadow */

import { DEVICE } from 'src/constants';

export enum OutputAction {
    PostSonoffSwitchMessage = 'PostSonoffSwitchMessage',
    YeelightDeviceSetPower = 'YeelightDeviceSetPower',
    Zigbee2MqttSetState = 'Zigbee2MqttSetState',
    ValveSetState = 'ValveSetState',
    TelegramBotMessage = 'TelegramBotMessage',
}

export enum PayloadConditionFunction {
    Equal = 'Equal',
    InList = 'InList',
    Changed = 'Changed',
}

export enum OutputLayerAdapter {
    Mqtt = 'Mqtt',
    Sonoff = 'Sonoff',
    Yeelight = 'Yeelight',
    Telegram = 'Telegram',
}

export interface IInputRuleZigbeeMessage {
    srcDevices: Array<DEVICE>;
    payloadConditions?: TPayloadConditions;
    conditionOperator?: 'AND' | 'OR';
}

export type MessageFields = "$message.action" | string | boolean | number;

export interface IPayloadCondition {
    field: MessageFields;
    function: PayloadConditionFunction;
    arguments?: Array<MessageFields>; // TODO this should not be MessageFields
    /**
     * target device to take last message from,
     * when empty IInputRuleBase["deviceId"] is used
     */
    otherDeviceId?: DEVICE;
}

export type TPayloadConditions = Array<IPayloadCondition>;

export interface IOutputAction {
    /**
     * which output adapter to use
     */
    type: OutputAction;
    /**
     * target device
     */
    deviceId?: DEVICE;
    /**
     * value to be sent to target:
     * string - hardcoded value to be sent
     * $message.* - value to sent will be taken from input message
     */
    payloadData?: MessageFields | ((message: IZigbeeDeviceMessage, srcDeviceId: DEVICE, dstDeviceId?: DEVICE) => string);
    /**
     * allows to map one exact input value to another, applicable only when payloadData=$message.*
     */
    translation?: Record<string, string>;
    /**
     * command will be executed with delay
     * not dispaching any other command on same target, with abort all delayed commands
     * use case - switch lights off after some some delay
     */
    delay?: number;
}

/**
 * record which defines a map of input message to executed actions
 */
export interface IMappingRecord {
    onZigbeeMessage?: IInputRuleZigbeeMessage;
    actions: Array<IOutputAction>;
}

export type IMappings = Array<IMappingRecord>;

export type TAdapterImpl = () => any;

export interface IActionsExecutorCtrOpts {
    mapping: IMappings;
    supportedOutputActions: Record<OutputAction, TOutputActionImpl>;
    supportedAdapters: Record<OutputLayerAdapter, TAdapterImpl>;
}

export type TMatcherFunc = (
    deviceId: DEVICE,
    message: IZigbeeDeviceMessage,
    payloadConditions: TPayloadConditions,
    supportedConditionFunctions: Record<PayloadConditionFunction, TPayloadConditionFunctionImpl>,
    conditionOperator?: IInputRuleZigbeeMessage["conditionOperator"],
) => boolean;

export type TOutputActionImpl = (
    deviceId: DEVICE,
    data: MessageFields | undefined,
    supportedAdapters: Record<OutputLayerAdapter, TAdapterImpl>,
) => void;

export type TPayloadConditionFunctionImpl = (
    value: MessageFields | undefined,
    arguments?: Array<MessageFields | undefined>,
    prevValue?: MessageFields | undefined,
) => boolean;
