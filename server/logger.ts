import Debug from 'debug';
import SimpleNodeLogger from 'simple-node-logger';

// @ts-ignore
const log = SimpleNodeLogger.createSimpleFileLogger({
    logFilePath: 'main.log',
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS',
    level: 'DEBUG',
});

export function withDebug(namespace: string) {
    const debug = Debug(namespace);
    return (first: any, ...args: any[]): void => {
        debug(first, ...args);
        log.debug(first, ...args);
    };
}

export default log;
