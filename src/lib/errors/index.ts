/* eslint-disable */
import { Response, Request, NextFunction } from 'express';

import env from 'config/env';
import ClientError from './client';
import Log from '../logger/log';

export { default as ClientError } from './client';
/**
 * @arg err the error to handle
 * @arg res the response object
 * @arg cb optional callback
 * generic error handler -- easy to decorate
 * NOTE: sends the response
 */
export const errorHandler = (
    err: Error & { status: number },
    req: Request<any>,
    res: Response<any>,
    next: NextFunction
): void => {
    if (err instanceof ClientError) {
        res.statusMessage = err.message;
        const { NODE_ENV } = env;
        // TODO: log internal error here

        if (NODE_ENV === 'development' || NODE_ENV === 'test') {
            Log.err(`Client Message: ${err.message}`);
            Log.err(`Server Message: ${err.internalError}`);
        }

        res.status(400).send();
    } else {
        // TODO: proper logging here
        // if there is no status attached, then an internal error occured, hence 500
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const status = err.status || 500;
        res.status(status).send();
        // console.error(err);
    }
};
