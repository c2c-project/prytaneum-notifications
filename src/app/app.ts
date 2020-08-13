import express, { Express } from 'express';
import createError from 'http-errors';
import config from 'config/app';
import env from 'config/env';
import routes from 'routes';
import { errorHandler } from 'lib/errors';

function initApp(): Express {
    const app = express();
    config(app);
    if (env.NODE_ENV === 'test') {
        app.get('/', (req, res) => res.sendStatus(200));
    }
    app.use(routes);
    app.use((req, res, next) => {
        next(createError(404));
    });
    app.use(errorHandler);
    return app;
}

export default initApp();

// eslint-disable-next-line @typescript-eslint/naming-convention
export const _test = {
    initApp,
};
