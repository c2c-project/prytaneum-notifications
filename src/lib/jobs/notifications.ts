import Rabbitmq from '../rabbitmq';
import { ClientError } from 'lib/errors';
import DB from '../notificaitons/notifications';
import Notifications from '../../modules/notifications/notificaitons';

export interface notifiationJobData {
    region: string;
    notificationDateISO: string;
    //TownHallID?
}

const notificationConsumer = async () => {
    try {
        const queue = 'notifications'; //Defines the queue name to consume
        const channel = Rabbitmq.getChannel();
        await channel.assertQueue(queue);
        const notifications: Array<notifiationJobData> = [];
        await channel.consume(queue, (msg) => {
            if (msg) {
                notifications.push(JSON.parse(msg.content.toString()));
                channel.ack(msg);
            }
        });
        console.log(notifications);
        //For each of the notification jobs, check relevant subscribers and send out notifcations to each
        notifications.forEach(async (value) => {
            const { region, notificationDateISO } = value;
            const subList = await DB.getSubList(region);
            const date = new Date(notificationDateISO);
            Notifications.notifyMany(subList, date);
        });
        //TODO Figure out what time interval should be used for this
        //setTimeout(notificationConsumer, 10000);
    } catch (e) {
        console.error(e);
        throw new ClientError('Problem with notification consumer');
    }
};

export default notificationConsumer;
