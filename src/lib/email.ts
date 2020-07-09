import mailgun from 'mailgun-js';

const getMailgunApiKey = (): string => {
    if (process.env.MAILGUN_API_KEY === undefined) {
        throw new Error('MAILGUN_API_KEY is undefined');
    }
    return process.env.MAILGUN_API_KEY;
};

const getMailgunDomain = (): string => {
    if (process.env.MAILGUN_DOMAIN === undefined) {
        throw new Error('MAILGUN_DOMAIN is undefined');
    }
    return process.env.MAILGUN_DOMAIN;
};

const inDevMode = (): boolean => {
    if (process.env.NODE_ENV === 'development') {
        return true;
    }
    return false;
};

const mg = mailgun({
    apiKey: getMailgunApiKey(),
    domain: getMailgunDomain(),
});

/**
 * @description internal function to use mg api to send email
 * @arg {Object} data email data based on mg api docs
 * @returns {Promise}
 */
const sendEmail = async (data: any) => {
    // in development mode, don't send an email, instead we will test this on the staging server
    if (inDevMode()) {
        return new Promise((resolve) => resolve('success'));
    }
    return mg.messages().send(data);
};

const notifyMany = (...args: any) => {
    const data = args[0];
    console.log(data);
};

const notifyOne = (...args: any) => {
    const data = args[0];
    console.log(data);
};

export default { notifyMany, notifyOne };
