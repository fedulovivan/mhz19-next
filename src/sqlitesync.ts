import conn from './db';
import { withDebug } from './logger';

const debug = withDebug('sequelize-sync');

debug('starting sync');
conn.sync().then(() => debug('sync done')).catch(e => debug('sync failed', e));
