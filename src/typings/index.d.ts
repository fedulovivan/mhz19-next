// eslint-disable-next-line no-unused-vars
import { SerializedStyles } from '@emotion/core';

import * as TYPE from 'src/react/actionTypes';

type IMqttMessageDispatcherHandler = (params: {
    fullTopic: string;
    json: IZigbeeDeviceMessage | null;
    timestamp: number;
    rawMessage: string;
    deviceId: string | undefined;
    deviceName: string | undefined;
}) => void;

/**
 * after connection to mqtt server we ask zigbee2mqtt for the list of connected devices
 * this array element of response to zigbee2mqtt/bridge/config/devices/get request
 * received at zigbee2mqtt/bridge/config/devices topic
 * see src/mqttClient.ts
 */
interface IZigbee2mqttBridgeConfigDevice {
    dateCode: string;
    friendly_name: string;
    ieeeAddr: string;
    lastSeen: any;
    networkAddress: number;
    softwareBuildID: string;
    type: string;
    description: string;
    hardwareVersion?: number;
    manufacturerID?: number;
    manufacturerName: string;
    model: string;
    modelID: string;
    powerSource: string;
    vendor: string;
}

interface IAqaraWaterSensorMessage {
    battery: number;
    battery_low: boolean;
    linkquality: number;
    tamper: boolean;
    voltage: number;
    water_leak: boolean;
}

interface IWallSwitchMessage {
    action: 'single_left' | 'single_right' | 'double_left' | 'double_right';
    battery: number;
    click: 'left' | 'right';
    linkquality: number;
    voltage: number;
}

type IZigbeeDeviceMessage = IAqaraPowerPlugMessage & IAqaraWaterSensorMessage & IWallSwitchMessage;

interface IMhzDoc {
    timestamp: number;
    co2: number;
    temp?: number;
}
interface IHassDoc {
    timestamp: number;
    topic: string;
}
interface IZigbeeDeviceRegistrationInfo {
    ieeeAddr: string;
    type: string;
    networkAddress: number,
    friendly_name: string;
    softwareBuildID: string;
    dateCode: string;
    lastSeen: number;
    model: string;
}
interface IZigbeeDeviceMessageBase {
    topic: string;
    timestamp: number;
    voltage: number;
    linkquality: number;
    last_seen: string;
}
// interface IAqaraWaterSensorMessage extends IZigbeeDeviceMessageBase {
//     battery: number;
//     water_leak: boolean;
// }
declare enum PowerPlugState {
    ON = 'ON',
    OFF = 'OFF',
}
interface IAqaraPowerPlugMessage extends IZigbeeDeviceMessageBase {
    state: PowerPlugState;
    power: number;
    consumption: number;
    temperature: number;
}
interface IInitialState {
    mhzDocs: Array<IMhzDoc>;
    zigbeeDevivesMessages: Array<IAqaraWaterSensorMessage & IAqaraPowerPlugMessage>;
    zigbeeDevices: Array<IZigbeeDeviceRegistrationInfo>;
    historyOption: number;
    error?: string;
    isPendingGetMhzDocs: boolean;
}

/* component props */
interface ILeakageSensorCardProps {
    deviceMessage?: IAqaraWaterSensorMessage;
    lastSeen?: number;
    css?: SerializedStyles;
}
interface IMhzChartCardProps {
    seriesData: Array<{ x: number; y: number }>;
    css: SerializedStyles;
    loading: boolean;
}
interface INumericCardProps {
    value?: string | number;
    unit?: string;
    desc?: string;
    rootCss?: SerializedStyles;
}

/* actions payloads */
export interface SetWsConnectDataAction {
    type: typeof TYPE.SET_BOOTSTRAP_DATA;
    payload: {
        mhzDocs: Array<IMhzDoc>;
        zigbeeDevivesMessages: Array<IAqaraWaterSensorMessage & IAqaraPowerPlugMessage>;
        zigbeeDevices: Array<IZigbeeDeviceRegistrationInfo>;
        error: string;
    };
}
export interface AddMhzDocAction {
    type: typeof TYPE.ADD_MHZ_DOC;
    payload: IMhzDoc;
}
export interface SetHistoryOptionAction {
    type: typeof TYPE.SET_HISTORY_OPTION;
    payload: {
        historyOption: number;
    };
}
export interface SaveZigbeeDeviceMessage {
    type: typeof TYPE.SAVE_ZIGBEE_DEVICE_MESSAGE;
    payload: IAqaraWaterSensorMessage & IAqaraPowerPlugMessage;
}
export interface GetMhzDocsPending {
    type: typeof TYPE.GET_MHZ_DOCS_PENDING;
}
export interface GetMhzDocsSucceed {
    type: typeof TYPE.GET_MHZ_DOCS_SUCCEED;
    payload: {
        mhzDocs: Array<IMhzDoc>;
    };
}
export interface GetMhzDocsFailed {
    type: typeof TYPE.GET_MHZ_DOCS_FAILED;
    payload?: {};
}
export type ActionType =
      SetWsConnectDataAction
    | AddMhzDocAction
    | SetHistoryOptionAction
    | SaveZigbeeDeviceMessage
    | GetMhzDocsPending
    | GetMhzDocsSucceed
    | GetMhzDocsFailed;
