/**
 * TODOs:
 * (+) show spinner/loader on page first open
 */

import React, { useEffect, useState } from 'react';

import { css } from '@emotion/css';
import { grey } from '@material-ui/core/colors';
import LinearProgress from '@material-ui/core/LinearProgress';
import first from 'lodash/first';
import groupBy from 'lodash/groupBy';
import { hot } from 'react-hot-loader';

import { fetchAll } from 'src/actions';
import { localStorageGetNumber, localStorageSet } from 'src/clientUtils';
import Chart from 'src/components/Chart';
import KeyValuePaper, { toDataRow } from 'src/components/KeyValuePaper';
import ValveButtons from 'src/components/ValveButtons';
import WindowSizePicker from 'src/components/WindowSizePicker';
import YeelightDevices from 'src/components/YeelightDevices';
import ZigbeeDevices from 'src/components/ZigbeeDevices';
import { HISTORY_WINDOW_7DAYS } from 'src/constants';
import { useBooleanState } from 'src/hooks';

require('normalize.css');

const rootStyles = css`
    background-color: ${grey[100]};
    padding: 20px;
    & > .MuiPaper-root {
        margin-bottom: 20px;
    }
`;

const Root: React.FC = () => {

    const defaultHistoryWindowSize = localStorageGetNumber('defaultHistoryWindowSize', HISTORY_WINDOW_7DAYS);

    // state
    const [fetchInProgress, setFetchInProgress, unsetFetchInProgress] = useBooleanState(false);
    const [historyWindowSize, setHistoryWindowSize] = useState<number | undefined>(
        defaultHistoryWindowSize
    );
    const [valvesLastState, setValvesLastState] = useState<IValveStateMessage>();
    const [zigbeeDevices, setZigbeeDevices] = useState<Array<IZigbee2mqttBridgeConfigDevice>>([]);
    const [deviceMessagesUnified, setDeviceMessagesUnified] = useState<Array<IRootDeviceUnifiedMessage>>([]);
    const [stats, setStats] = useState<any>({});
    const [yeelightDevices, setYeelightDevices] = useState<Array<IYeelightDevice>>([]);
    const [yeelightDeviceMessages, setYeelightDeviceMessages] = useState<Array<IYeelightDeviceMessage>>([]);
    const [deviceCustomAttributes, setDeviceCustomAttributes] = useState<IDeviceCustomAttributes>({});

    const deviceMessagesGroupped = groupBy(deviceMessagesUnified, 'device_id');
    deviceMessagesGroupped['valves-manipulator-box'] = [valvesLastState];

    const temperatureSensorMessages = (
        deviceMessagesGroupped['0x00158d00067cb0c9'] as Array<IAqaraTemperatureSensorMessage & TDeviceIdAndTimestamp>
    );
    const lastTemperatureMessage = first(temperatureSensorMessages);

    const handleHistoryWindowSizeChange = (e: any) => {
        const stringValue = e.target.value;
        localStorageSet('defaultHistoryWindowSize', stringValue);
        setHistoryWindowSize(stringValue ? parseInt(stringValue, 10) : undefined);
    };

    // periodically fetch fresh data
    useEffect(() => {
        const doFetchTick = async () => {
            try {
                setFetchInProgress();
                const responses = await fetchAll(historyWindowSize);
                setDeviceMessagesUnified(responses[0].data.concat(responses[1].data));
                setValvesLastState(responses[2].data);
                setZigbeeDevices(responses[3].data);
                setStats(responses[4].data);
                setYeelightDevices(responses[5].data);
                setYeelightDeviceMessages(responses[6].data);
                setDeviceCustomAttributes(responses[7].data);
            } finally {
                unsetFetchInProgress();
            }
        };
        doFetchTick();
        const intervalId = setInterval(doFetchTick, 10000);
        return () => clearInterval(intervalId);
    }, [historyWindowSize, setFetchInProgress, unsetFetchInProgress]);

    return (
        <>
            { fetchInProgress && <LinearProgress style={{ width: '100%', position: "fixed", zIndex: 999 }} /> }
            <div className={rootStyles}>

                <KeyValuePaper
                    data={lastTemperatureMessage ? [
                        ['Temperature', lastTemperatureMessage.temperature, 'C'],
                        ['Humidity', lastTemperatureMessage.humidity, '%'],
                        [
                            'Pressure',
                            Math.round(lastTemperatureMessage.pressure / 1.33322),
                            'mmh'
                        ],
                    ] : []}
                >
                    <WindowSizePicker
                        historyWindowSize={historyWindowSize}
                        handleHistoryWindowSizeChange={handleHistoryWindowSizeChange}
                    />
                </KeyValuePaper>

                <Chart
                    messages={temperatureSensorMessages}
                    title="Temperature and pressure trend"
                />

                <ValveButtons />

                <ZigbeeDevices
                    zigbeeDevices={zigbeeDevices}
                    valvesLastState={valvesLastState}
                    deviceMessagesGroupped={deviceMessagesGroupped}
                    deviceCustomAttributes={deviceCustomAttributes}
                />

                <YeelightDevices
                    yeelightDevices={yeelightDevices}
                    yeelightDeviceMessages={yeelightDeviceMessages}
                    deviceCustomAttributes={deviceCustomAttributes}
                    onDeviceFeedback={messages => {
                        if (messages.length) {
                            setYeelightDeviceMessages(messages.concat(yeelightDeviceMessages));
                        }
                    }}
                />

                <KeyValuePaper
                    title="Application Meta"
                    data={toDataRow(stats)}
                />

            </div>
        </>
    );

};

export default hot(module)(Root);
