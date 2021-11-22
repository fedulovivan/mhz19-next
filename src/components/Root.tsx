import React, { useEffect, useState } from 'react';

import { css, cx } from '@emotion/css';
import Button from '@material-ui/core/Button';
import { grey } from '@material-ui/core/colors';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import PowerIcon from '@material-ui/icons/PowerSettingsNew';
import { produce } from 'immer';
import first from 'lodash/first';
import groupBy from 'lodash/groupBy';
import { hot } from 'react-hot-loader';

import { fetchAll, powerOff } from 'src/actions';
import { localStorageGetNumber, localStorageSet } from 'src/clientUtils';
import Chart from 'src/components/Chart';
import KeyValuePaper, { toDataRow } from 'src/components/KeyValuePaper';
import SonoffDevices from 'src/components/SonoffDevices';
import ValveButtons from 'src/components/ValveButtons';
import WindowSizePicker from 'src/components/WindowSizePicker';
import YeelightDevices from 'src/components/YeelightDevices';
import ZigbeeDevices from 'src/components/ZigbeeDevices';
import {
    DEVICE_NAME_TO_ID,
    HISTORY_WINDOW_7DAYS,
    NO_DATA_GAP,
    TEMPERATURE_SENSOR,
} from 'src/constants';
import { useBooleanState } from 'src/hooks';

require('normalize.css');

const rootStyles = css`
    /* background-color: ${grey[100]}; */
    /* https://uigradients.com/#Jodhpur */
    background: linear-gradient(to right, #0052D4, #65C7F7, #9CECFB);
    padding: 20px;
    /* & > .MuiPaper-root {
        margin-bottom: 20px;
    } */
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 20px;

    font-family: 'Roboto', sans-serif;

    .col-12 {
        grid-column: 1/13;
    }
`;

const Root: React.FC = () => {

    const defaultHistoryWindowSize = localStorageGetNumber('defaultHistoryWindowSize', HISTORY_WINDOW_7DAYS);

    // state
    const [fetchInProgress, setFetchInProgress, unsetFetchInProgress] = useBooleanState(false);
    const [historyWindowSize, setHistoryWindowSize] = useState<number | undefined>(
        defaultHistoryWindowSize
    );
    const [valvesStateMessages, setValvesStateMessages] = useState<Array<IValveStateMessage>>([]);
    const [zigbeeDevices, setZigbeeDevices] = useState<Array<IZigbee2mqttBridgeConfigDevice>>([]);
    const [sonoffDevices, setSonoffDevices] = useState<Array<ISonoffDeviceUnwrapped>>([]);
    const [deviceMessagesUnified, setDeviceMessagesUnified] = useState<Array<IRootDeviceUnifiedMessage>>([]);
    const [stats, setStats] = useState<any>({});
    const [yeelightDevices, setYeelightDevices] = useState<Array<IYeelightDevice>>([]);
    const [yeelightDeviceMessages, setYeelightDeviceMessages] = useState<Array<IYeelightDeviceMessage>>([]);
    const [deviceCustomAttributes, setDeviceCustomAttributes] = useState<IDeviceCustomAttributesIndexed>({});

    const deviceMessagesGroupped = groupBy(deviceMessagesUnified, 'device_id');

    const temperatureSensorMessages = (
        deviceMessagesGroupped[DEVICE_NAME_TO_ID[TEMPERATURE_SENSOR]] as Array<IAqaraTemperatureSensorMessage & TDeviceIdAndTimestamp>
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
                const {
                    deviceMessagesUnified,
                    valvesStateMessages,
                    zigbeeDevices,
                    stats,
                    yeelightDevices,
                    yeelightDeviceMessages,
                    deviceCustomAttributes,
                    sonoffDevices,
                } = await fetchAll(historyWindowSize);
                setDeviceMessagesUnified(deviceMessagesUnified.data);
                setValvesStateMessages(valvesStateMessages.data);
                setZigbeeDevices(zigbeeDevices.data);
                setStats(stats.data);
                setYeelightDevices(yeelightDevices.data);
                setYeelightDeviceMessages(yeelightDeviceMessages.data);
                setDeviceCustomAttributes(deviceCustomAttributes.data);
                setSonoffDevices(sonoffDevices.data);
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
                    asCards
                    data={lastTemperatureMessage ? [
                        ['Temperature', lastTemperatureMessage.temperature, '℃'],
                        ['Humidity', lastTemperatureMessage.humidity, '%'],
                        [
                            'Pressure',
                            Math.round(lastTemperatureMessage.pressure / 1.33322),
                            'mmh'
                        ],
                    ] : []}
                >
                    <>
                        <WindowSizePicker
                            historyWindowSize={historyWindowSize}
                            handleHistoryWindowSizeChange={handleHistoryWindowSizeChange}
                        />
                        <Button
                            style={{ justifySelf: 'end' }}
                            // variant="contained"
                            // color="info"
                            startIcon={<PowerIcon />}
                            onClick={() => {
                                // eslint-disable-next-line no-restricted-globals
                                if (confirm('Confirm server power off')) {
                                    powerOff();
                                }
                            }}
                        >
                            Poweroff
                        </Button>
                    </>
                </KeyValuePaper>

                <Chart
                    className="col-12"
                    messages={temperatureSensorMessages}
                    title="Temperature and pressure trend"
                />

                <ValveButtons
                    className="col-12"
                    valvesStateMessages={valvesStateMessages}
                />

                <ZigbeeDevices
                    // valvesLastState={valvesLastState}
                    className="col-12"
                    zigbeeDevices={zigbeeDevices}
                    deviceMessagesGroupped={deviceMessagesGroupped}
                    deviceCustomAttributes={deviceCustomAttributes}
                />

                <YeelightDevices
                    className="col-12"
                    yeelightDevices={yeelightDevices}
                    yeelightDeviceMessages={yeelightDeviceMessages}
                    deviceCustomAttributes={deviceCustomAttributes}
                    onDeviceFeedback={messages => {
                        if (messages.length) {
                            setYeelightDeviceMessages(messages.concat(yeelightDeviceMessages));
                        }
                    }}
                />

                <SonoffDevices
                    className="col-12"
                    devices={sonoffDevices}
                    deviceCustomAttributes={deviceCustomAttributes}
                    onDeviceFeedback={(data) => {
                        if (data.error === 0) {
                            setSonoffDevices(produce(sonoffDevices, devices => {
                                devices.forEach(device => {
                                    if (device.device_id === data.deviceId) {
                                        device.switch = data.switch;
                                        device.timestamp = Date.now();
                                    }
                                });
                            }));
                        }
                    }}
                />

                <Paper
                    elevation={2}
                    className={cx(css`
                        padding: 20px;
                    `, 'col-12')}
                >
                    {JSON.stringify(stats, null, ' ')}
                </Paper>
                {/* <KeyValuePaper
                    className="col-12"
                    title="Application Meta"
                    data={toDataRow(stats)}
                /> */}

            </div>
        </>
    );

};

Root.displayName = 'Root';

export default hot(module)(Root);
