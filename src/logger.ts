import Debug from 'debug';
import SimpleNodeLogger, { AbstractAppender } from 'simple-node-logger';

import { DEBUG_TAG_PREFIX } from 'src/constants';

const logger = SimpleNodeLogger.createSimpleLogger({ level: 'debug' });
logger.getAppenders()[0].formatEntry = function(entry) {
    return [
        this.formatLevel(entry.level),
        this.formatMessage(entry.msg)
    ];
};

export function withDebug(namespace: string) {
    const debug = Debug(`${DEBUG_TAG_PREFIX}${namespace}`);
    return (first: any, ...args: any[]): void => {
        debug(first, ...args);
        // logger.debug(first, ...args);
    };
}

export default logger;
