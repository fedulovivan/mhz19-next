import Express from 'express';
import http from 'http';

import restApiMiddleware from 'src/api/rest';
import { APP_HOST } from 'src/constants';
import { withDebug } from 'src/logger';
import { getAppPort } from 'src/utils';

const debug = withDebug('http-server');

const app = Express();
const httpServer = new http.Server(app);

app.use(Express.json());
app.use(restApiMiddleware);

const appPort = getAppPort();

httpServer.listen(appPort, () => {
    debug(`listening on ${APP_HOST}:${appPort}`);
});

export default httpServer;
