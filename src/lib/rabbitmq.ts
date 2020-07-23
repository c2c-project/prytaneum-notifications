import amqp from 'amqplib';
import { ClientError } from './errors';
import env from '../config/env';

let connection: amqp.Connection;
let channel: amqp.Channel;

const connect = async (): Promise<void> => {
	try {
		connection = await amqp.connect(env.AMQP_URL);
		connection.on('close', () => {
			console.log('RabbitMQ reconnecting...');
			return setTimeout(connect, 1000);
		});
		console.log('RabbitMQ Connected');
		channel = await createChannel(connection);
	} catch (e) {
		console.error(e);
		throw new ClientError('Unable to connect to RabbitMQ');
	}
};

/**
 * @description create a channel which logs events
 * @param {amqp.Connection} connection The amqp connection
 * @return {Promise<amqp.Channel>}
 */
const createChannel = async (connection: amqp.Connection): Promise<amqp.Channel> => {
	try {
		const channel = await connection.createConfirmChannel();
		channel.on('close', () => {
			console.log('RabbitMQ channel closed');
		});
		console.log('RabbitMQ channel created');
		return channel;
	} catch (e) {
		console.error(e);
		throw new ClientError('RabbitMQ channel error');
	}
};

const getConnection = (): amqp.Connection => {
	return connection;
};

const getChannel = (): amqp.Channel => {
	return channel;
};

export default { connect, getConnection, getChannel };
