import Debug, { Debugger } from 'debug';
//  @ts-ignore
import SimpleNodeLogger from 'simple-node-logger';

import { DEBUG_TAG_PREFIX } from 'src/constants';

const log = SimpleNodeLogger.createSimpleFileLogger({
    logFilePath: 'main.log',
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS',
    level: 'DEBUG',
});

export function withDebug(namespace: string) {
    const debug = Debug(`${DEBUG_TAG_PREFIX}${namespace}`);
    return (first: any, ...args: any[]): void => {
        debug(first, ...args);
        log.debug(first, ...args);
    };
}

export default log;
