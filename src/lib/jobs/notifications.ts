/* eslint-disable @typescript-eslint/indent */
import Mailgun from 'mailgun-js';
import Rabbitmq from '../rabbitmq';
import DB from '../notifications';
import Notifications from '../../modules/notifications';
import logger from '../logger';

export interface notifiationConsumerData {
    region: string;
    notificationDateISO: string;
}

const delay = (duration: number) =>
    new Promise((resolve) => setTimeout(resolve, duration));

/**
 * @description Checks the rabbitmq notification queue and queues up the pending notifications.
 * @returns {Promise<void>}
 */
const notificationConsumer = async (): Promise<void> => {
    try {
        logger.print('Running Notification Consumer');
        const queue = 'notifications';
        const channel = Rabbitmq.getChannel();
        await channel.assertQueue(queue);
        const notifications: Array<notifiationConsumerData> = [];
        await channel.consume(queue, (msg) => {
            if (msg) {
                notifications.push(JSON.parse(msg.content.toString()));
                channel.ack(msg);
            }
        });
        const results: Array<Promise<
            Array<string | Mailgun.messages.SendResponse>
        >> = [];
        // For each of the notification jobs, check relevant subscribers and send out notifcations to each
        for (let i = 0; i < notifications.length; i += 1) {
            const { region, notificationDateISO } = notifications[i];
            // eslint-disable-next-line no-await-in-loop
            const subList = await DB.getSubList(region);
            const date = new Date(notificationDateISO);
            results.push(Notifications.notifyMany(subList, date));
        }
        await Promise.all(results);
    } catch (e) {
        logger.err(e);
    }
};

export default notificationConsumer;
