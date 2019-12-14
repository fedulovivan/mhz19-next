interface IMhzDoc {
    co2: number;
    temp: number;
    timestamp: number;
}

interface IZigbeeDeviceDoc {
    topic: string;
    timestamp: number;
    battery: number;
    voltage: number;
    linkquality: number;
    water_leak: boolean;
    last_seen: string;
}
