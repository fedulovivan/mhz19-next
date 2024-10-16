import { isFunction, last } from 'lodash-es';

import { DEVICE, DEVICE_NAME } from 'src/constants';
import * as lastDeviceState from 'src/lastDeviceState';
import logger, { withDebug } from 'src/logger';
import type { IZigbeeDeviceMessage } from 'src/typings';
import {
    isNil,
    notNil,
    Queue,
} from 'src/utils';

import { OutputAction, OutputLayerAdapter } from './enums';
import type {
    IActionsExecutorCtrOpts,
    IMappings,
    IOutputAction,
    IPayloadCondition,
    TAdapterImpl,
    TMatcherFunc,
    TMessageFieldRuleOrValue,
    TOutputActionImpl,
    TPayloadDataFn,
} from './index.d';
import * as supportedConditionFunctions from './supportedConditionFunctions';

const debug = withDebug('automation-engine');

const queues: Map<DEVICE, Queue<IZigbeeDeviceMessage>> = new Map();

const pickValue = (
    message: IZigbeeDeviceMessage | undefined,
    fieldRuleOrConstValue: TMessageFieldRuleOrValue,
): TMessageFieldRuleOrValue => {
    const messagePrefix = "$message.";
    if (notNil(message) && typeof fieldRuleOrConstValue === "string" && fieldRuleOrConstValue.startsWith(messagePrefix)) {
        const field = fieldRuleOrConstValue.split(messagePrefix)[1];
        return message[field as keyof IZigbeeDeviceMessage];
    }
    return fieldRuleOrConstValue;
};

const translator = (
    value: TMessageFieldRuleOrValue,
    translation: IOutputAction["translation"]
) => {
    const useTranslation = translation && !isNil(value);
    const result = useTranslation ? (translation[value as string] ?? value) : value;
    if (useTranslation) {
        debug(`translator: value in=${value} mapped to out=${result} using mapping=${JSON.stringify(translation)}`);
    }
    return result;
};

const matcher: TMatcherFunc = (
    // srcDeviceId,
    message,
    payloadConditions,
    supportedFunctions,
    conditionOperator,
    prevMessage,
) => {
    const fn = (condition: IPayloadCondition) => {
        const { otherDeviceId } = condition;
        const usedMessage = notNil(otherDeviceId) ? lastDeviceState.getOne(otherDeviceId) : message;
        const conditionFuncImpl = supportedFunctions[condition.function];
        return conditionFuncImpl({
            value: pickValue(usedMessage, condition.field),
            args: condition.functionArguments,
            prevValue: prevMessage ? pickValue(prevMessage, condition.field) : undefined,
        });
    };
    if (isNil(conditionOperator) || conditionOperator === 'AND') {
        return payloadConditions.every(fn);
    } else if (conditionOperator === 'OR') {
        return payloadConditions.some(fn);
    } else {
        throw new Error(`Unexpected conditions`);
    }
};

const payloadDataDefault: TPayloadDataFn = ({ srcDeviceId, messages, action }) => {
    const { payloadData, translation } = action;
    if (isFunction(payloadData)) throw new Error(`Unxpected conditions`);
    if (isNil(payloadData)) return;
    return translator(
        pickValue(last(messages), payloadData),
        translation,
    );
};

export default class ActionsExecutor {
    private stats = {
        totalMessagesReceived: 0,
        matchedRules: 0,
    };
    private mappings: IMappings;
    private supportedOutputActions: Record<OutputAction, TOutputActionImpl>;
    // private supportedAdapters: Record<OutputLayerAdapter, TAdapterImpl>;
    // private delayedActions: Record<string, Array<NodeJS.Timer>> = {};
    constructor(opts: IActionsExecutorCtrOpts) {
        this.supportedOutputActions = opts.supportedOutputActions;
        this.mappings = opts.mappings;
        // this.supportedAdapters = opts.supportedAdapters;
        debug(`ActionsExecutor instance was created`);
    }
    public getStats() {
        return this.stats;
    }
    public async handleZigbeeMessage(srcDeviceId: DEVICE, message: IZigbeeDeviceMessage) {
        debug(`Matching new message from srcDeviceId=${srcDeviceId} (${DEVICE_NAME[srcDeviceId]}) against ${this.mappings.length} mapping records`);
        this.stats.totalMessagesReceived += 1;
        let matchFound = false;
        this.mappings.forEach(({ onZigbeeMessage, actions }, index) => {
            if (!onZigbeeMessage) return;
            if (!onZigbeeMessage.srcDevices.includes(srcDeviceId)) return;
            const {
                payloadConditions,
                conditionOperator,
                throttle,
            } = onZigbeeMessage;
            const matches = payloadConditions ? matcher(
                // srcDeviceId,
                message,
                payloadConditions,
                supportedConditionFunctions,
                conditionOperator,
                lastDeviceState.getOne(srcDeviceId),
            ) : true;
            if (!matches) return;
            this.stats.matchedRules += 1;
            debug(`Picked mapping with index ${index}, going to execute ${actions.length} actions`);
            if (notNil(throttle)) {
                debug(`Mapping for ${srcDeviceId} has throttle=${throttle}, message will be queued...`);
                if (!queues.has(srcDeviceId)) {
                    queues.set(
                        srcDeviceId,
                        new Queue<IZigbeeDeviceMessage>({
                            throttle,
                            srcDeviceId,
                            onFlushed: items => this.executeActions(
                                items,
                                actions,
                                srcDeviceId,
                                lastDeviceState.getOne(srcDeviceId),
                            ),
                        }),
                    );
                }
                const queue = queues.get(srcDeviceId)!;
                queue.push(message);
            } else {
                this.executeActions(
                    [message],
                    actions,
                    srcDeviceId,
                    lastDeviceState.getOne(srcDeviceId),
                );
            }
            matchFound = true;
        });
        if (!matchFound) debug(`No matching records found`);
    }
    private executeActions(
        messages: Array<IZigbeeDeviceMessage>,
        actions: Array<IOutputAction>,
        srcDeviceId: DEVICE,
        prevMessage?: IZigbeeDeviceMessage,
    ) {
        actions.forEach(async action => {

            const {
                type,
                deviceId: dstDeviceId,
            } = action;

            // if (notNil(dstDeviceId)) {
            //     if (!this.delayedActions[dstDeviceId]) {
            //         debug(`Creating delayedActions record for the first time for dstDeviceId=${dstDeviceId} (${DEVICE_NAME[dstDeviceId]})`);
            //         this.delayedActions[dstDeviceId] = [];
            //     } else if (this.delayedActions[dstDeviceId].length > 0) {
            //         debug(`Going to abort ${this.delayedActions[dstDeviceId].length} delayed actions for dstDeviceId=${dstDeviceId} (${DEVICE_NAME[dstDeviceId]})`);
            //         this.delayedActions[dstDeviceId].forEach(timerId => {
            //             clearTimeout(timerId);
            //         });
            //         this.delayedActions[dstDeviceId] = [];
            //         debug(`timers and delayed actions queue was cleared for dstDeviceId=${dstDeviceId} (${DEVICE_NAME[dstDeviceId]})`);
            //     }
            // }

            const payloadDataImpl: TPayloadDataFn = (
                isFunction(action.payloadData)
                    ? action.payloadData
                    : payloadDataDefault
            );

            const data = payloadDataImpl({ srcDeviceId, messages, prevMessage, action });

            const outputActionImpl = this.supportedOutputActions[type];
            // const { supportedAdapters } = this;

            try {
                await outputActionImpl(
                    dstDeviceId,
                    data,
                    // supportedAdapters,
                );
            } catch (e) {
                logger.error(e);
            }

            // const timerId = setTimeout(
            //     function() {
            //         outputActionImpl(
            //             dstDeviceId,
            //             data,
            //             supportedAdapters,
            //         );
            //     },
            //     delay
            // );
            // if (delay && notNil(dstDeviceId)) {
            //     debug(`Delaying action execution for ${delay}ms`);
            //     this.delayedActions[dstDeviceId].push(timerId);
            // }

        });
    }
}
