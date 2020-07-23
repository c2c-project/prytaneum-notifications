import dotenv from 'dotenv';

dotenv.config();
const { env } = process;

export const defaults = {
    NODE_ENV: 'development',
    PORT: '3000',
    ORIGIN: '0.0.0.0',
    DB_URL: 'mongodb://0.0.0.0:27017',
    AMQP_URL: 'amqp://rabbitmq:5672',
    JWT_SECRET: 'secret',
    MAILGUN_ORIGIN: 'http://localhost:3000',
    MAILGUN_API_KEY: 'default_key',
    MAILGUN_DOMAIN: 'default_domain',
    MAILGUN_FROM_EMAIL: 'test@example.com',
} as Readonly<Required<NodeJS.ProcessEnv>>;

export function set(key: keyof NodeJS.ProcessEnv): string {
    const environmentVar = env[key];
    const envDefault = defaults[key];
    if (envDefault === undefined) {
        throw new Error('Provided invalid environment variable name');
    }
    if (environmentVar === undefined) {
        // eslint-disable-next-line no-console
        console.warn(
            `WARN: Environment variable "${key}" is not defined, using value "${envDefault}".\
            Please define "${key}" in your .env file`
        );
    }
    return environmentVar || envDefault;
}

const resilientEnv = {
    NODE_ENV: set('NODE_ENV'),
    PORT: set('PORT'),
    ORIGIN: set('ORIGIN'),
    DB_URL: set('DB_URL'),
    AMQP_URL: set('AMQP_URL'),
    JWT_SECRET: set('JWT_SECRET'),
    MAILGUN_ORIGIN: set('MAILGUN_ORIGIN'),
    MAILGUN_API_KEY: set('MAILGUN_API_KEY'),
    MAILGUN_DOMAIN: set('MAILGUN_DOMAIN'),
    MAILGUN_FROM_EMAIL: set('MAILGUN_FROM_EMAIL'),
} as Required<NodeJS.ProcessEnv>;

export default resilientEnv as Readonly<Required<NodeJS.ProcessEnv>>;

export const _test = {
    env: resilientEnv,
} as { env: NodeJS.ProcessEnv };
