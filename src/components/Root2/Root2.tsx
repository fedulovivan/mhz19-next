/**
 * Main Component
 */

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { css } from '@emotion/css';
import {
  green,
  grey,
  red,
} from '@material-ui/core/colors';
import axios from 'axios';
import moment from 'moment';
import { hot } from 'react-hot-loader';

const ValveButton: React.FC<{
    onClick: React.DOMAttributes<HTMLButtonElement>['onClick'];
    color: string;
    autoDisableFor: number;
}> = ({
    children,
    onClick,
    color,
    autoDisableFor,
}) => {
    const [timer, setTimer] = useState(0);
    const loading = timer > 0;
    const styling = css`
        color: ${loading ? null : 'white'};
        background-color: ${loading ? grey[200] : color};
        border: 0;
        border-radius: 5px;
        height: 40px;
    `;
    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        let innerTimer = autoDisableFor;
        setTimer(innerTimer);
        const intervalId = setInterval(() => {
            innerTimer -= 1000;
            setTimer(innerTimer);
            if (innerTimer <= 0) clearInterval(intervalId);
        }, 1000);
    }, [autoDisableFor, onClick]);
    return (
        <button
            type="button"
            disabled={loading}
            className={styling}
            onClick={handleClick}
        >
            {loading ? `Wait ${timer / 1000} seconds` : children}
        </button>
    );
};

const handler = (state: 'on' | 'off') => {
    axios.put(`/valve-state/${state}`);
};

const Root2: React.FC = () => {

    // state
    const [lastState, setLastState] = useState<{ data: string; timestamp: number }>();

    // on/off handler
    const handleOpen = useCallback(() => handler('off'), []);
    const handleClose = useCallback(() => handler('on'), []);

    // periodically fetch last state
    useEffect(() => {
        const fetchOnce = () => {
            axios.get('/valve-state/get-last').then(({ data }) => setLastState(data?.[0]));
        };
        fetchOnce();
        const intervalId = setInterval(fetchOnce, 10000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div>
            Hello from mhz19-next!
            <br />
            Water valves&nbsp;
            {
                lastState
                    ? (
                        <>
                            last seen <b>{moment(lastState?.timestamp).fromNow()}</b>,
                            last message: {lastState?.data}
                        </>
                    )
                    : '<no info>'
            }
            <div
                className={css`
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-column-gap: 18px;
                `}
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
        </div>
    );

};

export default hot(module)(Root2);
