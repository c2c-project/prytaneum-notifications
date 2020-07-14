/* eslint-disable no-console */
import env from 'config/env';

/**
 * @description Logger type return description
 * @typedef {Object} Logger
 * @property {function} info prints info to the log
 * @property {function} err prints info to the error log
 * @property {function} print DEVELOPMENT ONLY prints info the console
 */
interface Logger {
    info: (msg: string) => void;
    err: (msg: string) => void;
    print: (msg: string) => void;
    warn: (msg: string) => void;
}

/**
 * @returns {Log} functions accesssing the logger
 */
function Log(): Logger {
    const { NODE_ENV } = env;
    const emptyLogger: Logger = {
        info: () => {},
        err: () => {},
        print: () => {},
        warn: () => {},
    };
    const consoleLogger: Logger = {
        info: console.log,
        err: console.error,
        print: console.log,
        warn: console.warn,
    };
    switch (NODE_ENV) {
        case 'production':
            return emptyLogger;
        case 'development':
            return consoleLogger;
        case 'test':
            return emptyLogger;
        default:
            return consoleLogger;
    }
}

export default Log();

export const _test = {
    Log,
};
