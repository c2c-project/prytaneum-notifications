import request from 'supertest';

import { _test as EnvTest } from 'config/env';
import { connect, close } from 'db';
import app, { _test as AppTest } from './app';

const { env } = EnvTest;

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await close();
});

describe('App', function () {
    it('should respond with 200', async () => {
        const { status } = await request(app).get('/');
        expect(status).toStrictEqual(200);
    });
    it('should respond with 404', async () => {
        const { status } = await request(app).patch('/bogus-route');
        expect(status).toStrictEqual(404);
    });
    it('should respond with a 404 in prod', async () => {
        const cachedEnv = env.NODE_ENV;
        env.NODE_ENV = 'production';
        const testApp = AppTest.initApp();
        const { status } = await request(testApp).get('/');
        expect(status).toStrictEqual(404);
        env.NODE_ENV = cachedEnv;
    });
});
