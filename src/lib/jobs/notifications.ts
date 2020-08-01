/* eslint-disable @typescript-eslint/indent */
import Mailgun from 'mailgun-js';
import { ClientError } from 'lib/errors';
import Rabbitmq from '../rabbitmq';
import DB from '../notificaitons/notifications';
import Notifications from '../../modules/notifications/notificaitons';
import logger from '../logger';

export interface notifiationJobData {
    region: string;
    notificationDateISO: string;
    // TownHallID?
}

const notificationConsumer = async (): Promise<void> => {
    try {
        const queue = 'notifications'; // Defines the queue name to consume
        const channel = Rabbitmq.getChannel();
        await channel.assertQueue(queue);
        const notifications: Array<notifiationJobData> = [];
        await channel.consume(queue, (msg) => {
            if (msg) {
                notifications.push(JSON.parse(msg.content.toString()));
                channel.ack(msg);
            }
        });
        // console.log(notifications);
        const results: Array<Array<
            string | Mailgun.messages.SendResponse | undefined
        >> = [];
        // For each of the notification jobs, check relevant subscribers and send out notifcations to each
        for (let i = 0; i < notifications.length; i += 1) {
            const { region, notificationDateISO } = notifications[i];
            // eslint-disable-next-line no-await-in-loop
            const subList = await DB.getSubList(region);
            const date = new Date(notificationDateISO);
            // eslint-disable-next-line no-await-in-loop
            const result = await Notifications.notifyMany(subList, date);
            results.push(result);
        }
        logger.print(JSON.stringify(results));
        // TODO Figure out what time interval should be used for this
        // setTimeout(notificationConsumer, 10000);
    } catch (e) {
        // console.error(e);
        throw new ClientError('Problem with notification consumer');
    }
};

export default notificationConsumer;
