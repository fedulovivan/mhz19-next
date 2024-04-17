import { TPayloadConditionFunctionImpl } from 'src/automation-engine/types';

import { withCategory } from '../logger';

const log = withCategory('mhz19-automation-engine');

export const Equal: TPayloadConditionFunctionImpl = (value, args) => {
    return value === args?.[0];
};

export const InList: TPayloadConditionFunctionImpl = (value, args) => {
    return (args ? args.includes(value) : false);
};
