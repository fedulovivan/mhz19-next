/* eslint-disable max-len */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { css } from '@emotion/css';
import {
  green,
  grey,
  red,
} from '@material-ui/core/colors';
import axios from 'axios';
import first from 'lodash/first';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import moment from 'moment';
import { hot } from 'react-hot-loader';

import Chart from 'src/components/Chart';
import Messages from 'src/components/Messages';
import ValveButton from 'src/components/ValveButton';
import {
  HISTORY_WINDOW_14DAYS,
  HISTORY_WINDOW_30DAYS,
  HISTORY_WINDOW_3DAYS,
  HISTORY_WINDOW_7DAYS,
  HISTORY_WINDOW_DAY,
  LAST_SEEN_OUTDATION,
} from 'src/constants';
import {
  IYeelightDevice,
  IZigbee2mqttBridgeConfigDevice,
  IZigbeeDeviceMessage,
} from 'src/typings/index.d';

// import { localStorageGetNumber } from 'src/utils';

function toZigbeeDeviceFormat(foo) {
    return {
        description: `Valves manipulator box`,
        friendly_name: `valves-manipulator-box`,
        ...foo,
    };
}

/**
 * TODO move to client-side utils
 */
export function localStorageGetNumber(field: string, defValue: number): number {
    const val = window.localStorage.getItem(field);
    if (val) return Number(val);
    return defValue;
}

/**
 * TODO move to client-side utils
 */
export function localStorageSet(field: string, value: number) {
    window.localStorage.setItem(field, String(value));
}

const toggleValves = (state: 'on' | 'off') => {
    axios.put(`/valve-state/${state}`);
};

const toggleYeelightDevice = (deviceId: string, state: 'on' | 'off') => {
    axios.put(`/yeelight-device/${deviceId}/${state}`);
};

const Root: React.FC = () => {

    const defaultHistoryWindowSize = localStorageGetNumber('defaultHistoryWindowSize', HISTORY_WINDOW_7DAYS);

    // state
    const [historyWindowSize, setHistoryWindowSize] = useState<number | undefined>(
        defaultHistoryWindowSize
    );
    const [valvesLastState, setValvesLastState] = useState<{ data?: string; timestamp?: number }>({});
    const [zigbeeDevices, setZigbeeDevices] = useState<Array<IZigbee2mqttBridgeConfigDevice>>([]);
    const [deviceMessagesUnified, setDeviceMessagesUnified] = useState<Array<{ deviceId: string; timestamp: number } & IZigbeeDeviceMessage>>([]);
    const [stats, setStats] = useState<any>({});
    const [yeelightDevices, setYeelightDevices] = useState<Array<IYeelightDevice>>([]);
    const [yeelightDeviceMessages, setYeelightDeviceMessages] = useState<Array<object>>([]);
    const [deviceCustomAttributes, setDeviceCustomAttributes] = useState<object>({});

    const deviceMessagesGroupped = groupBy(deviceMessagesUnified, 'device_id');
    deviceMessagesGroupped['valves-manipulator-box'] = [valvesLastState];

    const temperatureSensorMessages = deviceMessagesGroupped['0x00158d00067cb0c9'];

    // valves on/off handler
    const handleOpen = useCallback(() => toggleValves('off'), []);
    const handleClose = useCallback(() => toggleValves('on'), []);

    const handleHistoryWindowSizeChange = (e) => {
        const stringValue = e.target.value;
        localStorageSet('defaultHistoryWindowSize', stringValue);
        setHistoryWindowSize(stringValue ? parseInt(stringValue, 10) : undefined);
    };

    // periodically fetch last state
    useEffect(() => {
        const fetchAll = () => {
            Promise.all([
                axios.get(`/device-messages-unified?historyWindowSize=${historyWindowSize}`),
                axios.get(`/temperature-sensor-messages?historyWindowSize=${historyWindowSize}`),
                axios.get('/valve-state/get-last'),
                axios.get('/zigbee-devices'),
                axios.get('/stats'),
                axios.get('/yeelight-devices'),
                axios.get(`/yeelight-device-messages?historyWindowSize=${historyWindowSize}`),
                axios.get(`/device-custom-attributes`),
            ]).then((responses) => {
                setDeviceMessagesUnified(responses[0].data.concat(responses[1].data));
                setValvesLastState(responses[2].data);
                setZigbeeDevices(responses[3].data);
                setStats(responses[4].data);
                setYeelightDevices(responses[5].data);
                setYeelightDeviceMessages(responses[6].data);
                setDeviceCustomAttributes(responses[7].data);
            });
        };
        fetchAll();
        const intervalId = setInterval(fetchAll, 10000);
        return () => clearInterval(intervalId);
    }, [historyWindowSize]);

    return (
        <div>
            Hello from mhz19-next!
            <br />
            <div
                className={css`
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-column-gap: 18px;
                    margin-top: 20px;
                `}
            >
                <ValveButton
                    color={red[600]}
                    onClick={handleClose}
                    autoDisableFor={20 * 1000}
                >
                    CLOSE valves
                </ValveButton>
                <ValveButton
                    color={green[600]}
                    onClick={handleOpen}
                    autoDisableFor={5 * 1000}
                >
                    OPEN valves
                </ValveButton>
            </div>

            <hr className={css`margin: 20px 0`} />

            <div
                className={css`
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    margin-top: 20px;
                `}
            >
                <div>Custom Name</div>
                <div>Name</div>
                <div>Last Message</div>
                <div>Battery</div>
                <div>Device ID</div>
                {[...zigbeeDevices, toZigbeeDeviceFormat(valvesLastState)].map(device => {

                    // ignore Coordinator device, it does not contain anything interesting
                    if (device.friendly_name === 'Coordinator') return null;

                    const deviceMessages = sortBy(deviceMessagesGroupped[device.friendly_name], 'timestamp').reverse();

                    const mostRecentMessage = first(deviceMessages);
                    const lastSeenMoment = mostRecentMessage ? moment(mostRecentMessage.timestamp) : undefined;
                    const fromNowMs = lastSeenMoment ? Date.now() - lastSeenMoment.valueOf() : undefined;
                    const outdated = fromNowMs ? fromNowMs > LAST_SEEN_OUTDATION : true;

                    return (
                        <React.Fragment key={device.friendly_name}>
                            <div>{deviceCustomAttributes?.[device.friendly_name]?.name ?? '-'}</div>
                            <div>{device.description ?? '-'}</div>
                            <div className={outdated ? css`color: red` : undefined}>
                                {deviceMessages ? <Messages deviceId={device.friendly_name} data={deviceMessages} /> : null}
                                {lastSeenMoment ? lastSeenMoment.fromNow() : 'no info'}
                            </div>
                            <div>{mostRecentMessage?.battery ?? '-'}</div>
                            <div>{device.friendly_name}</div>
                        </React.Fragment>
                    );
                })}
            </div>

            <hr className={css`margin: 20px 0`} />

            <div
                className={css`
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    margin-top: 20px;
                `}
            >
                <div>Custom Name</div>
                <div>Model</div>
                <div>Last Message</div>
                <div>Host/Port</div>
                <div>ID</div>
                <div />
                {yeelightDevices.map(device => {

                    const deviceMessages = yeelightDeviceMessages.filter(({ device_id }) => device_id === device.id);
                    const lastMessage = deviceMessages?.[0];
                    const state = lastMessage?.result?.[0];
                    const isOn = state === 'on';

                    return (
                        <React.Fragment key={device.id}>
                            <div>{deviceCustomAttributes?.[device.id]?.name ?? '-'}</div>
                            <div>{device.model}</div>
                            <div>
                                {deviceMessages.length ? <Messages deviceId={device.id} data={deviceMessages} /> : null}
                                {lastMessage ? moment(lastMessage.timestamp).fromNow() : 'no data'}
                            </div>
                            <div>{device.host}:{device.port}</div>
                            <div>{device.id}</div>
                            <div
                                className={css`
                                    button {
                                        border: 0;
                                        padding: 5px;
                                        &:nth-child(1) {
                                            border-top-left-radius: 5px;
                                            border-bottom-left-radius: 5px;
                                        }
                                        &:nth-child(2) {
                                            border-top-right-radius: 5px;
                                            border-bottom-right-radius: 5px;
                                        }
                                    }
                                `}
                            >
                                <button disabled={isOn} type="button" onClick={() => toggleYeelightDevice(device.id, 'on')}>ON</button>
                                <button disabled={!isOn} type="button" onClick={() => toggleYeelightDevice(device.id, 'off')}>OFF</button>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            <hr className={css`margin: 20px 0`} />

            Temperature: {first(temperatureSensorMessages)?.temperature} C,
            Humidity: {first(temperatureSensorMessages)?.humidity} %,
            Pressure: {Math.round(first(temperatureSensorMessages)?.pressure / 1.33322)} mmh,

            History for:&nbsp;
            <select
                value={historyWindowSize}
                onChange={handleHistoryWindowSizeChange}
            >
                <option value={HISTORY_WINDOW_DAY}>1 day</option>
                <option value={HISTORY_WINDOW_3DAYS}>3 days</option>
                <option value={HISTORY_WINDOW_7DAYS}>7 days</option>
                <option value={HISTORY_WINDOW_14DAYS}>14 days</option>
                <option value={HISTORY_WINDOW_30DAYS}>30 days</option>
                <option value="">all time</option>
            </select>

            <Chart messages={temperatureSensorMessages} />

            <div className={css`font-size: 12px; color: ${grey[500]}`}>Application meta: {JSON.stringify(stats)}</div>

        </div>
    );

};

export default hot(module)(Root);
