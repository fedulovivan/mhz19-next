import { css } from '@emotion/core';

export const base = css`
    display: grid;
`;

export const cards = css`
    ${base};
    grid-template-columns: repeat(4, 1fr);
    grid-column-gap: 24px;
    grid-row-gap: 24px;
    justify-content: start;
`;

export const card = css`
    ${base};
`;

export const options = css`
    min-width: 150px;
`;
