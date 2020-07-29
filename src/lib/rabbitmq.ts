import amqp from 'amqplib';
import env from '../config/env';

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

/**
 * @description creates a connection and channel for rabbitmq
 */
const connect = async (): Promise<void> => {
    try {
        connection = await amqp.connect(env.AMQP_URL);
        channel = await createChannel(connection);
    } catch (e) {
        throw e;
    }
};

/**
 * @description create a channel which logs events
 * @param connection The amqp connection
 * @return Promise<amqp.Channel>
 */
const createChannel = async (
    connection: amqp.Connection
): Promise<amqp.Channel> => {
    try {
        const channel = await connection.createConfirmChannel();
        channel.on('close', () => {
            console.log('RabbitMQ channel closed');
        });
        console.log('RabbitMQ channel created');
        return channel;
    } catch (e) {
        throw e;
    }
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
