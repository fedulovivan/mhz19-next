
import {
    MINUTE,
    APP_HOST,
    APP_PORT,
    HISTORY_OPTIONS
} from './constants';

import {
    SET_WS_CONNECT_DATA,
    ADD_MHZ_DOC,
    SET_HISTORY_OPTION,
    SAVE_DEVICE_STATE,
} from './actionTypes';

export const intialState: IInitialState = {
    mhzDocs: [],
    zigbeeDevices: [],
    waterSensorRecentMessages: [],
    historyOption: MINUTE * 30,
    deviceStates: {},
    error: undefined,
};

export default function reducer(state: IInitialState, action: ActionType) {
    const { type, payload } = action;
    switch (type) {
        case SET_WS_CONNECT_DATA:
            return {
                ...state,
                ...payload.bootstrap,
            }
        case ADD_MHZ_DOC:
            return {
                ...state,
                mhzDocs: [...state.mhzDocs.slice(1), payload],
            }
        case SET_HISTORY_OPTION:
            return {
                ...state,
                historyOption: payload.historyOption,
            }
        case SAVE_DEVICE_STATE:
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
