/* eslint-disable @typescript-eslint/indent */
import Mailgun from 'mailgun-js';
import DB from '../notifications';
import Notifications from '../../modules/notifications';
import logger from '../logger';

export interface notifiationConsumerData {
    region: string;
    notificationDate: Date;
}

/**
 * @description Checks the notification queue and queues up the pending notifications.
 * @returns {Promise<void>}
 */
const notificationConsumer = (): void => {
    logger.info('Running Notification Consumer');
    // TODO Get notifications from database (query & consume notifications within time frame)
    const notifications: Array<notifiationConsumerData> = [];
    const notificationResults: Array<Promise<
        Array<string | Mailgun.messages.SendResponse>
    >> = [];
    // For each of the notification jobs, check relevant subscribers and send out notifcations to each
    for (let i = 0; i < notifications.length; i += 1) {
        const { region, notificationDate } = notifications[i];
        DB.getSubList(region)
            .then((subList) => {
                notificationResults.push(
                    Notifications.notifyMany(subList, notificationDate)
                );
            })
            .catch((e) => {
                logger.error(e);
            });
    }
    Promise.all(notificationResults)
        .then((results) => {
            logger.info(`Notification Results: ${JSON.stringify(results)}`);
        })
        .catch((e) => {
            logger.error(e);
        });
};

export default notificationConsumer;
