import request from 'supertest';
import app from 'app';
import Collections, { connect, close, NotificationDoc } from 'db';
import { ObjectId } from 'mongodb';
import Notifications from '../lib/notificaitons/notifications';
import { SubscribeData } from './index';
import Subscribe from '../modules/subscribe';

const testCSV = ['email,fName,lName', 'test@example.com,Test,Name'].join('\n');
const testMoC = 'Jack';
const testTopic = 'Technology';
const testEventDateTime = 'July 31, 12:00 PM PST';
const testConstituentScope = 'state';
const testRegion = 'test';
const _id: ObjectId = new ObjectId();
const testDoc: NotificationDoc = {
    _id,
    unsubscribeList: [
        'unsubscribed@example.com',
        'unsubscribed2@example.com',
        'unsubscribed3@example.com',
    ],
    subscribeList: ['subscribed@example.com', 'subscribed2@example.com'],
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

afterEach(() => {
    jest.clearAllMocks();
});

const validDeliveryTime = new Date();

describe('index', () => {
    describe('#invite-many', () => {
        it('should accept valid data', async () => {
            const { status } = await request(app)
                .post('/invite-many')
                .set('moc', testMoC)
                .set('topic', testTopic)
                .set('eventdatetime', testEventDateTime)
                .set('constituentscope', testConstituentScope)
                .set('deliverytime', validDeliveryTime.toISOString())
                .set('region', testRegion)
                .set('Content-Type', 'text/csv')
                .send(testCSV);
            expect(status).toStrictEqual(200);
        });
        it('should accept options with cors', async () => {
            const { status } = await request(app)
                .options('/invite-many')
                .set('moc', testMoC)
                .set('topic', testTopic)
                .set('eventdatetime', testEventDateTime)
                .set('constituentscope', testConstituentScope)
                .set('deliverytime', validDeliveryTime.toISOString())
                .set('region', testRegion)
                .set('Content-Type', 'text/csv')
                .send(testCSV);
            expect(status).toStrictEqual(204);
        });
        it('should accept valid deliveryTime', async () => {
            const { status } = await request(app)
                .post('/invite-many')
                .set('moc', testMoC)
                .set('topic', testTopic)
                .set('eventdatetime', testEventDateTime)
                .set('constituentscope', testConstituentScope)
                .set('deliverytime', validDeliveryTime.toISOString())
                .set('region', testRegion)
                .set('Content-Type', 'text/csv')
                .send(testCSV);
            expect(status).toStrictEqual(200);
        });
        it('should accept undefined deliveryTime & replace with valid deliveryTime', async () => {
            const { status, text } = await request(app)
                .post('/invite-many')
                .set('moc', testMoC)
                .set('topic', testTopic)
                .set('eventdatetime', testEventDateTime)
                .set('constituentscope', testConstituentScope)
                .set('region', testRegion)
                .set('Content-Type', 'text/csv')
                .send(testCSV);
            expect(status).toStrictEqual(200);
            const deliveryTimeParsed = Date.parse(text);
            expect(Number.isNaN(deliveryTimeParsed)).toBeFalsy();
        });
        it('should reject invalid deliveryTime', async () => {
            const { status } = await request(app)
                .post('/invite-many')
                .set('moc', testMoC)
                .set('topic', testTopic)
                .set('eventdatetime', testEventDateTime)
                .set('constituentscope', testConstituentScope)
                .set('deliverytime', 'invalid')
                .set('region', testRegion)
                .set('Content-Type', 'text/csv')
                .send(testCSV);
            expect(status).toStrictEqual(400);
        });
        it('should remove unsubscribed user from list', async () => {
            const testUnsubCSV = [
                'email,fName,lName',
                'unsubscribed@example.com,Test,Name',
            ].join('\n');
            const { status, text } = await request(app)
                .post('/invite-many')
                .set('moc', testMoC)
                .set('topic', testTopic)
                .set('eventdatetime', testEventDateTime)
                .set('constituentscope', testConstituentScope)
                .set('deliverytime', validDeliveryTime.toISOString())
                .set('region', testRegion)
                .set('Content-Type', 'text/csv')
                .send(testUnsubCSV);
            expect(text).toStrictEqual('No valid invitees');
            expect(status).toStrictEqual(400);
        });
        it('should reject no data', async () => {
            const { status } = await request(app).post('/invite-many');
            expect(status).toStrictEqual(400);
        });
    });
    describe('#subscribe', () => {
        it('should accept new subscriber', async () => {
            // spies
            const addToSubList = jest.spyOn(Notifications, 'addToSubList');
            const mailgunDeleteFromUnsubList = jest
                .spyOn(Subscribe, 'mailgunDeleteFromUnsubList')
                .mockImplementationOnce(async () => {
                    return new Promise((resolve) => resolve('Success'));
                });
            const removeFromUnsubList = jest.spyOn(
                Notifications,
                'removeFromUnsubList'
            );
            const validData: SubscribeData = {
                email: 'subscriber@example.com',
                region: testRegion,
            };
            const { status } = await request(app)
                .post('/subscribe')
                .send(validData);
            expect(status).toStrictEqual(200);
            expect(addToSubList).toBeCalledWith(
                validData.email,
                validData.region
            );
            expect(mailgunDeleteFromUnsubList).not.toBeCalled();
            expect(removeFromUnsubList).not.toBeCalled();
        });
        it('should reject existing subscriber', async () => {
            const isSubscribed = jest.spyOn(Notifications, 'isSubscribed');
            const validData: SubscribeData = {
                email: 'subscribed@example.com',
                region: testRegion,
            };
            const { status, text } = await request(app)
                .post('/subscribe')
                .send(validData);
            expect(status).toStrictEqual(400);
            expect(text).toStrictEqual('Already subscribed');
            expect(isSubscribed).toBeCalledWith(
                validData.email,
                validData.region
            );
        });
        it('should find existing unsubscriber in unsubscribeList', async () => {
            const isUnsubscribed = jest.spyOn(Notifications, 'isUnsubscribed');
            const removeFromUnsubList = jest.spyOn(
                Notifications,
                'removeFromUnsubList'
            );
            const mailgunDeleteFromUnsubList = jest
                .spyOn(Subscribe, 'mailgunDeleteFromUnsubList')
                .mockImplementationOnce(async () => {
                    return new Promise((resolve) => resolve('Success'));
                });
            const addToSubList = jest.spyOn(Notifications, 'addToSubList'); // Can add .mockImplementaion if need it to return something
            const validData: SubscribeData = {
                email: 'unsubscribed2@example.com',
                region: testRegion,
            };
            const { status } = await request(app)
                .post('/subscribe')
                .send(validData);
            expect(isUnsubscribed).toBeCalledWith(
                validData.email,
                validData.region
            );
            expect(removeFromUnsubList).toBeCalledWith(
                validData.email,
                validData.region
            );
            expect(mailgunDeleteFromUnsubList).toBeCalledWith(validData.email);
            expect(addToSubList).toBeCalledWith(
                validData.email,
                validData.region
            );
            expect(status).toStrictEqual(200);
        });
        it('should reject invalid email', async () => {
            const invalidData = {
                email: undefined,
                region: testRegion,
            };
            const { status } = await request(app)
                .post('/subscribe')
                .send(invalidData);
            expect(status).toStrictEqual(400);
        });
        it('should reject invalid region', async () => {
            const invalidData = {
                email: 'subscriber@example.com',
                region: undefined,
            };
            const { status } = await request(app)
                .post('/subscribe')
                .send(invalidData);
            expect(status).toStrictEqual(400);
        });
        it('should reject no data', async () => {
            const { status } = await request(app).post('/subscribe');
            expect(status).toStrictEqual(400);
        });
    });
    describe('#unsubscribe', () => {
        it('should accept a new unsubscriber', async () => {
            // Spies
            const addToUnsubList = jest.spyOn(Notifications, 'addToUnsubList');
            const mailgunUnsubscribe = jest
                .spyOn(Subscribe, 'mailgunUnsubscribe')
                .mockImplementationOnce(async () => {
                    return new Promise((resolve) => resolve('Success'));
                });
            const validData: SubscribeData = {
                email: 'unsubscriber@example.com',
                region: testRegion,
            };
            const { status } = await request(app)
                .post('/unsubscribe')
                .send(validData);
            expect(status).toStrictEqual(200);
            expect(addToUnsubList).toBeCalledWith(
                validData.email,
                validData.region
            );
            expect(mailgunUnsubscribe).toBeCalledWith(validData.email);
        });
        it('should reject and existing unsubscriber', async () => {
            const isUnsubscried = jest.spyOn(Notifications, 'isUnsubscribed');
            const validData: SubscribeData = {
                email: 'unsubscribed3@example.com',
                region: testRegion,
            };
            const { status } = await request(app)
                .post('/unsubscribe')
                .send(validData);
            expect(status).toStrictEqual(400);
            expect(isUnsubscried).toBeCalledWith(
                validData.email,
                validData.region
            );
        });
        it('should find existing subscriber in subscribeList', async () => {
            const removeFromSubList = jest.spyOn(
                Notifications,
                'removeFromSubList'
            );
            const addToUnsubList = jest.spyOn(Notifications, 'addToUnsubList');
            const mailgunUnsubscribe = jest
                .spyOn(Subscribe, 'mailgunUnsubscribe')
                .mockImplementationOnce(async () => {
                    return new Promise((resolve) => resolve('Success'));
                });
            const validData: SubscribeData = {
                email: 'subscribed2@example.com',
                region: testRegion,
            };
            const { status } = await request(app)
                .post('/unsubscribe')
                .send(validData);
            expect(status).toStrictEqual(200);
            expect(removeFromSubList).toBeCalledWith(
                validData.email,
                validData.region
            );
            expect(addToUnsubList).toBeCalledWith(
                validData.email,
                validData.region
            );
            expect(mailgunUnsubscribe).toBeCalledWith(validData.email);
        });
        it('should reject invalid email', async () => {
            const invalidData = {
                email: undefined,
                region: testRegion,
            };
            const { status } = await request(app)
                .post('/unsubscribe')
                .send(invalidData);
            expect(status).toStrictEqual(400);
        });
        it('should reject invalid region', async () => {
            const invalidData = {
                email: 'subscriber@example.com',
                region: undefined,
            };
            const { status } = await request(app)
                .post('/unsubscribe')
                .send(invalidData);
            expect(status).toStrictEqual(400);
        });
        it('should reject no data', async () => {
            const { status } = await request(app).post('/unsubscribe');
            expect(status).toStrictEqual(400);
        });
    });
});
