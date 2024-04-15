import log, { withDebug } from 'src/logger';

import { TPayloadConditionFunctionImpl } from './types.d';

const debug = withDebug('mhz19-automation-engine');

export const Equal: TPayloadConditionFunctionImpl = (value, args) => {
    return value === args?.[0];
};

export const InList: TPayloadConditionFunctionImpl = (value, args) => {
    return (args ? args.includes(value) : false);
};

export const Changed: TPayloadConditionFunctionImpl = (value, args, prevValue) => {
    // debug('Changed: TPayloadConditionFunctionImpl');
    // debug(value, args, prevValue);
    return value !== prevValue;
}
