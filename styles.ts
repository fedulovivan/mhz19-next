import { css } from '@emotion/core';

export const contentOverlay = (content: string) => css`
    &:after {
        content: '${content}';
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: grey;
        opacity: .5;
        z-index: 1;
    }
`;
