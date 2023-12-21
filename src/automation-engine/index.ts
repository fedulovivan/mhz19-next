/* eslint-disable no-duplicate-imports */

import { OpenInFull } from '@material-ui/icons';
import { bind, isNil } from 'lodash';

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
    private delayedActions: Record<string, Array<NodeJS.Timer>> = {};
    constructor(opts: IActionsExecutorCtrOpts) {
        this.supportedOutputActions = opts.supportedOutputActions;
        this.mapping = opts.mapping;
        this.supportedAdapters = opts.supportedAdapters;
        debug(`ActionsExecutor instance was created`);
    }
    public handleZigbeeMessage(srcDeviceId: string, message: IZigbeeDeviceMessage) {
        debug(`Matching new message from srcDeviceId=${srcDeviceId} against ${this.mapping.length} mapping records`);
        // if (!this.delayedActions[deviceId]) {
        //     debug(`Creating delayedActions for the first time for ${deviceId}`);
        //     this.delayedActions[deviceId] = [];
        // }
        let matchFound = false;
        this.mapping.forEach(({ onZigbeeMessage, actions }, index) => {
            if (!onZigbeeMessage) return;
            if (srcDeviceId !== onZigbeeMessage.deviceId) return;
            const { payloadConditions } = onZigbeeMessage;
            const matches = payloadConditions ? matcher(
                message,
                payloadConditions,
                supportedConditionFunctions,
            ) : true;
            if (!matches) return;
            debug(`Mapping with index ${index} matches, going to execute ${actions.length} actions`);
            this.executeActions(
                message,
                actions,
            );
            matchFound = true;
        });
        if (!matchFound) debug(`No matching records found`);
    }
    private executeActions(
        message: IZigbeeDeviceMessage,
        actions: Array<IOutputAction>,
    ) {
        actions.forEach(({
            type, deviceId: dstDeviceId, payloadData, translation, delay
        }) => {

            if (!this.delayedActions[dstDeviceId]) {
                debug(`Creating delayedActions record for the first time for dstDeviceId=${dstDeviceId}`);
                this.delayedActions[dstDeviceId] = [];
            } else if (this.delayedActions[dstDeviceId].length > 0) {
                debug(`Going to abort ${this.delayedActions[dstDeviceId].length} delayed actions for dstDeviceId=${dstDeviceId}`);
                this.delayedActions[dstDeviceId].forEach(timerId => {
                    clearTimeout(timerId);
                });
                this.delayedActions[dstDeviceId] = [];
                debug(`timers and delayed actions queue was cleared for dstDeviceId=${dstDeviceId}`);
            }

            const outputActionImpl = this.supportedOutputActions[type];
            const { supportedAdapters } = this;
            const timerId = setTimeout(
                function() {
                    outputActionImpl(
                        dstDeviceId,
                        payloadData ? translator(pickValue(message, payloadData), translation) : undefined,
                        supportedAdapters,
                    );
                }, 
                delay
            );
                
            if (delay) {    
                debug(`delaying action execution for ${delay}ms`);
                this.delayedActions[dstDeviceId].push(timerId);
            }

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
