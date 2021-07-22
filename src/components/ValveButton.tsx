import React, { useCallback, useState } from 'react';

import { css } from '@emotion/css';
import { grey } from '@material-ui/core/colors';

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
        if (onClick) onClick(e);
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

export default ValveButton;
