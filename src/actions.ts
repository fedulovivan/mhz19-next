import axios from 'axios';
import { oneLineTrim } from 'common-tags';

export const toggleValves = (id: number, state: 'open' | 'close') => {
    axios.put(`/valve-state/${id}/${state}`);
};

export const sendYeelightDeviceCommand = async (
    deviceId: string,
    state: TOnOff,
    commandId: number,
    callback: (data: Array<IYeelightDeviceMessage>) => void
) => {
    const result = await axios.put(
        `/yeelight-device/${deviceId}/${state}`,
        { commandId }
    );
    callback(result.data);
};

export const sendSonoffDeviceSwitchCmd = async (
    deviceId: string,
    state: TOnOff,
    callback: (data: { deviceId: string; switch: TOnOff; seq: number; error: number }) => void
) => {
    const result = await axios.put(`/sonoff-device/${deviceId}/switch`, { state });
    callback({
        ...result.data,
        deviceId,
        switch: state,
    });
};

export const powerOff = async() => {
    return axios.post('/poweroff');
};

export const fetchAll = async (historyWindowSize: number | undefined) => {
    const [
        // deviceMessagesUnified,
        // valvesStateMessages,
        // zigbeeDevices,
        stats,
        yeelightDevices,
        yeelightDeviceMessages,
        deviceCustomAttributes,
        sonoffDevices,
    ] = await Promise.all([

        // axios.get<Array<IRootDeviceUnifiedMessage>>(oneLineTrim`
        //     /device-messages-unified?historyWindowSize=${historyWindowSize}
        // `),

        // axios.get<Array<IValveStateMessage>>(`/valve-state?historyWindowSize=${historyWindowSize}`),

        // axios.get<Array<IZigbee2mqttBridgeConfigDevice>>('/zigbee-devices'),

        axios.get<Record<string, number>>('/stats'),

        axios.get<Array<IYeelightDevice>>('/yeelight-devices'),

        axios.get<Array<IYeelightDeviceMessage>>(oneLineTrim`
            /yeelight-device-messages?historyWindowSize=${historyWindowSize}
        `),

        axios.get<IDeviceCustomAttributesIndexed>(`/device-custom-attributes`),

        axios.get<Array<ISonoffDeviceUnwrapped>>(`/sonoff-devices`),

    ]);

    return {
        // deviceMessagesUnified,
        // valvesStateMessages,
        // zigbeeDevices,
        stats,
        yeelightDevices,
        yeelightDeviceMessages,
        deviceCustomAttributes,
        sonoffDevices,
    };
};

// axios.get<Array<IRootDeviceUnifiedMessage>>(oneLineTrim`
//     /temperature-sensor-messages?historyWindowSize=${historyWindowSize}
// `),
