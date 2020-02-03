/* eslint-disable no-case-declarations */
/* eslint-disable default-case */
/* eslint-disable no-param-reassign */

import { produce } from 'immer';

import {
    MINUTE,
} from 'src/constants';

import {

    ActionType,
    SetWsConnectDataAction,
    AddMhzDocAction,
    SetHistoryOptionAction,
    SaveZigbeeDeviceMessage,
    GetMhzDocsSucceed,

    SET_BOOTSTRAP_DATA,
    ADD_MHZ_DOC,
    SET_HISTORY_OPTION,
    SAVE_ZIGBEE_DEVICE_MESSAGE,
    GET_MHZ_DOCS_PENDING,
    GET_MHZ_DOCS_FAILED,
    GET_MHZ_DOCS_SUCCEED,

} from 'src/react/actionTypes';

export const intialState: IInitialState = {
    mhzDocs: [],
    zigbeeDevices: [],
    zigbeeDevivesMessages: [],
    historyOption: MINUTE * 30,
    error: undefined,
    isPendingGetMhzDocs: false,
};

export default produce((draft: IInitialState, action: ActionType) => {
    const { type } = action;
    switch (type) {
        case SET_BOOTSTRAP_DATA:
            const {
                zigbeeDevices,
                zigbeeDevivesMessages,
                mhzDocs,
                error,
            } = (action as SetWsConnectDataAction).payload;
            draft.zigbeeDevices = zigbeeDevices;
            draft.zigbeeDevivesMessages = zigbeeDevivesMessages;
            draft.mhzDocs = mhzDocs;
            draft.error = error;
            break;
        case ADD_MHZ_DOC:
            draft.mhzDocs.splice(1).push((action as AddMhzDocAction).payload);
            break;
        case SET_HISTORY_OPTION:
            draft.historyOption = (action as SetHistoryOptionAction).payload.historyOption;
            break;
        case SAVE_ZIGBEE_DEVICE_MESSAGE:
            draft.zigbeeDevivesMessages.push((action as SaveZigbeeDeviceMessage).payload);
            break;
        case GET_MHZ_DOCS_PENDING:
            draft.isPendingGetMhzDocs = true;
            break;
        case GET_MHZ_DOCS_FAILED:
            draft.isPendingGetMhzDocs = false;
            break;
        case GET_MHZ_DOCS_SUCCEED:
            draft.isPendingGetMhzDocs = false;
            draft.mhzDocs = (action as GetMhzDocsSucceed).payload.mhzDocs;
            break;
    }
});

// export default function reducer(state: IInitialState, action: ActionType) {
//     const { type, payload } = action;
//     switch (type) {
//     case SET_BOOTSTRAP_DATA:
//         return {
//             ...state,
//             ...payload,
//         };
//     case ADD_MHZ_DOC:
//         return {
//             ...state,
//             mhzDocs: [...state.mhzDocs.slice(1), payload],
//         };
//     case SET_HISTORY_OPTION:
//         return {
//             ...state,
//             historyOption: payload.historyOption,
//         };
//     case SAVE_ZIGBEE_DEVICE_MESSAGE:
//         return {
//             ...state,
//             zigbeeDevivesMessages: [
//                 ...state.zigbeeDevivesMessages,
//                 payload,
//             ]
//         };
//     case GET_MHZ_DOCS_PENDING: {
//         return {
//             ...state,
//             isPendingGetMhzDocs: true,
//         };
//     }
//     case GET_MHZ_DOCS_SUCCEED:
//         return {
//             ...state,
//             isPendingGetMhzDocs: false,
//             mhzDocs: payload.mhzDocs,
//         };
//     case GET_MHZ_DOCS_FAILED:
//         return {
//             ...state,
//             isPendingGetMhzDocs: false,
//         };
//     default:
//         return state;
//     }
// }
