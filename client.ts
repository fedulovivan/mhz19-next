/**
 * TODOs:
 * - why cssinjs? https://medium.com/jobsity/css-in-javascript-with-jss-and-react-54cdd2720222
 * - choosing cssinjs implementation - https://github.com/streamich/freestyler/blob/master/docs/en/generations.md
 */

import ReactDOM from 'react-dom';
import React from 'react';
import Root from './Root/Root';

const component = React.createElement(Root);

ReactDOM.render(
    component,
    document.getElementById('root')
);

// import { renderToString } from 'react-dom/server';
// console.log(renderToString(component));