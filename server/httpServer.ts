/**
 * Http server
 */

// import config from 'config';
import Express from 'express';
import http from 'http';

import { APP_HOST } from 'lib/constants';

// import graphqlServer from './api/graphql';
import restApiMiddleware from './api/rest';
import { withCategory } from './logger';

const log = withCategory('mhz19-http');

const app = Express();
const httpServer = new http.Server(app);
// const { port: appPort } = config.app;
const apiPort = process.env.API_PORT;

// after refactoring, server app is no more responsible for client-side static files
// log.debug(DIST_FS_PATH);
// app.use(Express.static(DIST_FS_PATH));
// app.use(IMAGES_URI, Express.static(IMAGES_FS_PATH));

app.use(Express.json());
app.use(restApiMiddleware);

// graphqlServer.start().then(() => {
//     graphqlServer.applyMiddleware({ app, path: GRAPHQL_URI });
// });

httpServer.listen(apiPort, () => {
    log.debug(`listening on ${APP_HOST}:${apiPort}`);
    // const browserLink = `http://${APP_HOST}:${appPort}/`;
    // log.debug(`open browser at ${browserLink}`);
});

export default httpServer;
