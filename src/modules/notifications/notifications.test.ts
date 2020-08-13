import faker from 'faker';
import Notify from './notifications';

const subList = [faker.internet.email()];
const deliveryTime = new Date();

describe('Notifications Module', () => {
    describe('notifyMany', () => {
        it('should accept valid data', async () => {
            const results = await Notify.notifyMany(subList, deliveryTime);
            expect(results).toBeDefined();
            expect(results).toStrictEqual(['success']);
        });
        it('should throw an error with empty list', async () => {
            await expect(
                Notify.notifyMany([], deliveryTime)
            ).rejects.toThrowError();
        });
    });
});
