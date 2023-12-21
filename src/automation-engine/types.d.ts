/* eslint-disable no-shadow */

export enum OutputAction {
    PostSonoffSwitchMessage = 'PostSonoffSwitchMessage',
    YeelightDeviceSetPower = 'YeelightDeviceSetPower',
    Zigbee2MqttSetState = 'Zigbee2MqttSetState',
}

export enum PayloadConditionFunction {
    Equal = 'Equal',
    InList = 'InList',
}

export enum OutputLayerAdapter {
    Mqtt = 'Mqtt',
    Sonoff = 'Sonoff',
    Yeelight = 'Yeelight',
}

export interface IInputRuleBase {
    deviceId: string;
}

export type MessageFields = "$message.action" | string;

export interface IPayloadCondition {
    field: MessageFields;
    function: PayloadConditionFunction;
    arguments?: Array<MessageFields>;
}

export type TPayloadConditions = Array<IPayloadCondition>;

export interface IInputRuleZigbeeMessage extends IInputRuleBase {
    payloadConditions?: TPayloadConditions;
}

export interface IOutputAction {
    /**
     * which output adapter to use
     */
    type: OutputAction;
    /**
     * target device
     */
    deviceId: string;
    /**
     * value to be sent to target:
     * string - hardcoded value to be sent
     * $message.* - value to sent will be taken from input message
     */
    payloadData?: MessageFields;
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
    message: IZigbeeDeviceMessage,
    payloadConditions: TPayloadConditions,
    supportedConditionFunctions: Record<PayloadConditionFunction, TPayloadConditionFunctionImpl>,
    // translation: IInputRuleBase["translation"],
) => boolean;

export type TOutputActionImpl = (
    deviceId: string,
    data: string | undefined,
    supportedAdapters: Record<OutputLayerAdapter, TAdapterImpl>,
) => void;

export type TPayloadConditionFunctionImpl = (
    value: string | undefined,
    arguments?: Array<string | undefined>,
) => boolean;
