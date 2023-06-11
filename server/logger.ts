import Debug from 'debug';
import SimpleLogger, { STANDARD_LEVELS } from 'simple-node-logger';

const manager = new SimpleLogger();
manager.createConsoleAppender({
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
});

export function withCategory(category: string) {
    const logger = manager.createLogger(
        `[${category}]`,
        process.env.LOG_LEVEL as STANDARD_LEVELS
    );
    const levels: Array<STANDARD_LEVELS> = [
        'all',
        'trace',
        'debug',
        'info',
        'warn',
        'error',
        'fatal',
    ]
    levels.forEach(level => {
        const originalMethod = logger[level];
        const level2 = `[${level.toUpperCase()}]`;
        logger[level] = (first, ...args) => {
            // inject call of 'debug' module, see https://www.npmjs.com/package/debug
            Debug(category)(level2, first, ...args);
            // call original function
            return originalMethod(first, ...args);
        };
    });
    return logger;
}
