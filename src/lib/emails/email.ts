import mailgun from 'mailgun-js';
import env from '../../config/env';

const mg = mailgun({ apiKey: env.MAILGUN_API_KEY, domain: env.MAILGUN_DOMAIN });

/**
 * @description internal function to use mg api to send email
 * @param {string} to email adress being sent to
 * @param {string} subject subject of the email
 * @param {string} text body of the email
 * @param {Date} deliveryTime Time that the email should be sent out (If the date is in the past it will be sent immediately)
 * @returns {Promise<any>}
 */
const sendEmail = async (
    to: string,
    subject: string,
    text: string,
    deliveryTime: Date
): Promise<any> => {
    // in development mode, don't send an email, instead we will test this on the staging server
    console.log(to);
    if (env.NODE_ENV === 'development') {
        const data: mailgun.messages.SendData = {
            to,
            from: `Prytaneum <${env.MAILGUN_FROM_EMAIL}>`,
            subject,
            text,
            'o:deliverytime': deliveryTime.toUTCString(),
            'o:testmode': 'true',
        };
        return await mg.messages().send(data);
    } else if (env.NODE_ENV === 'test') {
        console.log(`To: ${to}: \n${text}`);
        return new Promise((resolve) => resolve('success'));
    } else {
        const data: mailgun.messages.SendData = {
            to,
            from: `Prytaneum <${env.MAILGUN_FROM_EMAIL}>`,
            subject,
            text,
            'o:deliverytime': deliveryTime.toUTCString(),
        };
        return await mg.messages().send(data);
    }
};

export default {
    sendEmail,
    mg,
};
