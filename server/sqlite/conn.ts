import { Sequelize } from 'sequelize';

import { withCategory } from '../logger';

const log = withCategory('mhz19-sqlite');

const DB_FILENAME = 'database-next.bin';

const conn = new Sequelize({
    dialect: 'sqlite',
    storage: `./${DB_FILENAME}`,
    logging: sql => log.debug(sql),
});

export default conn;
