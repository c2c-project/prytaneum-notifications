import Notifications from './notifications';
import Collections, { connect, close, NotificationDoc } from 'db';
import { ObjectId } from 'mongodb';

const _id: ObjectId = new ObjectId();
const testUnsubscribeList = ['unsubscribed@example.com'];
const testSubscribeList = ['subscribed@example.com'];
const testRegion = 'test';
const testDoc: NotificationDoc = {
    _id,
    unsubscribeList: testUnsubscribeList,
    subscribeList: testSubscribeList,
    region: testRegion,
};

beforeAll(async () => {
    await connect();
    await Collections.Notifications().insertOne(testDoc);
});

afterAll(async () => {
    await Collections.Notifications().deleteOne({ _id });
    await close();
});

describe('Notifications Mongo', () => {
    describe('Subscribe List', () => {
        describe('getSubList', () => {
            it('should accept valid region & return correct data', async () => {
                const subList = await Notifications.getSubList(testRegion);
                expect(subList).toBeDefined();
                expect(subList).toEqual(testSubscribeList);
            });
            it('should throw an error if given an invalid region', async () => {
                try {
                    const subList = await Notifications.getSubList('invalid');
                    expect(subList).toBeUndefined();
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toEqual('Error finding region document');
                }
            });
        });
        describe('addToSubList', () => {
            it('should accept valid email and region', async () => {
                const result = await Notifications.addToSubList(
                    'test1@user.com',
                    testRegion
                );
                expect(result).toBeDefined();
                expect(result.result.n).toStrictEqual(1);
                expect(result.modifiedCount).toStrictEqual(1);
                expect(result.matchedCount).toStrictEqual(1);
            });
            it('should not modify an invalid region', async () => {
                const result = await Notifications.addToSubList(
                    'test2@user.com',
                    'invalid'
                );
                expect(result).toBeDefined();
                expect(result.result.n).toStrictEqual(0);
                expect(result.modifiedCount).toStrictEqual(0);
                expect(result.matchedCount).toStrictEqual(0);
            });
        });
        describe('removeFromSubList', () => {
            it('should accept valid email and region', async () => {
                const result = await Notifications.removeFromSubList(
                    'test1@user.com',
                    testRegion
                );
                expect(result).toBeDefined();
                expect(result.result.n).toStrictEqual(1);
                expect(result.modifiedCount).toStrictEqual(1);
                expect(result.matchedCount).toStrictEqual(1);
            });
            it('should not modify an invalid region', async () => {
                const result = await Notifications.removeFromSubList(
                    'test2@user.com',
                    'invalid'
                );
                expect(result).toBeDefined();
                expect(result.result.n).toStrictEqual(0);
                expect(result.modifiedCount).toStrictEqual(0);
                expect(result.matchedCount).toStrictEqual(0);
            });
        });
        describe('isSubscribed', () => {
            it('should find subscribed user', async () => {
                const isSubscribed = await Notifications.isSubscribed(
                    'subscribed@example.com',
                    testRegion
                );
                expect(isSubscribed).toBeTruthy();
            });
            it('should not find a non-subscribed user', async () => {
                const isSubscribed = await Notifications.isSubscribed(
                    'unsubscribed@example.com',
                    testRegion
                );
                expect(isSubscribed).toBeFalsy();
            });
            it('should throw error if given an invalid region', async () => {
                try {
                    const isSubscribed = await Notifications.isSubscribed(
                        'subscribed@example.com',
                        'invalid'
                    );
                    expect(isSubscribed).toBeTruthy();
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toEqual('Error finding region document');
                }
            });
        });
    });
    describe('Unsubscribe List', () => {
        describe('getUnsubList', () => {
            it('should accept valid region & return correct data', async () => {
                const unsubList = await Notifications.getUnsubList(testRegion);
                expect(unsubList).toBeDefined();
                expect(unsubList).toEqual(testUnsubscribeList);
            });
            it('should throw an error if given an invalid region', async () => {
                try {
                    const unsubList = await Notifications.getUnsubList(
                        'invalid'
                    );
                    expect(unsubList).toBeUndefined();
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toEqual('Error finding region document');
                }
            });
        });
        describe('addToUnsubList', () => {
            it('should accept valid email and region', async () => {
                const result = await Notifications.addToUnsubList(
                    'test1@user.com',
                    testRegion
                );
                expect(result).toBeDefined();
                expect(result.result.n).toStrictEqual(1);
                expect(result.modifiedCount).toStrictEqual(1);
                expect(result.matchedCount).toStrictEqual(1);
            });
            it('should not modify an invalid region', async () => {
                const result = await Notifications.addToUnsubList(
                    'test2@user.com',
                    'invalid'
                );
                expect(result).toBeDefined();
                expect(result.result.n).toStrictEqual(0);
                expect(result.modifiedCount).toStrictEqual(0);
                expect(result.matchedCount).toStrictEqual(0);
            });
        });
        describe('removeFromUnsubList', () => {
            it('should accept valid email and region', async () => {
                const result = await Notifications.removeFromUnsubList(
                    'test1@user.com',
                    testRegion
                );
                expect(result).toBeDefined();
                expect(result.result.n).toStrictEqual(1);
                expect(result.modifiedCount).toStrictEqual(1);
                expect(result.matchedCount).toStrictEqual(1);
            });
            it('should not modify an invalid region', async () => {
                const result = await Notifications.removeFromUnsubList(
                    'test2@user.com',
                    'invalid'
                );
                expect(result).toBeDefined();
                expect(result.result.n).toStrictEqual(0);
                expect(result.modifiedCount).toStrictEqual(0);
                expect(result.matchedCount).toStrictEqual(0);
            });
        });
        describe('isUnsubscribed', () => {
            it('should find subscribed user', async () => {
                const isUnsubscribed = await Notifications.isUnsubscribed(
                    'unsubscribed@example.com',
                    testRegion
                );
                expect(isUnsubscribed).toBeTruthy();
            });
            it('should not find a non-subscribed user', async () => {
                const isUnsubscribed = await Notifications.isUnsubscribed(
                    'subscribed@example.com',
                    testRegion
                );
                expect(isUnsubscribed).toBeFalsy();
            });
            it('should throw error if given an invalid region', async () => {
                try {
                    const isUnsubscribed = await Notifications.isUnsubscribed(
                        'unsubscribed@example.com',
                        'invalid'
                    );
                    expect(isUnsubscribed).toBeTruthy();
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toEqual('Error finding region document');
                }
            });
        });
    });
});
