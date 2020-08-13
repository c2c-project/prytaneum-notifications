import scheule from 'node-schedule';
import app from 'app';
import { connect } from 'db';
import env from 'config/env';
import Net from 'lib/net/net';
import Rabbitmq from 'lib/rabbitmq';
import log from '../lib/net/log';
import logger from '../lib/logger';
import notificationConsumer from '../lib/jobs/notifications';

async function makeServer() {
    try {
        /*
            Sets up the retry functions that should auto-restart 
        */
        log.initStatus(['rabbitmq']);
        // RabbitMQ
        const rabbitmqConnect = Net.buildRetryFn(Rabbitmq.connect, {
            key: 'rabbitmq',
        });
        await rabbitmqConnect();
        // Start notification Consumer
        const notificationJob = scheule.scheduleJob(
            '0 */30 * * * *', // Every 30 minuites
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            async () => {
                await notificationConsumer();
            }
        );
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
