import React from 'react';

import { createRoot } from 'react-dom/client';

import Root2 from './components/Root2';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(React.createElement(Root2));

