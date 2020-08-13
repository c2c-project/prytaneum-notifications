/* eslint-disable no-console */
import log from './log';

const MAX_RETRY_COUNT = 5;
const INTERVAL_SECONDS = 5;

export interface RetryOptions {
    onFailedTry?: (e: Error) => Promise<void>;
    maxRetryCount?: number;
    intervalSeconds?: number;
    key: string;
}

const runningTable: { [index: string]: Promise<unknown> } = {};

/**
 * @arg options.onFailedTry only use this if you need to execute logic per try, ex. logging
 */
export const retry = <T = unknown>(
    fn: () => Promise<T>,
    options: RetryOptions
): Promise<T> => {
    const { key } = options;
    if (runningTable[key] !== undefined) {
        return runningTable[key] as Promise<T>;
    }
    let _options = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onFailedTry: async (_e: Error) => {},
        maxRetryCount: MAX_RETRY_COUNT,
        intervalSeconds: INTERVAL_SECONDS,
    };

    if (options) {
        _options = { ..._options, ...options };
    }

    runningTable[key] = new Promise((resolve, reject) => {
        let count = 0;
        const checkPulse = () => {
            fn()
                .then((result) => {
                    resolve(result);
                    delete runningTable[key];
                })
                .catch(async (e) => {
                    count += 1;
                    if (count < _options.maxRetryCount) {
                        await _options.onFailedTry(e);
                        setTimeout(checkPulse, _options.intervalSeconds * 1000);
                    } else {
                        reject(e);
                    }
                    delete runningTable[key];
                });
        };
        checkPulse();
    });
    return runningTable[key] as Promise<T>;
};

/**
 * NOTE: this function is curried
 */
export const buildRetryFn = <T = unknown>(
    fn: () => Promise<T>,
    options: RetryOptions
) => async (): Promise<T> => {
    const { key } = options;
    try {
        const value = await retry<T>(fn, {
            // eslint-disable-next-line @typescript-eslint/require-await
            onFailedTry: async (e: Error) => {
                log.status(key, 'RETRYING');
                // eslint-disable-next-line no-void
                void options.onFailedTry?.(e);
            },
            key,
        });
        log.status(key, 'CONNECTED');
        return value;
    } catch (e) {
        log.status(key, 'FAILED');
        // be careful with this, throwing inside of a catch, I expect another catch that surrounds this
        throw e;
    }
};

export default {
    buildRetryFn,
    retry,
};
