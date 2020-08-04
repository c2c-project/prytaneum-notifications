import amqp from 'amqplib';
import { isUndefined } from 'util';

import env from '../config/env';
import logger from './logger';

let connection: amqp.Connection | undefined;
let channel: amqp.Channel | undefined;

const createConnection = async () => {
    if (!isUndefined(connection)) return;
    connection = await amqp.connect(env.AMQP_URL);
    connection.on('error', (e) => {
        logger.err(e);
    });
    connection.on('close', () => {
        logger.print('RabitMQ connection closed');
    });
    logger.print('RabbitMQ connection created');
};

/**
 * @description create a channel which logs events
 * @return Promise<amqp.Channel>
 */
const createChannel = async () => {
    if (!isUndefined(channel)) return;
    if (!connection) throw new Error('No connection set for RabbitMQ');
    channel = await connection.createConfirmChannel();
    channel.on('error', (e) => {
        logger.err(e);
    });
    channel.on('close', () => {
        logger.print('RabbitMQ channel closed');
    });
    logger.print('RabbitMQ channel created');
};

/**
 * @description creates a connection and channel for rabbitmq
 */
const connect = async (): Promise<void> => {
    await createConnection();
    await createChannel();
};

const getConnection = (): amqp.Connection => {
    if (!connection) {
        throw new Error('No connection set for RabbitMQ');
    }
    return connection;
};

const getChannel = (): amqp.Channel => {
    if (!channel) {
        throw new Error('No channel set for RabbitMQ');
    }
    return channel;
};

export default { connect, getConnection, getChannel };
