import { css } from '@emotion/core';

import { contentOverlay } from '../styles';

export const loading = css`
    position: relative;
    ${contentOverlay('Loading...')}
`;
