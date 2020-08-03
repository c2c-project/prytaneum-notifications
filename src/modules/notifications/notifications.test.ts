import Notify from './notificaitons';

const subList = ['test@example.com'];
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
