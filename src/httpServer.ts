import Express from 'express';
import http from 'http';

import restApiMiddleware from 'src/api/rest';
import {
    APP_HOST,
    DIST_FS_PATH,
    IMAGES_FS_PATH,
    IMAGES_URI,
} from 'src/constants';
import { withDebug } from 'src/logger';
import { getAppPort } from 'src/utils';

const debug = withDebug('http-server');

const app = Express();
const httpServer = new http.Server(app);

app.use(Express.static(DIST_FS_PATH));
app.use(IMAGES_URI, Express.static(IMAGES_FS_PATH));
app.use(Express.json());
app.use(restApiMiddleware);

const appPort = getAppPort();

httpServer.listen(appPort, () => {
    debug(`listening on ${APP_HOST}:${appPort}`);
    const browserLink = `http://${APP_HOST}:${appPort}/`;
    debug(`open browser at ${browserLink}`);
});

export default httpServer;
