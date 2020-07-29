import app from 'app';
import { connect } from 'db';
import env from 'config/env';
import Net from 'lib/net/net';
import Rabbitmq from 'lib/rabbitmq';
import log from '../lib/net/log';

async function makeServer() {
    try {
        /*
            Sets up the retry functions that should auto-restart 
        */
        log.initStatus(['rabbitmq']);
        const netOptions = { key: 'rabbitmq' };
        const rabbitmqConnect = Net.buildRetryFn(Rabbitmq.connect, netOptions);
        await rabbitmqConnect();
        /* 
            this is so that we can guarantee we are connected to the db
            before the server exposes itself on a port
        */
        await connect();
        app.listen(Number(env.PORT), env.ORIGIN);
        console.log(`http://${env.ORIGIN}:${env.PORT}`);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        // eslint-disable-next-line no-console
        console.log('Exiting...');
    }
}

// eslint-disable-next-line no-void
void makeServer();
