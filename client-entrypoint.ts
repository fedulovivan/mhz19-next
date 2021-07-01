import React from 'react';
import ReactDOM from 'react-dom';

import Root from 'src/components/Root';

const component = React.createElement(Root);

ReactDOM.render(
    component,
    document.getElementById('root')
);
