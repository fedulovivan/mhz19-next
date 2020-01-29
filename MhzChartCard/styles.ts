import { css } from '@emotion/core';

import { contentOverlay } from 'app/styles';

export const loading = css`
    position: relative;
    ${contentOverlay('Loading...')}
`;
