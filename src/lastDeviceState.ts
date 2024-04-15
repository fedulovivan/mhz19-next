import { DEVICE, DEVICE_NAME } from 'src/constants';

type IData = Map<DEVICE, IRecord>;

interface IRecord { 
    name: string,
    deviceId: DEVICE, 
    timestamp: Date, 
    message: IZigbeeDeviceMessage, 
};

const data: IData = new Map();

export function toJSON() {
    return [...data.values()].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getOne(deviceId: DEVICE): IZigbeeDeviceMessage | undefined {
    return data.get(deviceId)?.message;
}

export function set(deviceId: DEVICE, message: IZigbeeDeviceMessage | null) {
    if (message) data.set(deviceId, { 
        deviceId, 
        get name() { 
            return DEVICE_NAME[(this as IRecord).deviceId];
        },
        timestamp: new Date(), 
        message, 
    });
}