import Email from '../lib/emails/email';
import { v5 as uuidv5 } from 'uuid';

/**
 * @description Send out email notificaions from the subList
 * @param {Array<string>} subList A list of subscribers
 * @param {Date} deliveryTime Time that the email will be delivered
 */
const notifyMany = async (subList: Array<string>, deliveryTime: Date) => {
	try {
		let results: Array<string> = [];
		//TODO Fix the async problem
		subList.forEach(async (email) => {
			const result = await Email.sendEmail(email, 'Prytaneum Notification', 'Test Notification', deliveryTime);
			console.log(result);
			results.push('test');
		});
		results.push('test');
		return results;
	} catch (e) {
		console.error(e);
	}
};

export default { notifyMany };
