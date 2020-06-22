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
});
