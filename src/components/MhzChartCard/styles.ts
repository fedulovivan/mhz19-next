import { css } from '@emotion/core';

import { contentOverlay } from 'src/emotion/common';

export const loading = css`
    position: relative;
    ${contentOverlay('Loading...')}
`;
