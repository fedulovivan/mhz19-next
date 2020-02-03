/* eslint-disable no-nested-ternary */
/** @jsx jsx */

import { useEffect, useReducer } from 'react';
import { hot } from 'react-hot-loader';
import { jsx } from '@emotion/core';

import Select from '@material-ui/core/Select';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import LeakageSensorCard from 'src/components/LeakageSensorCard/LeakageSensorCard';
import MhzChartCard from 'src/components/MhzChartCard/MhzChartCard';
import NumericCard from 'src/components/NumericCard';

import reducer, { intialState } from 'src/react/reducer';
import * as actions from 'src/react/actions';
import * as selectors from 'src/react/selectors';

import {
    METHOD_GET_BOOTSTRAP_DATA,
    METHOD_ADD_MHZ_DOC,
    METHOD_SET_DEVICE_STATE,
} from 'src/rpc';

import RpcClient from 'src/rpc/rpcClient';

import {
    HISTORY_OPTIONS,
    ZIGBEE_DEVICE_MODEL_LUMI_WATER_LEAK,
    ZIGBEE_DEVICE_MODEL_LUMI_POWER_PLUG,
} from 'src/constants';

import {
    SET_BOOTSTRAP_DATA,
    SAVE_ZIGBEE_DEVICE_MESSAGE,
    ADD_MHZ_DOC,
} from 'src/react/actionTypes';

import 'react-vis/dist/style.css';

import * as styles from './styles';

const rpcClient = new RpcClient();

function Root() {

    const [state, dispatch] = useReducer(reducer, intialState);

    // actions executed only once on component mount
    useEffect(() => {

        (async function bootstrap() {
            const responsePayload = await rpcClient.call(
                METHOD_GET_BOOTSTRAP_DATA,
                { historyOption: selectors.getHistoryOption(state) }
            );
            dispatch({ type: SET_BOOTSTRAP_DATA, payload: responsePayload });
        }());

        rpcClient.respondTo(METHOD_ADD_MHZ_DOC, async (payload: object) => {
            dispatch({ type: ADD_MHZ_DOC, payload });
            // not required, just to test if client response may be received
            return { clientTime: new Date() };
        });

        rpcClient.respondTo(METHOD_SET_DEVICE_STATE, async (payload: object) => {
            dispatch({ type: SAVE_ZIGBEE_DEVICE_MESSAGE, payload });
            // not required, just to test if client response may be received
            return { clientTime: new Date() };
        });

    }, []);

    const handleHistoryOptionChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value, 10);
        const f = actions.getMhzDocs(value);
        f(dispatch, rpcClient);
    };

    const latestMessages = selectors.getLatestMessages(state);

    return (
        <div>
            <div css={styles.cards}>
                <Card>
                    <CardContent css={[styles.card, styles.options]}>
                        <FormControl>
                            <InputLabel>History Window</InputLabel>
                            <Select
                                value={selectors.getHistoryOption(state)}
                                onChange={handleHistoryOptionChange}
                            >
                                {HISTORY_OPTIONS.map((item) => {
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
                <MhzChartCard
                    css={styles.card}
                    seriesData={selectors.getSeriesData(state)}
                    loading={selectors.isPendingGetMhzDocs(state)}
                />
                <NumericCard css={styles.card} value={selectors.getLastMhzDocCo2(state)} unit="CO2" />
                <NumericCard css={styles.card} value={selectors.getLastMhzDocTemp(state)} unit="°C" desc="MHZ19 Temperature" />
                {selectors.getZigbeeDevicesSortedByType(state).map(({
                    model, friendly_name, lastSeen
                }) => {
                    const topic = `zigbee2mqtt/${friendly_name}`;
                    if (model === ZIGBEE_DEVICE_MODEL_LUMI_WATER_LEAK) {
                        return (
                            <LeakageSensorCard
                                key={friendly_name}
                                css={styles.card}
                                lastSeen={lastSeen}
                                deviceMessage={latestMessages[topic] as IAqaraWaterSensorMessage}
                            />
                        );
                    }
                    if (model === ZIGBEE_DEVICE_MODEL_LUMI_POWER_PLUG) {
                        return (
                            <NumericCard
                                key={friendly_name}
                                css={styles.card}
                                value={(latestMessages[topic] as IAqaraPowerPlugMessage)?.power}
                                unit="W"
                                desc="Heater Consumption"
                            />
                        );
                    }
                    return null;
                })}
            </div>
            {state.error}
        </div>
    );

}

export default hot(module)(Root);
