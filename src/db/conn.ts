import { Sequelize } from 'sequelize';

import { withDebug } from 'src/logger';

const debug = withDebug('db-next');

const DB_FILENAME = 'database.bin';

const conn = new Sequelize({
    dialect: 'sqlite',
    storage: `./${DB_FILENAME}`,
    logging: (query) => debug(query),
});

export default conn;
