/* eslint-disable no-duplicate-imports */

import {
    isFunction,
    isNil,
    lowerFirst,
} from 'lodash';

import { DEVICE, DEVICE_NAME } from 'src/constants';
import * as lastDeviceState from 'src/lastDeviceState';
import log, { withDebug } from 'src/logger';

import mapping from './mapping';
import * as supportedConditionFunctions from './supportedConditionFunctions';
import * as supportedOutputActions from './supportedOutputActions';
import {
    IActionsExecutorCtrOpts,
    IMappings,
    IOutputAction,
    IPayloadCondition,
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
): string | undefined | MessageFields => {
    const messagePrefix = "$message.";
    if (typeof valueToPick === "string" && valueToPick.startsWith(messagePrefix)) {
        const field = valueToPick.split(messagePrefix)[1];
        return message[field as keyof IZigbeeDeviceMessage];
    }
    return valueToPick;
};

const translator = (
    value: MessageFields | undefined,
    translation: IOutputAction["translation"]
) => {
    const useTranslation = translation && !isNil(value);
    const result = useTranslation ? (translation[value as string] ?? value) : value;
    if (useTranslation) {
        debug(`translator: value in=${value} mapped to out=${result} using mapping=${JSON.stringify(translation)}`);
    }
    return result;
};

const pickArguments = (
    message: IZigbeeDeviceMessage,
    argumentsToPick: Array<MessageFields>,
): Array<MessageFields | undefined> => {
    return argumentsToPick.map(arg => pickValue(message, arg));
};

const matcher: TMatcherFunc = (
    srcDeviceId,
    message,
    payloadConditions,
    supportedFunctions,
    conditionOperator,
    // otherDeviceMessages,
) => {
    const fn = (condition: IPayloadCondition) => {
        const { otherDeviceId } = condition;
        const prevMessage = lastDeviceState.getOne(srcDeviceId);
        const usedMessage = !isNil(otherDeviceId) ? lastDeviceState.getOne(otherDeviceId) : message;
        const conditionFuncImpl = supportedFunctions[condition.function];
        return conditionFuncImpl(
            pickValue(usedMessage, condition.field),
            condition.arguments ? pickArguments(usedMessage, condition.arguments) : undefined,
            prevMessage ? pickValue(prevMessage, condition.field) : undefined,
        );
    };
    if (isNil(conditionOperator) || conditionOperator === 'AND') {
        return payloadConditions.every(fn);
    } else if (conditionOperator === 'OR') {
        return payloadConditions.some(fn);
    } else {
        throw new Error(`Unexpected conditions`);
    }
     
};

class ActionsExecutor {
    private stats = {
        totalMessagesReceived: 0,
        matchedRules: 0,
        // executedActions: 0,
    };
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
    public getStats() {
        return this.stats;
    }
    public async handleZigbeeMessage(srcDeviceId: DEVICE, message: IZigbeeDeviceMessage) {
        debug(`Matching new message from srcDeviceId=${srcDeviceId} (${DEVICE_NAME[srcDeviceId]}) against ${this.mapping.length} mapping records`);
        this.stats.totalMessagesReceived += 1;
        let matchFound = false;
        this.mapping.forEach(({ onZigbeeMessage, actions }, index) => {
            if (!onZigbeeMessage) return;
            if (!onZigbeeMessage.srcDevices.includes(srcDeviceId)) return;
            const { payloadConditions, conditionOperator } = onZigbeeMessage;
            const matches = payloadConditions ? matcher(
                srcDeviceId,
                message,
                payloadConditions,
                supportedConditionFunctions,
                conditionOperator,
                // otherDeviceMessages,
            ) : true;
            if (!matches) return;
            this.stats.matchedRules += 1;
            // this.stats.executedActions += actions.length;
            debug(`Picked mapping with index ${index}, going to execute ${actions.length} actions`);
            this.executeActions(
                message,
                actions,
                srcDeviceId,
            );
            matchFound = true;
        });
        if (!matchFound) debug(`No matching records found`);
    }
    private executeActions(
        message: IZigbeeDeviceMessage,
        actions: Array<IOutputAction>,
        srcDeviceId: DEVICE,
    ) {
        actions.forEach(({
            type, deviceId: dstDeviceId, payloadData, translation, delay
        }) => {

            if (!this.delayedActions[dstDeviceId]) {
                debug(`Creating delayedActions record for the first time for dstDeviceId=${dstDeviceId} (${DEVICE_NAME[dstDeviceId]})`);
                this.delayedActions[dstDeviceId] = [];
            } else if (this.delayedActions[dstDeviceId].length > 0) {
                debug(`Going to abort ${this.delayedActions[dstDeviceId].length} delayed actions for dstDeviceId=${dstDeviceId} (${DEVICE_NAME[dstDeviceId]})`);
                this.delayedActions[dstDeviceId].forEach(timerId => {
                    clearTimeout(timerId);
                });
                this.delayedActions[dstDeviceId] = [];
                debug(`timers and delayed actions queue was cleared for dstDeviceId=${dstDeviceId} (${DEVICE_NAME[dstDeviceId]})`);
            }

            const outputActionImpl = this.supportedOutputActions[type];
            const { supportedAdapters } = this;
            const data = (
                isFunction(payloadData)
                    ? payloadData(message, srcDeviceId, dstDeviceId)
                    : (payloadData ? translator(pickValue(message, payloadData), translation) : undefined)
            );
            const timerId = setTimeout(
                function() {
                    outputActionImpl(
                        dstDeviceId,
                        data,
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
