import { withDebug } from 'src/logger';

import { TPayloadConditionFunctionImpl } from './types.d';

const debug = withDebug('mhz19-automation-engine');

export const Equal: TPayloadConditionFunctionImpl = (value, args) => {
    return value === args?.[0];
};

export const InList: TPayloadConditionFunctionImpl = (value, args) => {
    return (args ? args.includes(value) : false);
};
