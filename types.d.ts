interface IMhzDoc {
    timestamp: number;
    co2?: number;
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

interface IAqaraWaterSensorMessage extends IZigbeeDeviceMessageBase {
    battery: number;
    water_leak: boolean;
}

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
    deviceStates: { [friendly_name: string]: IAqaraWaterSensorMessage & IAqaraPowerPlugMessage };
    zigbeeDevivesMessages: Array<IAqaraWaterSensorMessage & IAqaraPowerPlugMessage>;
    zigbeeDevices: Array<IZigbeeDeviceRegistrationInfo>;
    historyOption: number;
    error?: string;
    isPendingGetMhzDocs: boolean;
}
