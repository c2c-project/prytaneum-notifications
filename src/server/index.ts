import app from 'app';
import connect from 'db/connect';
import env from 'config/env';

// eslint-disable-next-line no-void
void connect();

app.listen(Number(env.PORT), env.ORIGIN);
