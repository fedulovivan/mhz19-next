import { css } from '@emotion/core';
import red from '@material-ui/core/colors/red';

export const nowrap = css`
    white-space: nowrap;
    text-overflow: ellipsis;
    min-width: 0;
`;

export const warn = css`
    background-color: ${red[600]};
    color: white;
`;

export const root = css`
    display: grid;
    /* width: 120px;
    max-width: 120px; */
    grid-auto-flow: row;
    grid-row-gap: 12px;
    justify-items: center;
    img {
        width: 50%;
    }
`;
