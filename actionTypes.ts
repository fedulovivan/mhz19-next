export const SET_BOOTSTRAP_DATA = 'SET_BOOTSTRAP_DATA';
export const ADD_MHZ_DOC = 'ADD_MHZ_DOC';
export const SET_HISTORY_OPTION = 'SET_HISTORY_OPTION';
export const SAVE_RECENT_DEVICE_STATE = 'SAVE_RECENT_DEVICE_STATE';

interface SetWsConnectDataAction {
    type: typeof SET_BOOTSTRAP_DATA;
    payload: {
        bootstrap: {
            mhzDocs: Array<IMhzDoc>;
            deviceStates: { [friendly_name: string]: IAqaraWaterSensorMessage };
            zigbeeDevivesMessages: Array<IAqaraWaterSensorMessage>;
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
    type: typeof SAVE_RECENT_DEVICE_STATE;
    payload: IZigbeeDeviceRegistrationInfo;
}

export type ActionType = SetWsConnectDataAction | AddMhzDocAction | SetHistoryOptionAction | SaveDeviceStateAction;
