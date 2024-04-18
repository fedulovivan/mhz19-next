/* eslint-disable no-shadow */

import { DEVICE } from 'src/constants';

import {
    OutputAction,
    OutputLayerAdapter,
    PayloadConditionFunction,
} from './enums';

export interface IInputRuleZigbeeMessage {
    srcDevices: Array<DEVICE>;
    payloadConditions?: TPayloadConditions;
    conditionOperator?: 'AND' | 'OR';
    throttle?: number;
}

export type TMessageFieldRuleOrValue = "$message.action" | string | boolean | number | undefined;

export interface IPayloadCondition {
    field: TMessageFieldRuleOrValue;
    function: PayloadConditionFunction;
    functionArguments?: Array<any>;
    /**
     * target device to take last message from,
     * when empty IInputRuleBase["deviceId"] is used
     */
    otherDeviceId?: DEVICE;
}

export type TPayloadConditions = Array<IPayloadCondition>;

export type TPayloadDataFn = (params: {
    srcDeviceId: DEVICE;
    messages: Array<IZigbeeDeviceMessage>;
    prevMessage?: IZigbeeDeviceMessage;
    action: IOutputAction;
}) => TMessageFieldRuleOrValue;

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
    payloadData?: TMessageFieldRuleOrValue | TPayloadDataFn;
    /**
     * allows to map one exact input value to another, applicable only when payloadData=$message.*
     */
    translation?: Record<string, string>;
    /**
     * command will be executed with delay
     * (!) note that dispaching any other command on same target, with abort all delayed commands
     * use case - switch lights off after some some delay
     */
    // delay?: number;
    /**
     * all messages receved within throttle period will be accumulated and passed to the actions in a whole
     */
    // throttle?: number;
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
    mappings: IMappings;
    supportedOutputActions: Record<OutputAction, TOutputActionImpl>;
    // supportedAdapters: Record<OutputLayerAdapter, TAdapterImpl>;
}

export type TMatcherFunc = (
    deviceId: DEVICE,
    message: IZigbeeDeviceMessage,
    payloadConditions: TPayloadConditions,
    supportedConditionFunctions: Record<PayloadConditionFunction, TPayloadConditionFunctionImpl>,
    conditionOperator?: IInputRuleZigbeeMessage["conditionOperator"],
    prevMessage?: IZigbeeDeviceMessage,
) => boolean;

export type TOutputActionImpl = (
    deviceId: DEVICE | undefined,
    data: TMessageFieldRuleOrValue,
    // supportedAdapters: Record<OutputLayerAdapter, TAdapterImpl>,
) => Promise<void>;

export type TPayloadConditionFunctionImpl = (params: {
    value: TMessageFieldRuleOrValue;
    args?: Array<TMessageFieldRuleOrValue>;
    prevValue?: TMessageFieldRuleOrValue;
}) => boolean;
