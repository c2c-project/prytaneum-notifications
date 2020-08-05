import request from 'supertest';
import faker from 'faker';
import app from 'app';
import Collections, { connect, close, NotificationDoc } from 'db';
import { ObjectId } from 'mongodb';
import Notifications from '../lib/notifications/notifications';
import { SubscribeData } from './index';
import Subscribe from '../modules/subscribe';

const testCSV = [
    'email,fName,lName',
    `${faker.internet.email()},${faker.name.firstName()},${faker.name.lastName()}`,
].join('\n');
const testMoC = faker.name.firstName();
const testTopic = 'Technology';
const testEventDateTime = faker.date.future().toUTCString();
const testConstituentScope = 'state';

const _id: ObjectId = new ObjectId();
const testUnsubscribeList: Array<string> = [
    faker.internet.email(),
    faker.internet.email(),
    faker.internet.email(),
];
const testSubscribeList: Array<string> = [
    faker.internet.email(),
    faker.internet.email(),
];
const region = 'test';
const testDoc: NotificationDoc = {
    _id,
    unsubscribeList: testUnsubscribeList,
    subscribeList: testSubscribeList,
    region,
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
    describe('#invite', () => {
        it('should accept valid data', async () => {
            const { status } = await request(app)
                .post('/invite')
                .set('moc', testMoC)
                .set('topic', testTopic)
                .set('eventdatetime', testEventDateTime)
                .set('constituentscope', testConstituentScope)
                .set('deliverytime', validDeliveryTime.toISOString())
                .set('region', region)
                .set('Content-Type', 'text/csv')
                .send(testCSV);
            expect(status).toStrictEqual(200);
        });
        it('should accept options with cors', async () => {
            const { status } = await request(app)
                .options('/invite')
                .set('moc', testMoC)
                .set('topic', testTopic)
                .set('eventdatetime', testEventDateTime)
                .set('constituentscope', testConstituentScope)
                .set('deliverytime', validDeliveryTime.toISOString())
                .set('region', region)
                .set('Content-Type', 'text/csv')
                .send(testCSV);
            expect(status).toStrictEqual(204);
        });
        it('should accept valid deliveryTime', async () => {
            const { status } = await request(app)
                .post('/invite')
                .set('moc', testMoC)
                .set('topic', testTopic)
                .set('eventdatetime', testEventDateTime)
                .set('constituentscope', testConstituentScope)
                .set('deliverytime', validDeliveryTime.toISOString())
                .set('region', region)
                .set('Content-Type', 'text/csv')
                .send(testCSV);
            expect(status).toStrictEqual(200);
        });
        it('should accept undefined deliveryTime & replace with valid deliveryTime', async () => {
            const { status } = await request(app)
                .post('/invite')
                .set('moc', testMoC)
                .set('topic', testTopic)
                .set('eventdatetime', testEventDateTime)
                .set('constituentscope', testConstituentScope)
                .set('region', region)
                .set('Content-Type', 'text/csv')
                .send(testCSV);
            expect(status).toStrictEqual(200);
        });
        it('should reject invalid deliveryTime', async () => {
            const { status } = await request(app)
                .post('/invite')
                .set('moc', testMoC)
                .set('topic', testTopic)
                .set('eventdatetime', testEventDateTime)
                .set('constituentscope', testConstituentScope)
                .set('deliverytime', 'invalid')
                .set('region', region)
                .set('Content-Type', 'text/csv')
                .send(testCSV);
            expect(status).toStrictEqual(400);
        });
        it('should remove unsubscribed user from list', async () => {
            const testUnsubCSV = [
                'email,fName,lName',
                `${
                    testUnsubscribeList[0]
                },${faker.name.firstName()},${faker.name.lastName()}`,
            ].join('\n');
            const { status } = await request(app)
                .post('/invite')
                .set('moc', testMoC)
                .set('topic', testTopic)
                .set('eventdatetime', testEventDateTime)
                .set('constituentscope', testConstituentScope)
                .set('deliverytime', validDeliveryTime.toISOString())
                .set('region', region)
                .set('Content-Type', 'text/csv')
                .send(testUnsubCSV);
            expect(status).toStrictEqual(400);
        });
        it('should reject no data', async () => {
            const { status } = await request(app).post('/invite');
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
                email: faker.internet.email(),
                region,
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
                email: testSubscribeList[0],
                region,
            };
            const { status } = await request(app)
                .post('/subscribe')
                .send(validData);
            expect(status).toStrictEqual(400);
            expect(isSubscribed).toBeCalledWith(
                validData.email,
                validData.region
            );
        });
        it('should find existing unsubscriber in testUnsubscribeList', async () => {
            // Spies
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
                email: testUnsubscribeList[1],
                region,
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
                region,
            };
            const { status } = await request(app)
                .post('/subscribe')
                .send(invalidData);
            expect(status).toStrictEqual(400);
        });
        it('should reject invalid region', async () => {
            const invalidData = {
                email: faker.internet.email(),
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
                email: faker.internet.email(),
                region,
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
            // Spies
            const isUnsubscried = jest.spyOn(Notifications, 'isUnsubscribed');
            const validData: SubscribeData = {
                email: testUnsubscribeList[2],
                region,
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
        it('should find existing subscriber in testSubscribeList', async () => {
            // Spies
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
                email: testSubscribeList[1],
                region,
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
                region,
            };
            const { status } = await request(app)
                .post('/unsubscribe')
                .send(invalidData);
            expect(status).toStrictEqual(400);
        });
        it('should reject invalid region', async () => {
            const invalidData = {
                email: faker.internet.email(),
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
