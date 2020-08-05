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

// TODO Figure out what time interval should be used for this
const MS_IN_SEC = 1000;
const SEC_IN_MIN = 60;
const DELAY_INTERVAL_MINS = 10 * SEC_IN_MIN * MS_IN_SEC; // Every 10 mins
const RETRY_DELAY = 10000; // 10 seconds

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
        await delay(DELAY_INTERVAL_MINS);
        await notificationConsumer();
    } catch (e) {
        logger.err(e);
        // Retry connection
        await delay(RETRY_DELAY);
        await notificationConsumer();
    }
};

export default notificationConsumer;
