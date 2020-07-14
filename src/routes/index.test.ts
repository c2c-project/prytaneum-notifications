import request, { Response } from 'supertest';
import app from 'app';

describe('index', () => {
    describe('/', () => {
        it('should respond with hello world', async () => {
            const { text } = (await request(app).get(
                '/hello-world'
            )) as Response & { text: 'hello world' };
            expect(text).toEqual('Hello world!');
        });
    });
    describe('/notify-many', () => {
        it('should accept valid data', async () => {
            const body = {
                data: [
                    {
                        email: 'sara@example.com',
                        name: 'Sara Jones',
                    },
                ],
                region: 'west_coast',
            };
            const { status } = await request(app)
                .post('/notify-many')
                .send(body);
            expect(status).toStrictEqual(200);
        });
    });
});
