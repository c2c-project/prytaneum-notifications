import mailgun from 'mailgun-js';
import env from '../config/env';

const mg = mailgun({
	apiKey: env.MAILGUN_API_KEY,
	domain: env.MAILGUN_DOMAIN,
});

/**
 * @description internal function to use mg api to send email
 * @arg {Object} data email data based on mg api docs
 * @returns {Promise}
 */
const sendEmail = async (data: any) => {
	// in development mode, don't send an email, instead we will test this on the staging server
	if (env.NODE_ENV === 'development') {
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
