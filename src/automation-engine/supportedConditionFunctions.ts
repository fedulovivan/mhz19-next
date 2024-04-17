import log, { withDebug } from 'src/logger';

import type { TPayloadConditionFunctionImpl } from './index.d';

const debug = withDebug('automation-engine');

export const Equal: TPayloadConditionFunctionImpl = ({ value, args, prevValue }) => {
    return value === args?.[0];
};

export const InList: TPayloadConditionFunctionImpl = ({ value, args, prevValue }) => {
    return (args ? args.includes(value) : false);
};

export const Changed: TPayloadConditionFunctionImpl = ({ value, args, prevValue }) => {
    return value !== prevValue;
}
