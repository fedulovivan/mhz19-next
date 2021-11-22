import React, { useCallback } from 'react';

import { css, cx } from '@emotion/css';
import { green, red } from '@material-ui/core/colors';
import Paper from '@material-ui/core/Paper';
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
}) => {
    const handleOpen = useCallback(() => toggleValves('off'), []);
    const handleClose = useCallback(() => toggleValves('on'), []);
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
                sortedMessages={valvesStateMessages}
                label="Last seen history"
            />
        </Paper>
    );
};

ValveButtons.displayName = 'ValveButtons';

export default ValveButtons;
