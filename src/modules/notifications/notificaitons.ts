/* eslint-disable @typescript-eslint/indent */
import Mailgun from 'mailgun-js';
import Email from '../../lib/emails';

/**
 * @description Send out email notificaions from the subList
 * @param {Array<string>} subList A list of subscribers
 * @param {Date} deliveryTime Time that the email will be delivered
 */
const notifyMany = async (
    subList: Array<string>,
    deliveryTime: Date
): Promise<Array<string | Mailgun.messages.SendResponse>> => {
    if (subList.length === 0) {
        throw new Error('Empty subscribe list');
    }
    const results: Array<Promise<string | Mailgun.messages.SendResponse>> = [];
    while (subList.length) {
        // Take max of 1k emails to send for each mailgun batch
        const emails = subList.slice(0, 1000);
        // TODO Figure out what should be sent for notification
        const recipientVariables = '';
        const notificationString = 'Test Notification';
        // eslint-disable-next-line no-await-in-loop
        results.push(
            Email.sendEmail(
                emails,
                'Prytaneum Notification',
                notificationString,
                deliveryTime,
                recipientVariables
            )
        );
    }
    return Promise.all(results);
};

export default { notifyMany };
