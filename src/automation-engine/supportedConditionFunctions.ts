import logger, { withDebug } from 'src/logger';
import { notNil } from 'src/utils';

import type { TPayloadConditionFunctionImpl } from './index.d';

const debug = withDebug('automation-engine');

export const Equal: TPayloadConditionFunctionImpl = ({ value, args, prevValue }) => {
    return value === args?.[0];
};

export const NotEqual: TPayloadConditionFunctionImpl = ({ value, args, prevValue }) => {
    return value !== args?.[0];
};

export const InList: TPayloadConditionFunctionImpl = ({ value, args, prevValue }) => {
    return (args ? args.includes(value) : false);
};

export const Changed: TPayloadConditionFunctionImpl = ({ value, args, prevValue }) => {
    return value !== prevValue;
}

export const NotNil: TPayloadConditionFunctionImpl = ({ value, args, prevValue }) => {
    return notNil(value);
}
