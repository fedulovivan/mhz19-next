/**
 * Http server
 */

// import config from 'config';
import Debug from 'debug';
import Express from 'express';
import http from 'http';

import {
    APP_HOST,
    DIST_FS_PATH,
    GRAPHQL_URI,
    IMAGES_FS_PATH,
    IMAGES_URI,
} from 'lib/constants';

// import graphqlServer from './api/graphql';
import restApiMiddleware from './api/rest';

const debug = Debug('mhz19-http');

const app = Express();
const httpServer = new http.Server(app);
// const { port: appPort } = config.app;
const appPort = process.env.APP_PORT;

app.use(Express.static(DIST_FS_PATH));
app.use(IMAGES_URI, Express.static(IMAGES_FS_PATH));
app.use(Express.json());
app.use(restApiMiddleware);

// graphqlServer.start().then(() => {
//     graphqlServer.applyMiddleware({ app, path: GRAPHQL_URI });
// });

httpServer.listen(appPort, () => {
    debug(`listening on ${APP_HOST}:${appPort}`);
    const browserLink = `http://${APP_HOST}:${appPort}/`;
    debug(`open browser at ${browserLink}`);
});

export default httpServer;
