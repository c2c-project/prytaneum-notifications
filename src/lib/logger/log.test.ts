/* eslint-disable no-console */
import { _test as TestEnv } from 'config/env';
import { _test as TestLog } from './log';

const { Log } = TestLog;
const { env } = TestEnv;

let cachedEnv: 'test' | 'development' | 'production' | undefined;
beforeAll(function () {
    cachedEnv = env.NODE_ENV;
});

afterAll(function () {
    env.NODE_ENV = cachedEnv;
});

describe('Log', function () {
    it('should use console in dev env', () => {
        env.NODE_ENV = 'development';
        const dLog = Log();
        expect(dLog.info).toStrictEqual(console.log);
        expect(dLog.err).toStrictEqual(console.error);
        expect(dLog.print).toStrictEqual(console.log);
        expect(dLog.warn).toStrictEqual(console.warn);
    });
    it('should use nothing in prod', () => {
        env.NODE_ENV = 'production';
        const pLog = Log();
        expect(pLog.info('') === undefined).toStrictEqual(true);
        expect(pLog.err('') === undefined).toStrictEqual(true);
        expect(pLog.print('') === undefined).toStrictEqual(true);
    });

    it('should default to development', () => {
        env.NODE_ENV = undefined;
        const dLog = Log();
        // console.log(dLog);
        expect(dLog.info).toStrictEqual(console.log);
        expect(dLog.err).toStrictEqual(console.error);
        expect(dLog.print).toStrictEqual(console.log);
        expect(dLog.warn).toStrictEqual(console.warn);
    });
});
