import Email from '../lib/emails/email';

/**
 * @description Send out email notificaions from the subList
 * @param {Array<string>} subList A list of subscribers
 * @param {Date} deliveryTime Time that the email will be delivered
 */
const notifyMany = async (subList: Array<string>, deliveryTime: Date) => {
    try {
        if (subList.length === 0) {
            throw new Error('Empty subscribe list');
        }
        let results: Array<string> = [];
        //TODO Fix the async problem
        for (let i = 0; i < subList.length; i++) {
            const email = subList[i];
            const result = await Email.sendEmail(
                email,
                'Prytaneum Notification',
                'Test Notification',
                deliveryTime
            );
            results.push(result);
        }
        return results;
    } catch (e) {
        console.error(e);
    }
};

export default { notifyMany };
