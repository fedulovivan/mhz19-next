export const SET_WS_CONNECT_DATA = 'SET_WS_CONNECT_DATA';
export const ADD_MHZ_DOC = 'ADD_MHZ_DOC';
export const SET_HISTORY_OPTION = 'SET_HISTORY_OPTION';
export const SAVE_DEVICE_STATE = 'SAVE_DEVICE_STATE';

interface SetWsConnectDataAction {
    type: typeof SET_WS_CONNECT_DATA;
    payload: {
        bootstrap: {
            mhzDocs: Array<IMhzDoc>;
            deviceStates: { [friendly_name: string]: IAqaraWaterSensorMessage };
            waterSensorRecentMessages: Array<IAqaraWaterSensorMessage>;
        }
    };
}

interface AddMhzDocAction {
    type: typeof ADD_MHZ_DOC;
    payload: IMhzDoc;
}

interface SetHistoryOptionAction {
    type: typeof SET_HISTORY_OPTION;
    payload: {
        historyOption: number;
    };
}

interface SaveDeviceStateAction {
    type: typeof SAVE_DEVICE_STATE;
    payload: IZigbeeDeviceInfo;
}

export type ActionType = SetWsConnectDataAction | AddMhzDocAction | SetHistoryOptionAction | SaveDeviceStateAction;
