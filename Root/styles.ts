import { css } from '@emotion/core';

export const base = css`
    display: grid;
`;

export const cards = css`
    ${base};
    grid-auto-flow: column;
    grid-column-gap: 24px;
    justify-content: start;
`;

export const card = css`
    ${base};
`;

export const options = css`
    min-width: 150px;
`;
