import React, { useCallback } from 'react';

import { gql, useQuery } from '@apollo/client';
import { css, cx } from '@emotion/css';
import { green, red } from '@material-ui/core/colors';
import Paper from '@material-ui/core/Paper';
import first from 'lodash/first';
import sortBy from 'lodash/sortBy';

import { toggleValves } from 'src/actions';
import LastSeenBar from 'src/components/LastSeenBar';
import ValveButton from 'src/components/ValveButton';

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
    .lastSeenBar {
        grid-column: 1/3;
    }
`;

const ValveButtons: React.FC<{
    valvesStateMessages: Array<IValveStateMessage>;
    className?: string;
}> = ({
    valvesStateMessages,
    className
}): JSX.Element => {
    const handleOpen = useCallback(() => toggleValves('open'), []);
    const handleClose = useCallback(() => toggleValves('close'), []);
    const { loading, error, data } = useQuery(gql`
        {
            valveStatusMessages {
                timestamp
                tick
                leakage
                valve
            }
        }
    `);
    if (loading) return <>Loading...</>;
    if (error) return <>{error.message}</>;
    const lastStatusMessage = first(data.valveStatusMessages);
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
                sortedMessages={data.valveStatusMessages}
                label="Last seen history"
            />
            {JSON.stringify(lastStatusMessage)}
        </Paper>
    );
};

ValveButtons.displayName = 'ValveButtons';

export default ValveButtons;
