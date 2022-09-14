import React, { useCallback, useEffect } from 'react';

import { gql, useQuery } from '@apollo/client';
import { css, cx } from '@emotion/css';
import { green, red } from '@material-ui/core/colors';
import Paper from '@material-ui/core/Paper';
import filter from 'lodash/filter';
import first from 'lodash/first';
import moment from 'moment';

import { toggleValves } from 'src/actions';
import LastSeenBar from 'src/components/LastSeenBar';
import Meter from 'src/components/Meter';
import ValveButton from 'src/components/ValveButton';
import {
    KITCHEN_VALVES_MANIPULATOR,
    QUERY_OPTIONS,
    TOILET_VALVES_MANIPULATOR,
} from 'src/constants';
import * as queries from 'src/queries';

const rootStyles = css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 18px;
    margin-bottom: 20px;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    padding: 12px;
    .leftBtn {
        grid-column: 1/2;
    }
    .rightBtn {
        grid-column: 2/3;
    }
    .stats,
    .lastSeenBar {
        grid-column: 1/3;
    }
    .meters {
        font-size: 18px;
        display: flex;
        column-gap: 24px;
        align-items: center;
    }
    &.withError {
        color: red;
    }
`;

const ValveButtons: React.FC<{
    historyWindowSize?: number;
    className?: string;
}> = ({
    className,
    historyWindowSize,
}): JSX.Element => {

    // graphql
    const {
        loading,
        error,
        data,
        startPolling,
        stopPolling
    } = useQuery(
        queries.GET_VALVE_STATUS_MESSAGES, {
            // pollInterval: 5000,
            variables: {
                historyWindowSize,
            },
            ...QUERY_OPTIONS,
        }
    );

    // handlers
    const handleKitchenOpen = useCallback(() => toggleValves(KITCHEN_VALVES_MANIPULATOR, 'open'), []);
    const handleKitchenClose = useCallback(() => toggleValves(KITCHEN_VALVES_MANIPULATOR, 'close'), []);
    const handleToiletOpen = useCallback(() => toggleValves(TOILET_VALVES_MANIPULATOR, 'open'), []);
    const handleToiletClose = useCallback(() => toggleValves(TOILET_VALVES_MANIPULATOR, 'close'), []);

    // effects
    useEffect(() => () => stopPolling(), [stopPolling]);

    // derived
    const valveStatusMessagesKitchen = filter(
        data?.valveStatusMessages, ({ chipid }) => chipid === KITCHEN_VALVES_MANIPULATOR
    );
    const valveStatusMessagesToilet = filter(
        data?.valveStatusMessages, ({ chipid }) => chipid === TOILET_VALVES_MANIPULATOR
    );
    const lastStatusMessageKitchen: any = first(valveStatusMessagesKitchen);
    const lastStatusMessageToilet: any = first(valveStatusMessagesToilet);

    return (
        <>
            <Paper
                className={cx(className, rootStyles)}
            >
                <ValveButton
                    color={red[600]}
                    onClick={handleKitchenClose}
                    autoDisableFor={20 * 1000}
                    className="leftBtn"
                >
                    CLOSE kitchen valves
                </ValveButton>
                <ValveButton
                    color={green[600]}
                    onClick={handleKitchenOpen}
                    autoDisableFor={5 * 1000}
                    className="rightBtn"
                >
                    OPEN kitchen valves
                </ValveButton>
                <LastSeenBar
                    className="lastSeenBar"
                    sortedMessages={valveStatusMessagesKitchen}
                    label="Last seen history"
                />
                <div className="stats">
                    Valves state: {
                        lastStatusMessageKitchen?.valve === 'closed'
                            ? <span style={{ color: 'red' }}>Closed</span>
                            : <span style={{ color: 'green' }}>Opened</span>
                    },&nbsp;
                    leakage detected: {
                        lastStatusMessageKitchen?.leakage
                            ? <span style={{ color: 'red' }}>Yes</span>
                            : <span style={{ color: 'green' }}>No</span>
                    },&nbsp;
                    seen {moment(lastStatusMessageKitchen?.timestamp).fromNow()},&nbsp;
                    {valveStatusMessagesKitchen.length} messages loaded.
                </div>
                <div className="meters">
                    <div className="group-name">
                        Kitchen:
                    </div>
                    <Meter hot value={lastStatusMessageKitchen?.hotMeterTicks} />
                    <Meter cold value={lastStatusMessageKitchen?.coldMeterTicks} />
                </div>
            </Paper>
            <Paper
                className={cx(className, rootStyles)}
            >
                <ValveButton
                    color={red[600]}
                    onClick={handleToiletClose}
                    autoDisableFor={20 * 1000}
                    className="leftBtn"
                >
                    CLOSE toilet valves
                </ValveButton>
                <ValveButton
                    color={green[600]}
                    onClick={handleToiletOpen}
                    autoDisableFor={5 * 1000}
                    className="rightBtn"
                >
                    OPEN toilet valves
                </ValveButton>
                <LastSeenBar
                    className="lastSeenBar"
                    sortedMessages={valveStatusMessagesToilet}
                    label="Last seen history"
                />
                <div className="stats">
                    Valves state: {
                        lastStatusMessageToilet?.valve === 'closed'
                            ? <span style={{ color: 'red' }}>Closed</span>
                            : <span style={{ color: 'green' }}>Opened</span>
                    },&nbsp;
                    leakage detected: {
                        lastStatusMessageToilet?.leakage
                            ? <span style={{ color: 'red' }}>Yes</span>
                            : <span style={{ color: 'green' }}>No</span>
                    },&nbsp;
                    seen {moment(lastStatusMessageToilet?.timestamp).fromNow()},&nbsp;
                    {valveStatusMessagesToilet.length} messages loaded.
                </div>
                <div className="meters">
                    <div className="group-name">
                        Toilet:
                    </div>
                    <Meter hot value={lastStatusMessageToilet?.hotMeterTicks} />
                    <Meter cold value={lastStatusMessageToilet?.coldMeterTicks} />
                </div>
            </Paper>
        </>
    );
};

ValveButtons.displayName = 'ValveButtons';

export default ValveButtons;

// useEffect(() => {
//     startPolling(5000);
//     return () => {
//         stopPolling();
//     };
// }, [startPolling, stopPolling]);
