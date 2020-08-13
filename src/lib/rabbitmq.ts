import amqp from 'amqplib';
import { isUndefined } from 'util';

import env from '../config/env';
import logger from './logger';

let connection: amqp.Connection | undefined;
let channel: amqp.Channel | undefined;

/**
 * @description create a connection which logs events
 * @return {Promise<void>}
 */
const createConnection = async (): Promise<void> => {
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
 * @return {Promise<void>}
 * @throws Error: if no connection is defined
 */
const createChannel = async (): Promise<void> => {
    if (isUndefined(connection))
        throw new Error('No connection set for RabbitMQ');
    if (!isUndefined(channel)) return;
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
 * @return {Promise<void>}
 */
const connect = async (): Promise<void> => {
    await createConnection();
    await createChannel();
};

/**
 * @description get the rabbitmq connection
 * @return {amqp.Connection} rabbitmq connection
 * @throws Error: if no connection is defined
 */
const getConnection = (): amqp.Connection => {
    if (isUndefined(connection)) {
        throw new Error('No connection set for RabbitMQ');
    }
    return connection;
};

/**
 * @description get the rabbitmq channel
 * @return {amqp.Channel} rabbitmq channel
 * @throws Error: if no channel is defined
 */
const getChannel = (): amqp.Channel => {
    if (isUndefined(channel)) {
        throw new Error('No channel set for RabbitMQ');
    }
    return channel;
};

export default { connect, getConnection, getChannel };
