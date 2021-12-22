import React, { useCallback, useEffect } from 'react';

import { gql, useQuery } from '@apollo/client';
import { css, cx } from '@emotion/css';
import { green, red } from '@material-ui/core/colors';
import Paper from '@material-ui/core/Paper';
import first from 'lodash/first';
import moment from 'moment';

import { toggleValves } from 'src/actions';
import LastSeenBar from 'src/components/LastSeenBar';
import Meter from 'src/components/Meter';
import ValveButton from 'src/components/ValveButton';
import { QUERY_OPTIONS } from 'src/constants';
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
    const handleOpen = useCallback(() => toggleValves('open'), []);
    const handleClose = useCallback(() => toggleValves('close'), []);

    // effects
    useEffect(() => () => stopPolling(), [stopPolling]);

    // derived
    const lastStatusMessage: any = first(data?.valveStatusMessages);

    return (
        <Paper
            className={cx(className, rootStyles)}
        >
            <ValveButton
                color={red[600]}
                onClick={handleClose}
                autoDisableFor={20 * 1000}
                className="leftBtn"
            >
                CLOSE valves
            </ValveButton>
            <ValveButton
                color={green[600]}
                onClick={handleOpen}
                autoDisableFor={5 * 1000}
                className="rightBtn"
            >
                OPEN valves
            </ValveButton>
            <LastSeenBar
                className="lastSeenBar"
                sortedMessages={data?.valveStatusMessages}
                label="Last seen history"
            />
            <div className="stats">
                Valves state: {
                    lastStatusMessage?.valve === 'closed'
                        ? <span style={{ color: 'red' }}>Closed</span>
                        : <span style={{ color: 'green' }}>Opened</span>
                },&nbsp;
                leakage detected: {
                    lastStatusMessage?.leakage
                        ? <span style={{ color: 'red' }}>Yes</span>
                        : <span style={{ color: 'green' }}>No</span>
                },&nbsp;
                seen {moment(lastStatusMessage?.timestamp).fromNow()},&nbsp;
                {data?.valveStatusMessages?.length} messages loaded.
            </div>
            <div className="meters">
                <div className="group-name">
                    Toilet:
                </div>
                <Meter hot value={lastStatusMessage?.hotMeterTicks} />
                <Meter cold value={lastStatusMessage?.coldMeterTicks} />
            </div>
        </Paper>
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
