import app from 'app';
import { connect } from 'db';
import env from 'config/env';
import logger from '../lib/logger';
import notificationConsumer from '../lib/jobs/notifications';

const MS_TO_SEC = 1000;
const SEC_TO_MIN = 60;
const NOTIFICATION_INTERVAL = MS_TO_SEC * SEC_TO_MIN * 1; // 20 min

async function makeServer() {
    try {
        // Start notification Consumer
        setInterval(() => {
            notificationConsumer();
        }, NOTIFICATION_INTERVAL);
        /* 
            this is so that we can guarantee we are connected to the db
            before the server exposes itself on a port
        */
        await connect();
        app.listen(Number(env.PORT), env.ORIGIN);
        logger.print(`http://${env.ORIGIN}:${env.PORT}`);
    } catch (e) {
        logger.err(e);
        logger.print('Exiting...');
    }
}

// eslint-disable-next-line no-void
void makeServer();
