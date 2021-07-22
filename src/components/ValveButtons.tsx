import React, { useCallback } from 'react';

import { css } from '@emotion/css';
import { green, red } from '@material-ui/core/colors';

import { toggleValves } from 'src/actions';
import ValveButton from 'src/components/ValveButton';

const rootStyles = css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 18px;
    margin-bottom: 20px;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
`;

const ValveButtons: React.FC<{
}> = () => {
    const handleOpen = useCallback(() => toggleValves('off'), []);
    const handleClose = useCallback(() => toggleValves('on'), []);
    return (
        <div
            className={rootStyles}
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
    );
};

export default ValveButtons;
