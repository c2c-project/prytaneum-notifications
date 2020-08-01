import env from '../config/env';
import Email from '../lib/emails/email';

const mailgunUnsubscribe = async (email: string): Promise<any> => {
    // prettier-ignore
    return Email.mg.post(`/${env.MAILGUN_DOMAIN}/unsubscribes`, {
        'address': email,
        'tag': '*'
    });
};

const mailgunDeleteFromUnsubList = async (email: string): Promise<any> => {
    // prettier-ignore
    return Email.mg.delete(`/${env.MAILGUN_DOMAIN}/unsubscribes/${email}`, {});
};

export default {
    mailgunUnsubscribe,
    mailgunDeleteFromUnsubList,
};
