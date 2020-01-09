
import {
    MINUTE,
    APP_HOST,
    APP_PORT,
    HISTORY_OPTIONS
} from './constants';

import {
    SET_BOOTSTRAP_DATA,
    ADD_MHZ_DOC,
    SET_HISTORY_OPTION,
    SAVE_RECENT_DEVICE_STATE,
} from './actionTypes';

export const intialState: IInitialState = {
    mhzDocs: [],
    zigbeeDevices: [],
    zigbeeDevivesMessages: [],
    historyOption: MINUTE * 30,
    deviceStates: {},
    error: undefined,
};

export default function reducer(state: IInitialState, action: ActionType) {
    const { type, payload } = action;
    switch (type) {
    case SET_BOOTSTRAP_DATA:
        return {
            ...state,
            ...payload,
        };
    case ADD_MHZ_DOC:
        return {
            ...state,
            mhzDocs: [...state.mhzDocs.slice(1), payload],
        };
    case SET_HISTORY_OPTION:
        return {
            ...state,
            historyOption: payload.historyOption,
        };
    case SAVE_RECENT_DEVICE_STATE:
        return {
            ...state,
            deviceStates: {
                ...state.deviceStates,
                [payload.friendly_name]: payload,
            }
        };
    default:
        return state;
    }
}
