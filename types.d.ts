interface IMhzDoc {
    timestamp: number;
    co2?: number;
    temp?: number;
}

interface IZigbeeDeviceDoc {
    topic: string;
    timestamp: number;
    battery?: number;
    voltage?: number;
    linkquality?: number;
    water_leak?: boolean;
    last_seen?: string;
    message?: string;
}

interface IHassDoc {
    timestamp: number;
    topic: string;
}

interface IZigbeeDeviceInfo {
    ieeeAddr: string;
    type: string;
    networkAddress: number,
    friendly_name: string;
    softwareBuildID: string;
    dateCode: string;
    lastSeen: number;
}

interface IAqaraWaterSensorMessage {
    topic: string,
    timestamp: number,
    battery: number,
    voltage: number,
    linkquality: number,
    last_seen: string,
    water_leak: boolean;
}