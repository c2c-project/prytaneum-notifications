import request from 'supertest';
import { v5 as uuidv5 } from 'uuid';
import app from 'app';
import {
    InviteeData,
    InviteManyData,
    InviteOneData,
    SubscribeData,
} from './index';
import Collections, { connect, close, NotificationDoc } from 'db';
import { ObjectId } from 'mongodb';

const _id: ObjectId = new ObjectId();
const testDoc: NotificationDoc = {
    _id,
    unsubscribeList: [uuidv5('unsubscribed@example.com', uuidv5.URL)],
    subscribeList: [uuidv5('subscribed@example.com', uuidv5.URL)],
    region: 'test',
};

beforeAll(async () => {
    await connect();
    await Collections.Notifications().insertOne(testDoc);
});

afterAll(async () => {
    await Collections.Notifications().deleteOne({ _id });
    await close();
});

describe('index', () => {
    describe('#invite-many', () => {
        it('should accept valid data', async () => {
            const validInvitee: InviteeData = {
                email: 'delia.zieme@ethereal.email',
                fName: 'Delia',
                lName: 'Zieme',
            };
            const validData: InviteManyData = {
                inviteeList: [validInvitee],
                MoC: 'Jack',
                topic: 'Technology',
                eventDateTime: 'July 31, 12:00 PM PST',
                constituentScope: 'State',
                region: 'west_coast',
            };
            const { status } = await request(app)
                .post('/invite-many')
                .send(validData);
            expect(status).toStrictEqual(200);
        });
        it('should reject no data', async () => {
            const { status } = await request(app).post('/invite-many');
            expect(status).toStrictEqual(500);
        });
    });
    describe('#invite-one', () => {
        it('should accept valid data', async () => {
            const validData: InviteOneData = {
                email: 'delia.zieme@ethereal.email',
                fName: 'Delia',
                lName: 'Zieme',
                MoC: 'Jack',
                topic: 'Technology',
                eventDateTime: 'July 31, 12:00 PM PST',
                constituentScope: 'State',
                region: 'west_coast',
            };
            const { status } = await request(app)
                .post('/invite-one')
                .send(validData);
            expect(status).toStrictEqual(200);
        });
        it('should reject no data', async () => {
            const { status } = await request(app).post('/invite-one');
            expect(status).toStrictEqual(500);
        });
    });
    describe('#subscribe', () => {
        it('should accept new subscriber', async () => {
            const validData: SubscribeData = {
                email: 'subscriber@example.com',
                region: 'test',
            };
            const { status } = await request(app)
                .post('/subscribe')
                .send(validData);
            expect(status).toStrictEqual(200);
        });
        it('should reject existing subscriber', async () => {
            const validData: SubscribeData = {
                email: 'subscribed@example.com',
                region: 'test',
            };
            const { status } = await request(app)
                .post('/subscribe')
                .send(validData);
            expect(status).toStrictEqual(400);
        });
        it('should find existing unsubscriber in unsubscribeList', async () => {
            const validData: SubscribeData = {
                email: 'unsubscribed@example.com',
                region: 'test',
            };
            const { status } = await request(app)
                .post('/subscribe')
                .send(validData);
            expect(status).toStrictEqual(200);
        });
        it('should reject no data', async () => {
            const { status } = await request(app).post('/subscribe');
            expect(status).toStrictEqual(500);
        });
    });
    describe('#unsubscribe', () => {
        it('should accept a new unsubscriber', async () => {
            const validData: SubscribeData = {
                email: 'unsubscriber@example.com',
                region: 'test',
            };
            const { status } = await request(app)
                .post('/unsubscribe')
                .send(validData);
            expect(status).toStrictEqual(200);
        });
        it('should reject and existing unsubscriber', async () => {
            const validData: SubscribeData = {
                email: 'unsubscribed@example.com',
                region: 'test',
            };
            const { status } = await request(app)
                .post('/unsubscribe')
                .send(validData);
            expect(status).toStrictEqual(400);
        });
        it('should find existing subscriber in subscribeList', async () => {
            const validData: SubscribeData = {
                email: 'subscribed@example.com',
                region: 'test',
            };
            console.log(uuidv5('subscribed@example.com', uuidv5.DNS));
            const { status, text } = await request(app)
                .post('/unsubscribe')
                .send(validData);
            expect(text).toStrictEqual('true');
            expect(status).toStrictEqual(200);
        });
        it('should reject no data', async () => {
            const { status } = await request(app).post('/unsubscribe');
            expect(status).toStrictEqual(500);
        });
    });
});
