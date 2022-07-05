/* eslint-disable no-duplicate-imports */

import log, { withDebug } from 'src/logger';

import mapping from './mapping';
import * as supportedConditionFunctions from './supportedConditionFunctions';
import * as supportedOutputActions from './supportedOutputActions';
import {
    IActionsExecutorCtrOpts,
    IInputRuleBase,
    IMappings,
    IOutputAction,
    MessageFields,
    OutputAction,
    OutputLayerAdapter,
    TAdapterImpl,
    TMatcherFunc,
    TOutputActionImpl,
} from './types.d';

const debug = withDebug('mhz19-automation-engine');

const pickValue = (
    message: IZigbeeDeviceMessage,
    valueToPick: MessageFields,
): string | undefined => {
    const messagePrefix = "$message.";
    if (valueToPick.startsWith(messagePrefix)) {
        const field = valueToPick.split(messagePrefix)[1];
        return message[field as keyof IZigbeeDeviceMessage];
    }
    return valueToPick;
};

const translator = (
    value: string | undefined,
    translation: IOutputAction["translation"]
) => {
    return translation && value ? (translation[value] ?? value) : value;
};

const pickArguments = (
    message: IZigbeeDeviceMessage,
    argumentsToPick: Array<MessageFields>,
    // translation: IInputRuleBase["translation"]
): Array<string | undefined> => {
    return argumentsToPick.map(arg => /* translator */(pickValue(message, arg)/* , translation */));
};

const matcher: TMatcherFunc = (
    message,
    payloadConditions,
    supportedFunctions,
    // translation,
) => {
    return payloadConditions.every((condition) => {
        const conditionFuncImpl = supportedFunctions[condition.function];
        return conditionFuncImpl(
            /* translator */(pickValue(message, condition.field)/* , translation */),
            condition.arguments ? pickArguments(message, condition.arguments/* , translation */) : undefined,
        );
    });
};

class ActionsExecutor {
    private mapping: IMappings;
    private supportedOutputActions: Record<OutputAction, TOutputActionImpl>;
    private supportedAdapters: Record<OutputLayerAdapter, TAdapterImpl>;
    constructor(opts: IActionsExecutorCtrOpts) {
        this.supportedOutputActions = opts.supportedOutputActions;
        this.mapping = opts.mapping;
        this.supportedAdapters = opts.supportedAdapters;
        debug(`ActionsExecutor instance was created`);
    }
    public handleZigbeeMessage(deviceId: string, message: IZigbeeDeviceMessage) {
        debug(`Matching new message from deviceId=${deviceId} against ${this.mapping.length} mapping records`);
        let matchFound = false;
        this.mapping.forEach(({ onZigbeeMessage, actions }, index) => {
            if (!onZigbeeMessage) return;
            if (deviceId !== onZigbeeMessage.deviceId) return;
            const { payloadConditions/* , translation */ } = onZigbeeMessage;
            const matches = payloadConditions ? matcher(
                message,
                payloadConditions,
                supportedConditionFunctions,
                // translation,
            ) : true;
            if (!matches) return;
            debug(`Match for record with index ${index} found, going to execute ${actions.length} actions`);
            this.executeActions(
                message,
                actions,
                // translation
            );
            matchFound = true;
        });
        if (!matchFound) debug(`No matching records found`);
    }
    private executeActions(
        message: IZigbeeDeviceMessage,
        actions: Array<IOutputAction>,
        // translation: IInputRuleBase["translation"],
    ) {
        actions.forEach(({
            type, deviceId, payloadData, translation
        }, index) => {
            const outputActionImpl = this.supportedOutputActions[type];
            debug(`action index ${index}`);
            outputActionImpl(
                deviceId,
                payloadData ? translator(pickValue(message, payloadData), translation) : undefined,
                this.supportedAdapters,
            );
        });
    }
}

export {
    ActionsExecutor,
    mapping,
    supportedConditionFunctions,
    supportedOutputActions
};

export * from './types.d';
