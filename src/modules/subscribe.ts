/* eslint-disable @typescript-eslint/no-explicit-any */
import env from '../config/env';
import Email from '../lib/emails/email';

/**
 * @description Adds an email to mailgun's unsubscribe list
 * @param {string} email of to be added to the unsubscribe list
 * @return {Promise<any>}
 */
const mailgunUnsubscribe = async (email: string): Promise<any> => {
    // prettier-ignore
    return Email.mg.post(`/${env.MAILGUN_DOMAIN}/unsubscribes`, {
        'address': email,
        'tag': '*'
    });
};

/**
 * @description Deletes an email to mailgun's unsubscribe list
 * @param {string} email to be deleted from the unsubscribe list
 * @return {Promise<any>}
 */
const mailgunDeleteFromUnsubList = async (email: string): Promise<any> => {
    // prettier-ignore
    return Email.mg.delete(`/${env.MAILGUN_DOMAIN}/unsubscribes/${email}`, {});
};

export default {
    mailgunUnsubscribe,
    mailgunDeleteFromUnsubList,
};
