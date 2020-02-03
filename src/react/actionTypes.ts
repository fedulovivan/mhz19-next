export const SET_BOOTSTRAP_DATA = 'SET_BOOTSTRAP_DATA';
export const ADD_MHZ_DOC = 'ADD_MHZ_DOC';
export const SET_HISTORY_OPTION = 'SET_HISTORY_OPTION';
export const SAVE_RECENT_DEVICE_STATE = 'SAVE_RECENT_DEVICE_STATE';
export const GET_MHZ_DOCS_PENDING = 'GET_MHZ_DOCS_PENDING';
export const GET_MHZ_DOCS_SUCCEED = 'GET_MHZ_DOCS_SUCCEED';
export const GET_MHZ_DOCS_FAILED = 'GET_MHZ_DOCS_FAILED';

export interface SetWsConnectDataAction {
    type: typeof SET_BOOTSTRAP_DATA;
    payload: {
        mhzDocs: Array<IMhzDoc>;
        zigbeeDevivesMessages: Array<IAqaraWaterSensorMessage>;
        error: string;
    };
}

export interface AddMhzDocAction {
    type: typeof ADD_MHZ_DOC;
    payload: IMhzDoc;
}

export interface SetHistoryOptionAction {
    type: typeof SET_HISTORY_OPTION;
    payload: {
        historyOption: number;
    };
}

export interface SaveDeviceStateAction {
    type: typeof SAVE_RECENT_DEVICE_STATE;
    payload: IAqaraWaterSensorMessage & IAqaraPowerPlugMessage;
}

export interface GetMhzDocsPending {
    type: typeof GET_MHZ_DOCS_PENDING;
}

export interface GetMhzDocsSucceed {
    type: typeof GET_MHZ_DOCS_SUCCEED;
    payload: {
        mhzDocs: Array<IMhzDoc>;
    };
}

export interface GetMhzDocsFailed {
    type: typeof GET_MHZ_DOCS_FAILED;
    payload?: {};
}

export type ActionType =
      SetWsConnectDataAction
    | AddMhzDocAction
    | SetHistoryOptionAction
    | SaveDeviceStateAction
    | GetMhzDocsPending
    | GetMhzDocsSucceed
    | GetMhzDocsFailed;
