const babelRegister = require('@babel/register');
const babelServerConfig = require('./.babelrc.server');

babelRegister(babelServerConfig);
require('./server');
