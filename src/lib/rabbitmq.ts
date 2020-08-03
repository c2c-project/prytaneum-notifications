import amqp from 'amqplib';
import env from '../config/env';
import logger from './logger';

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

/**
 * @description create a channel which logs events
 * @return Promise<amqp.Channel>
 */
const createChannel = async (): Promise<amqp.Channel> => {
    if (!connection) throw new Error('No connection set for RabbitMQ');
    channel = await connection.createConfirmChannel();
    channel.on('close', () => {
        logger.print('RabbitMQ channel closed');
    });
    logger.print('RabbitMQ channel created');
    return channel;
};

/**
 * @description creates a connection and channel for rabbitmq
 */
const connect = async (): Promise<void> => {
    connection = await amqp.connect(env.AMQP_URL);
    channel = await createChannel();
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
