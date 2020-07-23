import Rabbitmq from '../rabbitmq';
import { ClientError } from 'lib/errors';
import DB from '../notifications';
import Notifications from '../../modules/notificaitons';

export interface notifiationJobData {
    region: string;
    notificationDateISO: string;
    //TownHallID?
}

const testData: notifiationJobData = {
    region: 'west_coast',
    notificationDateISO: new Date().toISOString(),
};

const notificationConsumer = async () => {
    try {
        const queue = 'notifications';
        const channel = Rabbitmq.getChannel();
        //console.log(channel);
        await channel.assertQueue(queue);
        const success = channel.sendToQueue(
            queue,
            Buffer.from(JSON.stringify(testData))
        );
        if (!success) {
            throw new ClientError('Failed to send data to channel queue');
        }
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
    } catch (e) {
        console.error(e);
        throw new ClientError('Problem with notification consumer');
    }
};

export default notificationConsumer;
