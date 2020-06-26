import app from 'app';
import connect from 'db/connect';
import env from 'config/env';

async function makeServer() {
    try {
        /* 
            this is so that we can guarantee we are connected to the db
            before the server exposes itself on a port
        */
        await connect();
        app.listen(Number(env.PORT), env.ORIGIN);
        console.log(`http://${env.ORIGIN}:${env.PORT}`)
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        // eslint-disable-next-line no-console
        console.log('Exiting...');
    }
}

// eslint-disable-next-line no-void
void makeServer();
