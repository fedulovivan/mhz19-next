/** @jsx jsx */

import { useEffect, useReducer } from 'react';
import SocketIoClient, { Socket } from 'socket.io-client';
import last from 'lodash/last';
import find from 'lodash/find';
import sortBy from 'lodash/sortBy';
import { css, jsx } from '@emotion/core';
import { hot } from 'react-hot-loader';

import Select from '@material-ui/core/Select';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import LeakageSensorCard from './LeakageSensorCard';
import NumericCard from './NumericCard';
import MhzChartCard from './MhzChartCard';
import reducer, { intialState } from './reducer';

import {
    APP_HOST,
    APP_PORT,
    HISTORY_OPTIONS,
} from './constants';

import {
    SET_WS_CONNECT_DATA,
    SET_HISTORY_OPTION,
    SAVE_DEVICE_STATE,
    ADD_MHZ_DOC,
} from './actionTypes';

import 'react-vis/dist/style.css';

let io: SocketIOClient.Socket;

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

const options = css`
    min-width: 150px;
`;

function Root() {

    const [state, dispatch] = useReducer(reducer, intialState);

    const {
        mhzDocs,
        zigbeeDevices,
        waterSensorRecentMessages,
        historyOption,
        deviceStates,
        error,
    } = state as IInitialState;

    useEffect(() => {
        io = SocketIoClient(`ws://${APP_HOST}:${APP_PORT}`, {
            query: { historyOption },
        });
        io.on('bootstrap', (bootstrap) => {
            dispatch({ type: SET_WS_CONNECT_DATA, payload: { bootstrap } });
        });
        io.on('mhzDoc', (doc) => {
            dispatch({ type: ADD_MHZ_DOC, payload: doc });
        });
        io.on('deviceState', (message) => {
            console.log('deviceState', message);
            dispatch({ type: SAVE_DEVICE_STATE, payload: message });
        });
    }, []);

    const handleHistoryOptionChange = (event) => {
        const value = parseInt(event.target.value, 10);
        dispatch({ type: SET_HISTORY_OPTION, payload: { historyOption: value } })
        io.emit("queryMhzDocs", value);
    };

    const lastMhzDoc = last(mhzDocs);

    const seriesData = mhzDocs ? mhzDocs.map(({ co2, timestamp }) => ({ x: timestamp, y: co2 })) : [];

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
                <MhzChartCard css={card} seriesData={seriesData} />
                <NumericCard css={card} value={lastMhzDoc && lastMhzDoc.co2} unit="CO2" />
                <NumericCard css={card} value={lastMhzDoc && lastMhzDoc.temp} unit="°C" />
                {zigbeeDevices && zigbeeDevices.map(({ type, model, friendly_name, lastSeen }) => {
                    if (model !== 'SJCGQ11LM') return null;
                    return (
                        <LeakageSensorCard
                            rootCss={card}
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

export default hot(module)(Root);
