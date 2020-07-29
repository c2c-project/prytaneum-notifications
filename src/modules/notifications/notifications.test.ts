import Notify from './notificaitons';

const subList = ['test@example.com'];
const deliveryTime = new Date();

describe('Notifications Module', () => {
    describe('notifyMany', () => {
        it('should accept valid data', async () => {
            const results = await Notify.notifyMany(subList, deliveryTime);
            console.log('RESULTS:', results);
            expect(results).toBeDefined();
            expect(results).toStrictEqual(['success']);
        });
        it('should throw an error with empty list', async () => {
            try {
                const results = await Notify.notifyMany([], deliveryTime);
                expect(results).toBeUndefined();
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
                expect(e.message).toStrictEqual('Empty subscribe list');
            }
        });
    });
});
