import Express from 'express';
import http from 'http';

import { GRAPHQL_URI } from 'lib/constants';

import graphqlServer from 'src/api/graphql';
import restApiMiddleware from 'src/api/rest';
import { withCategory } from 'src/logger';

const log = withCategory('mhz19-http');

const app = Express();
const httpServer = new http.Server(app);
const apiPort = process.env.API_PORT;

// after refactoring, server app is no more responsible for client-side static files
// log.debug(DIST_FS_PATH);
// app.use(Express.static(DIST_FS_PATH));
// app.use(IMAGES_URI, Express.static(IMAGES_FS_PATH));

app.use(Express.json());
app.use(restApiMiddleware);

graphqlServer.start().then(() => {
    graphqlServer.applyMiddleware({ app, path: GRAPHQL_URI });
});

httpServer.listen(apiPort, () => {
    log.debug(`listening on ${apiPort}`);
});

export default httpServer;
