
/** @jsx jsx */

/* eslint-disable react/prop-types */

/**
 * choosing css in js - https://github.com/streamich/freestyler/blob/master/docs/en/generations.md
 */

import { jsx } from '@emotion/core';

import {
    APP_HOST,
    APP_PORT,
    MINUTE,
    HOUR,
    DAY
} from './constants';

import * as React from 'react'; // workaround from https://github.com/parcel-bundler/parcel/issues/1199#issuecomment-381817548
import ReactDOM from 'react-dom';

const { useState, useEffect, useReducer } = React;

import SocketIoClient from 'socket.io-client';
import classNames from 'classnames';
import moment from 'moment';

import last from 'lodash/last';
import find from 'lodash/find';
import sortBy from 'lodash/sortBy';

import {
    XYPlot,
    LineSeries,
    VerticalGridLines,
    HorizontalGridLines,
    XAxis,
    YAxis,
} from 'react-vis';

import { makeStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import grey from '@material-ui/core/colors/grey';
import red from '@material-ui/core/colors/red';

import 'react-vis/dist/style.css';

const useStyles = makeStyles({
    root: {
    },
    cards: {
        display: 'grid',
        gridAutoFlow: 'column',
        gridColumnGap: '24px',
        justifyContent: 'start',
    },
    card: {
        display: 'grid',
        // justifyContent: 'center',
    },
    unit: {
        alignSelf: 'start',
        color: grey[500],
    },
    value: {
        // TBD
    },
    options: {
        minWidth: '150px',
    },
    // sensorImage: {
    //     width: '100px',
    //     height: '100px',
    // },
    water_leak: {
        backgroundColor: red[300],
    }
});

const HISTORY_OPTIONS = [
    { name: "1 minute", value: MINUTE },
    { name: "15 minutes", value: MINUTE * 15 },
    { name: "30 minutes", value: MINUTE * 30 },
    { name: "1 hour", value: HOUR },
    { name: "4 hours", value: HOUR * 4 },
    { name: "12 hours", value: HOUR * 12 },
    { name: "1 day", value: DAY },
];

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

function LeakageSensorCard({ mostRecentState, lastSeen, lastHistoricalState }) {

    // const classes = /* useStyles() */{};

    const [random, setRandom] = useState(0);

    useEffect(()=> {
        setInterval(() => {
            setRandom(Math.random());
        }, 10000);
    }, []);

    return (
        <Card>
            <CardContent /* className={classNames(classes.card, { [classes.water_leak]: mostRecentState.water_leak })} */>
                {/* <div>{friendly_name}</div> */}
                <img
                    css={{
                        width: '100px',
                        height: '100px',
                        '&:hover': {
                            width: '105px',
                            height: '105px',
                        }
                    }}
                    src="/73a62bd23ab22ddf1d9bbfa77c48246a.jpg"
                />
                <div data-rnd={random}>last seen {moment(mostRecentState.last_seen || (lastHistoricalState && lastHistoricalState.last_seen) || lastSeen).fromNow()}</div>
                <div>{mostRecentState.battery ? `battery ${mostRecentState.battery}%` : 'battery info is not yet available'}</div>
            </CardContent>
        </Card>
    );
}
LeakageSensorCard.defaultProps = {
    mostRecentState: {},
}

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

    const classes = useStyles(/* props */);

    const lastMhzDoc = last(mhzDocs);

    const seriesData = mhzDocs ? mhzDocs.map(({ co2, timestamp }) => ({ x: timestamp, y: co2 })) : [];

    // const waterSensorRecentMessages

    return (
        <div className={classes.root}>
            <div className={classes.cards}>
                <Card>
                    <CardContent className={classNames(classes.card, classes.options)}>
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
                    <CardContent className={classes.card}>
                        <Typography className={classes.value} variant="h2">
                            {lastMhzDoc && lastMhzDoc.co2}
                        </Typography>
                        <Typography className={classes.unit} variant="h5">
                            CO2
                        </Typography>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className={classes.card}>
                        <Typography className={classes.value} variant="h2">
                            {lastMhzDoc && lastMhzDoc.temp}
                        </Typography>
                        <Typography className={classes.unit} variant="h5">
                            °C
                        </Typography>
                    </CardContent>
                </Card>
                {zigbeeDevices && zigbeeDevices.map(({ type, model, friendly_name, lastSeen }) => {
                    if (model !== 'SJCGQ11LM') return null;
                    return (
                        <LeakageSensorCard
                            key={friendly_name}
                            mostRecentState={deviceStates[friendly_name]}
                            lastSeen={lastSeen}
                            lastHistoricalState={find(sortBy(waterSensorRecentMessages, 'timestamp'), ({ topic }) => topic === `zigbee2mqtt/${friendly_name}`)}
                        />
                    );
                })}
            </div>
            {error}
        </div>
    );

}

ReactDOM.render(
    <Root />,
    document.getElementById('root')
);
