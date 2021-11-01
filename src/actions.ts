import axios from 'axios';
import { oneLineTrim } from 'common-tags';

export const toggleValves = (state: 'on' | 'off') => {
    axios.put(`/valve-state/${state}`);
};

export const sendYeelightDeviceCommand = async (
    deviceId: string,
    state: IYeelightDeviceState,
    commandId: number,
    callback: (data: Array<IYeelightDeviceMessage>) => void
) => {
    const result = await axios.put(
        `/yeelight-device/${deviceId}/${state}`,
        { commandId }
    );
    callback(result.data);
};

export const fetchAll = async (historyWindowSize: number | undefined) => {
    const [
        deviceMessagesUnified,
        valvesLastState,
        zigbeeDevices,
        stats,
        yeelightDevices,
        yeelightDeviceMessages,
        deviceCustomAttributes,
    ] = await Promise.all([

        axios.get<Array<IRootDeviceUnifiedMessage>>(oneLineTrim`
            /device-messages-unified?historyWindowSize=${historyWindowSize}
        `),

        axios.get<IValveStateMessage>('/valve-state/get-last'),

        axios.get<Array<IZigbee2mqttBridgeConfigDevice>>('/zigbee-devices'),

        axios.get<Record<string, number>>('/stats'),

        axios.get<Array<IYeelightDevice>>('/yeelight-devices'),

        axios.get<Array<IYeelightDeviceMessage>>(oneLineTrim`
            /yeelight-device-messages?historyWindowSize=${historyWindowSize}
        `),

        axios.get<IDeviceCustomAttributes>(`/device-custom-attributes`),

    ]);

    return {
        deviceMessagesUnified,
        valvesLastState,
        zigbeeDevices,
        stats,
        yeelightDevices,
        yeelightDeviceMessages,
        deviceCustomAttributes,
    };
};

// axios.get<Array<IRootDeviceUnifiedMessage>>(oneLineTrim`
//     /temperature-sensor-messages?historyWindowSize=${historyWindowSize}
// `),
