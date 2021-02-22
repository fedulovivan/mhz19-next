import React from 'react';
import ReactDOM from 'react-dom';

import Root2 from 'src/components/Root2/Root2';

// import Root from 'src/components/Root/Root';

const component = React.createElement(Root2);

ReactDOM.render(
    component,
    document.getElementById('root')
);
