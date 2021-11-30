/**
 * Http server
 */

import config from 'config';
import Debug from 'debug';
import Express from 'express';
import http from 'http';

import graphqlApiMiddleware from 'src/api/graphql';
import restApiMiddleware from 'src/api/rest';
import {
    APP_HOST,
    DIST_FS_PATH,
    GRAPHQL_URI,
    IMAGES_FS_PATH,
    IMAGES_URI,
} from 'src/constants';

const debug = Debug('mhz19-http');

const app = Express();
const httpServer = new http.Server(app);

app.use(Express.static(DIST_FS_PATH));
app.use(IMAGES_URI, Express.static(IMAGES_FS_PATH));
app.use(Express.json());
app.use(restApiMiddleware);
app.use(GRAPHQL_URI, graphqlApiMiddleware);

const { port: appPort } = config.app;

httpServer.listen(appPort, () => {
    debug(`listening on ${APP_HOST}:${appPort}`);
    const browserLink = `http://${APP_HOST}:${appPort}/`;
    debug(`open browser at ${browserLink}`);
});

export default httpServer;
