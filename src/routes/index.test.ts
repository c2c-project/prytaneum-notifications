import request, { Response } from 'supertest';
import app from 'app';
import {
    InviteeData,
    NotifyManyData,
    NotifyOneData,
    SubscribeData,
} from './index';
import Collections, { connect, close } from 'db';

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await close();
});

describe('index', () => {
    describe('#notify-many', () => {
        it('should accept valid data', async () => {
            const validInvitee: InviteeData = {
                email: 'fred@example.com',
                fName: 'Fred',
                lName: 'Flintstone',
            };
            const validData: NotifyManyData = {
                inviteeList: [validInvitee],
                MoC: 'Jack',
                topic: 'Technology',
                eventDateTime: 'July 31, 12:00 PM PST',
                constituentScope: 'State',
                region: 'west_coast',
            };
            const { status } = await request(app)
                .post('/notify-many')
                .send(validData);
            expect(status).toStrictEqual(200);
        });
        it('should reject no data', async () => {
            const { status } = await request(app).post('/notify-many');
            expect(status).toStrictEqual(500);
        });
        it('should reject missing field in data', async () => {
            const validInvitee: InviteeData = {
                email: 'fred@example.com',
                fName: 'Fred',
                lName: 'Flintstone',
            };
            const invalidData = {
                inviteeList: [validInvitee],
                MoC: 'Jack',
                topic: 'Technology',
                eventDateTime: 'July 31, 12:00 PM PST',
                constituentScope: 'State',
            };
            const { status } = await request(app)
                .post('/notify-many')
                .send(invalidData);
            expect(status).toStrictEqual(500);
        });
    });
    describe('#notify-one', () => {
        it('should accept valid data', async () => {
            const validData: NotifyOneData = {
                email: 'fred@example.com',
                fName: 'Fred',
                lName: 'Flintstone',
                MoC: 'Jack',
                topic: 'Technology',
                eventDateTime: 'July 31, 12:00 PM PST',
                constituentScope: 'State',
                region: 'west_coast',
            };
            const { status } = await request(app)
                .post('/notify-one')
                .send(validData);
            expect(status).toStrictEqual(200);
        });
        it('should reject no data', async () => {
            const { status } = await request(app).post('/notify-many');
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
            const { status, text } = await request(app)
                .post('/subscribe')
                .send(validData);
            expect(status).toStrictEqual(200);
            expect(text).toStrictEqual('true');
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
