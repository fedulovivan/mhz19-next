import SimpleNodeLogger from 'simple-node-logger';

const log = SimpleNodeLogger.createSimpleFileLogger({
    logFilePath: 'main.log',
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS',
});

export default log;
