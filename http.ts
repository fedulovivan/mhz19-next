/**
 * Http server
 */

import Express from 'express';
import http from 'http';
import restApi from './rest-api';
import Debug from 'debug';

import {
    DIST_PATH,
    IMAGES_PATH,
    APP_HOST,
    APP_PORT,
} from './constants';

const debug = Debug('mhz19-http');

const express = Express();
const httpServer = new http.Server(express);

express.use(Express.static(DIST_PATH));
express.use('/images', Express.static(IMAGES_PATH));

express.use(restApi);

httpServer.listen(APP_PORT, () => {
    debug(`listening on ${APP_HOST}:${APP_PORT}`)
    const browserLink = `http://${APP_HOST}:${APP_PORT}/`;
    debug(`open browser at ${browserLink}`)
});

export default httpServer;
