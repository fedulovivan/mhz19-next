/* eslint-disable jsx-a11y/anchor-is-valid */
/**
 * Main Component
 */

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
import last from 'lodash/last';
import moment from 'moment';
import { hot } from 'react-hot-loader';

import { IZigbee2mqttBridgeConfigDevice, IZigbeeDeviceMessage } from 'src/typings/index.d';

const LAST_SEEN_OUDATION = 45 * 60 * 1000; // 45m

function toZigbeeDeviceFormat(foo) {
    return {
        description: `Valves manipulator box`,
        friendly_name: `valves-manipulator-box`,
        ...foo,
    };
}

const ValveButton: React.FC<{
    onClick: React.DOMAttributes<HTMLButtonElement>['onClick'];
    color: string;
    autoDisableFor: number;
}> = ({
    children,
    onClick,
    color,
    autoDisableFor,
}) => {
    const [timer, setTimer] = useState(0);
    const loading = timer > 0;
    const styling = css`
        color: ${loading ? null : 'white'};
        background-color: ${loading ? grey[200] : color};
        border: 0;
        border-radius: 5px;
        height: 40px;
    `;
    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        let innerTimer = autoDisableFor;
        setTimer(innerTimer);
        const intervalId = setInterval(() => {
            innerTimer -= 1000;
            setTimer(innerTimer);
            if (innerTimer <= 0) clearInterval(intervalId);
        }, 1000);
    }, [autoDisableFor, onClick]);
    return (
        <button
            type="button"
            disabled={loading}
            className={styling}
            onClick={handleClick}
        >
            {loading ? `Wait ${timer / 1000} seconds` : children}
        </button>
    );
};

const handler = (state: 'on' | 'off') => {
    axios.put(`/valve-state/${state}`);
};

const Messages: React.FC<{ data: Array<any> }> = ({ data }) => {
    const showMessage = () => alert(JSON.stringify(data, null, '  '));
    return <a href="#" onClick={showMessage} className={css`margin-right: 5px;`} title={`View ${data.length} message(s)`}>view</a>;
};

const Root2: React.FC = () => {

    // state
    const [valvesLastState, setValvesLastState] = useState<{ data?: string; timestamp?: number }>({});
    const [zigbeeDevices, setZigbeeDevices] = useState<Array<IZigbee2mqttBridgeConfigDevice>>([]);
    const [deviceMessagesUnified, setDeviceMessagesUnified] = useState<Array<{ deviceId: string, timestamp: number } & IZigbeeDeviceMessage>>([]);

    const deviceMessagesGroupped = groupBy(deviceMessagesUnified, 'device_id');
    deviceMessagesGroupped['valves-manipulator-box'] = [valvesLastState];

    const temperatureSensorMessages = deviceMessagesGroupped['0x00158d00067cb0c9'];

    // on/off handler
    const handleOpen = useCallback(() => handler('off'), []);
    const handleClose = useCallback(() => handler('on'), []);

    // periodically fetch last state
    useEffect(() => {
        const fetchOnce = () => {
            axios.get('/valve-state/get-last').then(({ data }) => setValvesLastState(data));
            axios.get('/zigbee-devices').then(({ data }) => setZigbeeDevices(data));
            axios.get('/device-messages-unified').then(({ data }) => setDeviceMessagesUnified(data));
        };
        fetchOnce();
        const intervalId = setInterval(fetchOnce, 10000);
        return () => clearInterval(intervalId);
    }, []);

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
                    grid-template-columns: repeat(4, 1fr);
                    margin-top: 20px;
                `}
            >
                <div>Name</div>
                <div>Last Message</div>
                <div>Battery</div>
                <div>Device ID</div>
                {[...zigbeeDevices, toZigbeeDeviceFormat(valvesLastState)].map(device => {

                    // ignore Coordinator device, it does not contain anything interesting
                    if (device.friendly_name === 'Coordinator') return null;

                    const deviceMessages = (deviceMessagesGroupped[device.friendly_name]);
                    const lastMessage = first(deviceMessages);

                    const lastSeenMoment = lastMessage ? moment(lastMessage.timestamp) : undefined;

                    const fromNowMs = lastSeenMoment ? Date.now() - lastSeenMoment.valueOf() : undefined;

                    const outdated = fromNowMs ? fromNowMs > LAST_SEEN_OUDATION : true;
                    return (
                        <React.Fragment key={device.friendly_name}>
                            <div>{device.description ?? '-'}</div>
                            <div className={outdated ? css`color: red` : undefined}>
                                {deviceMessages ? <Messages data={deviceMessages} /> : null}
                                {lastSeenMoment ? lastSeenMoment.fromNow() : 'no info'}
                            </div>
                            <div>{lastMessage?.battery ?? '-'}</div>
                            <div>{device.friendly_name}</div>
                        </React.Fragment>
                    );
                })}
            </div>

            <hr className={css`margin: 20px 0`} />

            Temperature: {last(temperatureSensorMessages)?.temperature} C,
            Humidity: {last(temperatureSensorMessages)?.humidity} %,
            Pressure: {Math.round(last(temperatureSensorMessages)?.pressure / 1.33322)} mmh

        </div>
    );

};

export default hot(module)(Root2);
