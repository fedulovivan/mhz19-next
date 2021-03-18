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
import last from 'lodash/last';
import moment from 'moment';
import { hot } from 'react-hot-loader';
import {
  HorizontalGridLines,
  LineSeries,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from 'react-vis';

import { IAqaraTemperatureSensorMessage, IZigbee2mqttBridgeConfigDevice } from 'src/typings/index.d';

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

const Root2: React.FC = () => {

    // state
    const [lastState, setLastState] = useState<{ data?: string; timestamp?: number }>({});
    const [zigbeeDevices, setZigbeeDevices] = useState<Array<IZigbee2mqttBridgeConfigDevice>>([]);
    const [temperatureSensorMessages, setTemperatureSensorMessages] = useState<Array<object/* todo */>>([]);

    // on/off handler
    const handleOpen = useCallback(() => handler('off'), []);
    const handleClose = useCallback(() => handler('on'), []);

    // periodically fetch last state
    useEffect(() => {
        const fetchOnce = () => {
            axios.get('/valve-state/get-last').then(({ data }) => setLastState(data?.[0]));
            axios.get('/zigbee-devices').then(({ data }) => setZigbeeDevices(data));
            axios.get('/temperature-sensor-messages').then(({ data }) => setTemperatureSensorMessages(data));
        };
        fetchOnce();
        const intervalId = setInterval(fetchOnce, 10000);
        return () => clearInterval(intervalId);
    }, []);

    const seriesData = temperatureSensorMessages.map(row => {

    });

    return (
        <div>
            Hello from mhz19-next!
            <br />
            <br />
            Valves menipulator&nbsp;
            {
                lastState
                    ? (
                        <>
                            last seen <b>{moment(lastState?.timestamp).fromNow()}</b>,
                            last message: {lastState?.data}
                        </>
                    )
                    : '<no info>'
            }
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
                <div>Last Seen</div>
                <div>Battery</div>
                <div>Device ID</div>
                {zigbeeDevices.map(device => {
                    return (
                        <React.Fragment key={device.friendly_name}>
                            <div>{device.description ?? '-'}</div>
                            <div>{moment(device.last_seen).fromNow()}</div>
                            <div>{device.battery}</div>
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


/*             <XYPlot
                width={600}
                height={300}
            >

                <XAxis  tickFormat={v => moment(v).format('HH:mm')} />
                <YAxis />

                <VerticalGridLines />
                <HorizontalGridLines />

                <LineSeries
                    data={
                        temperatureSensorMessages.map(row => {
                            return { x: row.timestamp, y: row.pressure };
                        })
                    }
                />

            </XYPlot> */