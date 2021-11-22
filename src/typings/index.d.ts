/* eslint-disable camelcase */
// eslint-disable-next-line no-unused-vars
// import { SerializedStyles } from '@emotion/core';

import * as TYPE from 'src/actionTypes';

declare global {

    type IMqttMessageDispatcherHandler<T = any> = (params: {
        fullTopic: string;
        json: T | null;
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
        battery?: number;
        last_seen?: string;
    }

    interface IAqaraWaterSensorMessage {
        battery: number;
        battery_low: boolean;
        linkquality: number;
        tamper: boolean;
        voltage: number;
        water_leak: boolean;
    }

    interface IAqaraTemperatureSensorMessage {
        battery: number;
        humidity: number;
        linkquality: number;
        pressure: number;
        temperature: number;
        voltage: number;
    }

    interface IWallSwitchMessage {
        action: 'single_left' | 'single_right' | 'double_left' | 'double_right' | 'hold_left' | 'hold_right';
        battery: number;
        click: 'left' | 'right';
        linkquality: number;
        voltage: number;
    }

    interface IIkeaOnoffSwitchMessage {
        action: 'on' | 'brightness_move_up' | 'brightness_stop' | 'brightness_move_down';
        click: 'on' | 'off' | 'brightness_up' | 'brightness_stop' | 'brightness_down';
        battery: number;
        action_rate: number;
        linkquality: number;
        update_available: boolean;
    }

    type IZigbeeDeviceMessage = (
        | IAqaraPowerPlugMessage
        | IAqaraWaterSensorMessage
        | IWallSwitchMessage
        | IAqaraTemperatureSensorMessage
        | Array<IZigbee2mqttBridgeConfigDevice>
        | IIkeaOnoffSwitchMessage
    );

    type TDeviceIdAndTimestamp = { deviceId: string; timestamp: number };

    type IRootDeviceUnifiedMessage = (
        (IZigbeeDeviceMessage | IValveStateMessage)
        & TDeviceIdAndTimestamp
    );

    type IDeviceCustomAttributes = { name?: string; isHidden?: 'true' | 'false' };
    type IDeviceCustomAttributesIndexed = Record<string, IDeviceCustomAttributes>;

    interface IYeelightDevice {
        id: string;
        Location: string;
        location: string;
        model: string;
        support: string;
        host: string;
        port: number;
        power: string;
        bright: string;
        color_mode: string;
        ct: string;
        rgb: string;
        hue: string;
        sat: string;
    }

    interface IYeelightDeviceMessage {
        device_id: string;
        timestamp: number;
        id: number;
        method?: string;
        params?: Record<string, any>;
        result?: Array<string>;
    }

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
        networkAddress: number;
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
    // eslint-disable-next-line no-shadow
    enum PowerPlugState {
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

    type IValveStateMessage = { data?: string } & TDeviceIdAndTimestamp;

    // /* component props */
    // interface ILeakageSensorCardProps {
    //     deviceMessage?: IAqaraWaterSensorMessage;
    //     lastSeen?: number;
    //     css?: SerializedStyles;
    // }
    // interface IMhzChartCardProps {
    //     seriesData: Array<{ x: number; y: number }>;
    //     css: SerializedStyles;
    //     loading: boolean;
    // }
    // interface INumericCardProps {
    //     value?: string | number;
    //     unit?: string;
    //     desc?: string;
    //     rootCss?: SerializedStyles;
    // }

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
    export type ActionType = (
        | SetWsConnectDataAction
        | AddMhzDocAction
        | SetHistoryOptionAction
        | SaveZigbeeDeviceMessage
        | GetMhzDocsPending
        | GetMhzDocsSucceed
        | GetMhzDocsFailed
    );
    export type TDeviceCustomAttribute = 'name' | 'isHidden';
    export interface IDeviceCustomAttribute {
        deviceId: string;
        attributeType: TDeviceCustomAttribute;
        value: string;
    }
    export type TOnOff = 'on' | 'off';
    export interface ISonoffDeviceAttributes {
        switch: TOnOff;
        startup: TOnOff;
        pulse: TOnOff;
        sledOnline: TOnOff;
        fwVersion: string;
        pulseWidth: number;
        rssi: number;
    }
    export interface ISonoffDevice {
        timestamp: number;
        id: string;
        ip: string;
        port: number;
        attributes: ISonoffDeviceAttributes;
        rawData1?: string;
    }
    export type ISonoffDeviceUnwrapped =
        & ISonoffDeviceAttributes
        & Pick<ISonoffDevice, 'ip' | 'port'>
        & { device_id: string; timestamp: number };
    export type TSonoffDevicesMap = Map<string, ISonoffDevice>;
}
