/**
 * Http server
 */

import config from 'config';
import Debug from 'debug';
import Express from 'express';
import http from 'http';

import {
    APP_HOST,
    DIST_PATH,
    IMAGES_PATH,
} from 'src/constants';
import restAPI from 'src/restAPI';

const debug = Debug('mhz19-http');

const app = Express();
const httpServer = new http.Server(app);

app.use(Express.static(DIST_PATH));
app.use('/images', Express.static(IMAGES_PATH));
app.use(Express.json());

app.use(restAPI);

const { port: appPort } = config.app;

httpServer.listen(appPort, () => {
    debug(`listening on ${APP_HOST}:${appPort}`);
    const browserLink = `http://${APP_HOST}:${appPort}/`;
    debug(`open browser at ${browserLink}`);
});

export default httpServer;
