/* eslint-disable no-console */
import { set } from './env';

describe('env', () => {
    describe('#set', () => {
        it('should fail', () => {
            expect(() => set('FAKE_ENV_KEY')).toThrow();
        });
        it('should warn if using default', () => {
            // spy
            const spy = jest
                .spyOn(console, 'warn')
                .mockImplementation(() => {}); // so we don't actually print the warning

            // cache & delete
            const cache = process.env.DB_URL;
            delete process.env.DB_URL;

            // test
            set('DB_URL');
            expect(spy).toHaveBeenCalled();

            // restore
            jest.restoreAllMocks();
            process.env.DB_URL = cache;
        });
    });
});
