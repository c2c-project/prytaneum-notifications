import faker from 'faker';
import Collections, { connect, close, NotificationDoc } from 'db';
import { ObjectId } from 'mongodb';
import Notifications from './notifications';

const _id: ObjectId = new ObjectId();
const testUnsubscribeList = [faker.internet.email(), faker.internet.email()];
const testSubscribeList = [faker.internet.email(), faker.internet.email()];
const testRegion = 'test2';
const testDoc: NotificationDoc = {
    _id,
    unsubscribeList: testUnsubscribeList,
    subscribeList: testSubscribeList,
    region: testRegion,
    inviteHistory: [],
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
                await expect(
                    Notifications.getSubList('invalid')
                ).rejects.toThrowError('Error finding region document');
            });
        });
        describe('addToSubList', () => {
            it('should accept valid email and region', async () => {
                const result = await Notifications.addToSubList(
                    faker.internet.email(),
                    testRegion
                );
                expect(result).toBeDefined();
                expect(result.result.n).toStrictEqual(1);
                expect(result.modifiedCount).toStrictEqual(1);
                expect(result.matchedCount).toStrictEqual(1);
            });
            it('should not modify an invalid region', async () => {
                const result = await Notifications.addToSubList(
                    faker.internet.email(),
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
                    testSubscribeList[1],
                    testRegion
                );
                expect(result).toBeDefined();
                expect(result.result.n).toStrictEqual(1);
                expect(result.modifiedCount).toStrictEqual(1);
                expect(result.matchedCount).toStrictEqual(1);
            });
            it('should not modify an invalid region', async () => {
                const result = await Notifications.removeFromSubList(
                    faker.internet.email(),
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
                    testSubscribeList[0],
                    testRegion
                );
                expect(isSubscribed).toBeTruthy();
            });
            it('should not find a non-subscribed user', async () => {
                const isSubscribed = await Notifications.isSubscribed(
                    testUnsubscribeList[0],
                    testRegion
                );
                expect(isSubscribed).toBeFalsy();
            });
            it('should throw error if given an invalid region', async () => {
                await expect(
                    Notifications.isSubscribed(
                        faker.internet.email(),
                        'invalid'
                    )
                ).rejects.toThrowError('Error finding region document');
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
                await expect(
                    Notifications.getUnsubList('invalid')
                ).rejects.toThrowError('Error finding region document');
            });
        });
        describe('addToUnsubList', () => {
            it('should accept valid email and region', async () => {
                const result = await Notifications.addToUnsubList(
                    faker.internet.email(),
                    testRegion
                );
                expect(result).toBeDefined();
                expect(result.result.n).toStrictEqual(1);
                expect(result.modifiedCount).toStrictEqual(1);
                expect(result.matchedCount).toStrictEqual(1);
            });
            it('should not modify an invalid region', async () => {
                const result = await Notifications.addToUnsubList(
                    faker.internet.email(),
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
                    testUnsubscribeList[1],
                    testRegion
                );
                expect(result).toBeDefined();
                expect(result.result.n).toStrictEqual(1);
                expect(result.modifiedCount).toStrictEqual(1);
                expect(result.matchedCount).toStrictEqual(1);
            });
            it('should not modify an invalid region', async () => {
                const result = await Notifications.removeFromUnsubList(
                    faker.internet.email(),
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
                    testUnsubscribeList[0],
                    testRegion
                );
                expect(isUnsubscribed).toBeTruthy();
            });
            it('should not find a non-subscribed user', async () => {
                const isUnsubscribed = await Notifications.isUnsubscribed(
                    testSubscribeList[0],
                    testRegion
                );
                expect(isUnsubscribed).toBeFalsy();
            });
            it('should throw error if given an invalid region', async () => {
                await expect(
                    Notifications.isUnsubscribed(
                        faker.internet.email(),
                        'invalid'
                    )
                ).rejects.toThrowError('Error finding region document');
            });
        });
    });
});
