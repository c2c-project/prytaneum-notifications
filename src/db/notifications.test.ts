import Notifications from './notifications';
import Mongo from './mongo';

beforeAll(async () => {
    await Mongo.init();
    await Notifications.init();
});

afterAll(async () => {
    await Mongo.close();
});

describe('notification collection tests', () => {
    it('init should fail since it has already been called', async () => {
        expect(Notifications.isInitialized()).toStrictEqual(true);
        await Notifications.init();
    });
});
