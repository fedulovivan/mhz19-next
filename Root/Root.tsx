/* eslint-disable no-nested-ternary */
/** @jsx jsx */

import { useEffect, useReducer } from 'react';
import last from 'lodash/last';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';

import { hot } from 'react-hot-loader';
import { jsx } from '@emotion/core';

import Select from '@material-ui/core/Select';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import LeakageSensorCard from '../LeakageSensorCard/LeakageSensorCard';
import NumericCard from '../NumericCard';
import MhzChartCard from '../MhzChartCard/MhzChartCard';
import reducer, { intialState } from '../reducer';

import * as actions from '../actions';

import {
    METHOD_GET_BOOTSTRAP_DATA,
    METHOD_ADD_MHZ_DOC,
    METHOD_SET_DEVICE_STATE,
    METHOD_GET_MHZ_DOCS,
} from '../rpc';

import RpcClient from '../rpc/rpcClient';

import {
    HISTORY_OPTIONS,
    ZIGBEE_DEVICE_MODEL_LUMI_WATER_LEAK,
    ZIGBEE_DEVICE_MODEL_LUMI_POWER_PLUG,
} from '../constants';

import {
    SET_BOOTSTRAP_DATA,
    SAVE_RECENT_DEVICE_STATE,
    ADD_MHZ_DOC,
    SET_MHZ_DOCS,
} from '../actionTypes';

import 'react-vis/dist/style.css';

import * as styles from './styles';

const rpcClient = new RpcClient();

function Root() {

    const [state, dispatch] = useReducer(reducer, intialState);

    const {
        mhzDocs,
        zigbeeDevices,
        zigbeeDevivesMessages,
        historyOption,
        deviceStates,
        error,
        isPendingGetMhzDocs,
    } = state as IInitialState;

    // actions executed only once on component mount
    useEffect(() => {

        (async function bootstrap() {
            const responsePayload = await rpcClient.call(
                METHOD_GET_BOOTSTRAP_DATA,
                { historyOption }
            );
            dispatch({ type: SET_BOOTSTRAP_DATA, payload: responsePayload });
        }());

        rpcClient.respondTo(METHOD_ADD_MHZ_DOC, async (payload: object) => {
            dispatch({ type: ADD_MHZ_DOC, payload });
            return { clientTime: new Date() }; // not required, just to test if client response may be received
        });

        rpcClient.respondTo(METHOD_SET_DEVICE_STATE, async (payload: object) => {
            dispatch({ type: SAVE_RECENT_DEVICE_STATE, payload });
            return { clientTime: new Date() };
        });

    }, []);

    const handleHistoryOptionChange = async (event) => {
        const value = parseInt(event.target.value, 10);
        const f = actions.getMhzDocs(value);
        f(dispatch, rpcClient);
    };

    const lastMhzDoc = last(mhzDocs);

    const seriesData = mhzDocs
        ? mhzDocs.map(({ co2, timestamp }) => ({ x: timestamp, y: co2 }))
        : [];

    const grouppedSensorRecentMessages = groupBy(sortBy(zigbeeDevivesMessages, 'timestamp'), 'topic');

    return (
        <div>
            <div css={styles.cards}>
                <Card>
                    <CardContent css={[styles.card, styles.options]}>
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
                <MhzChartCard css={styles.card} seriesData={seriesData} loading={isPendingGetMhzDocs} />
                <NumericCard css={styles.card} value={lastMhzDoc && lastMhzDoc.co2} unit="CO2" />
                <NumericCard css={styles.card} value={lastMhzDoc && lastMhzDoc.temp} unit="°C" desc="MHZ19 Temperature" />
                {zigbeeDevices && sortBy(zigbeeDevices, 'type').map(({
                    type, model, friendly_name, lastSeen
                }) => {
                    const historyMessages = grouppedSensorRecentMessages[`zigbee2mqtt/${friendly_name}`];
                    const mostRecentState = deviceStates[friendly_name];
                    if (model === ZIGBEE_DEVICE_MODEL_LUMI_WATER_LEAK) {
                        return (
                            <LeakageSensorCard
                                key={friendly_name}
                                rootCss={styles.card}
                                lastSeen={lastSeen}
                                mostRecentState={mostRecentState}
                                historyMessages={historyMessages}
                            />
                        );
                    }
                    if (model === ZIGBEE_DEVICE_MODEL_LUMI_POWER_PLUG) {
                        return (
                            <NumericCard
                                key={friendly_name}
                                css={styles.card}
                                value={
                                    mostRecentState
                                        ? mostRecentState.power
                                        : (
                                            historyMessages
                                                ? last(historyMessages)?.power
                                                : 'unknown'
                                        )
                                }
                                unit="W"
                                desc="Heater Consumption"
                            />
                        );
                    }
                })}
            </div>
            {error}
        </div>
    );

}

export default hot(module)(Root);
