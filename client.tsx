
/** @jsx jsx */

/**
 * why cssinjs? https://medium.com/jobsity/css-in-javascript-with-jss-and-react-54cdd2720222
 * choosing cssinjs implementation - https://github.com/streamich/freestyler/blob/master/docs/en/generations.md
 */

import { useEffect, useReducer } from 'react';
import ReactDOM from 'react-dom';
import SocketIoClient from 'socket.io-client';
import moment from 'moment';
import last from 'lodash/last';
import find from 'lodash/find';
import sortBy from 'lodash/sortBy';
import { css, jsx } from '@emotion/core';
import { hot } from 'react-hot-loader';

import {
    XYPlot,
    LineSeries,
    VerticalGridLines,
    HorizontalGridLines,
    XAxis,
    YAxis,
} from 'react-vis';

import Select from '@material-ui/core/Select';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import grey from '@material-ui/core/colors/grey';
import red from '@material-ui/core/colors/red';

import LeakageSensorCard from './LeakageSensorCard';

import {
    APP_HOST,
    APP_PORT,
    MINUTE,
    HISTORY_OPTIONS
} from './constants';

import 'react-vis/dist/style.css';

// const { useState, useEffect, useReducer } = React;

interface IInitialState {
    mhzDocs: Array<IMhzDoc>;
    zigbeeDevices: Array<IZigbeeDeviceInfo>;
    waterSensorRecentMessages: Array<IAqaraWaterSensorMessage>;
    historyOption: number;
    deviceStates: { [friendly_name: string]: IAqaraWaterSensorMessage };
    error?: string;
}

const intialState: IInitialState = {
    mhzDocs: [],
    zigbeeDevices: [],
    waterSensorRecentMessages: [],
    historyOption: MINUTE * 30,
    deviceStates: {},
    error: undefined,
};

const reducer = (state: IInitialState, action: { type: string; payload: object }) => {
    const { type, payload } = action;
    switch (type) {
        // case 'SET_MHZ_DOCS':
        //     return {
        //         ...state,
        //         mhzDocs: payload.mhzDocs,
        //     }
        // case 'SET_ZIGBEE_DEVICES':
        //     return {
        //         ...state,
        //         zigbeeDevices: payload.zigbeeDevices,
        //     }
        case 'SET_WS_CONNECT_DATA':
            return {
                ...state,
                ...payload.bootstrap,
            }
        case 'ADD_MHZ_DOC':
            return {
                ...state,
                mhzDocs: [...state.mhzDocs.slice(1), payload],
            }
        case 'SET_HISTORY_OPTION':
            return {
                ...state,
                historyOption: payload.historyOption,
            }
        case 'SAVE_DEVICE_STATE':
            return {
                ...state,
                deviceStates: {
                    ...state.deviceStates,
                    [payload.friendly_name]: payload,
                }
            };
        // case 'SET_ERROR':
        //     return {
        //         ...state,
        //         error: payload.error,
        //     }
        default:
            return state;
    }
}

let io = null;

function Root() {

    const [state, dispatch] = useReducer(reducer, intialState);

    const {
        mhzDocs,
        zigbeeDevices,
        waterSensorRecentMessages,
        historyOption,
        deviceStates,
        error,
    } = state;

    useEffect(() => {
        io = SocketIoClient(`ws://${APP_HOST}:${APP_PORT}`, {
            query: { historyOption },
        });
        io.on('bootstrap', (bootstrap) => {
            dispatch({ type: 'SET_WS_CONNECT_DATA', payload: { bootstrap } });
        });
        io.on('mhzDoc', (doc) => {
            dispatch({ type: 'ADD_MHZ_DOC', payload: doc });
        });
        io.on('deviceState', (message) => {
            console.log('deviceState', message);
            dispatch({ type: 'SAVE_DEVICE_STATE', payload: message });
        });
    }, []);

    const handleHistoryOptionChange = (event) => {
        const value = parseInt(event.target.value, 10);
        dispatch({ type: 'SET_HISTORY_OPTION', payload: { historyOption: value } })
        io.emit("queryMhzDocs", value);
    };

    const lastMhzDoc = last(mhzDocs);

    const seriesData = mhzDocs ? mhzDocs.map(({ co2, timestamp }) => ({ x: timestamp, y: co2 })) : [];

    // const classes = useStyles();
    // const waterSensorRecentMessages
    // const classes = {};

    const base = css`
        display: grid;
    `;
    const cards = css`
        ${base};
        grid-auto-flow: column;
        grid-column-gap: 24px;
        justify-content: start;
    `;
    const card = css`
        ${base};
    `;
    const value = css``;
    const unit = css`
        align-self: flex-start;
        color: ${grey[500]};
    `;
    const options = css`
        min-width: 150px;
    `;

    return (
        <div>
            <div css={cards}>
                <Card>
                    <CardContent css={[card, options]}>
                        <FormControl>
                            <InputLabel>History Window</InputLabel>
                            <Select
                                value={historyOption}
                                onChange={handleHistoryOptionChange}
                            >
                                {HISTORY_OPTIONS.map(item => {
                                    return (
                                        <MenuItem
                                            value={item.value}
                                            key={item.value}
                                        >
                                            {item.name}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </CardContent>
                </Card>
                <Card>
                    <XYPlot width={300} height={200}>
                        <YAxis />
                        <XAxis tickTotal={5} tickFormat={v => moment(v).format("HH:mm")} />
                        <VerticalGridLines />
                        <HorizontalGridLines />
                        <LineSeries data={seriesData} />
                    </XYPlot>
                </Card>
                <Card>
                    <CardContent css={card}>
                        <Typography css={value} variant="h2">
                            {lastMhzDoc && lastMhzDoc.co2}
                        </Typography>
                        <Typography css={unit} variant="h5">
                            CO2
                        </Typography>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent css={card}>
                        <Typography css={value} variant="h2">
                            {lastMhzDoc && lastMhzDoc.temp}
                        </Typography>
                        <Typography css={unit} variant="h5">
                            °C
                        </Typography>
                    </CardContent>
                </Card>
                <LeakageSensorCard />
                {zigbeeDevices && zigbeeDevices.map(({ type, model, friendly_name, lastSeen }) => {
                    if (model !== 'SJCGQ11LM') return null;
                    return (
                        <LeakageSensorCard
                            key={friendly_name}
                            lastSeen={lastSeen}
                            mostRecentState={deviceStates[friendly_name]}
                            lastHistoricalState={
                                find(
                                    sortBy(waterSensorRecentMessages, 'timestamp'),
                                    ({ topic }) => topic === `zigbee2mqtt/${friendly_name}`,
                                )
                            }
                        />
                    );
                })}
            </div>
            {error}
        </div>
    );

}

const RootHot = hot(module)(Root);

ReactDOM.render(
    <RootHot />,
    document.getElementById('root')
);
