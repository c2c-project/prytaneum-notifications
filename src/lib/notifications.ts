import { UpdateWriteOpResult } from 'mongodb';

import Collections from 'db';

/**
 * @description fetches the relevant up to date unsubscribed list from the database
 * @param {string} region region that relates to the data
 * @return {Promise<Array<string>>} A Promise that resolves to an array of strings
 */
const getUnsubList = async (region: string): Promise<Array<string>> => {
	const doc = await Collections.Notifications().findOne({ region });
	if (doc) {
		return doc.unsubscribeList;
	}
	throw new Error('Error getting the unsubscribe list from the database');
};

/**
 * @description adds an email to the relevant unsubscribed list in the database
 * @param {string} email email to be added to the list
 * @param {string} region region that relates to the data
 * @return {Promise<UpdateWriteOpResult>} Promise that resolves to a MongoDB cursor on success
 */
const addToUnsubList = async (email: string, region: string): Promise<any> => {
	const query = { $push: { unsubscribeList: email } };
	return Collections.Notifications().updateOne({ region }, query);
};

/**
 * @descritpion removes an email from the relevant unsubscribed list in the database
 * @param {string} email email to be added to the list
 * @param {string} region region that relates to the data
 * @return {Proise<UpdateWriteOpResult>} Promise that resolves to a MongoDB cursor on success
 */
const removeFromUnsubList = async (email: string, region: string): Promise<any> => {
	const query = { $pull: { unsubscribeList: email } };
	return Collections.Notifications().updateOne({ region }, query);
};

/**
 * @description subscribes user to receive notifications
 * @param {string} email email to be added to the list
 * @param {string} region region that relates to the data
 * @return {Promise<UpdateWriteOpResult>} Promise that respoves to a MongoDB cursor
 */
const subscribeUser = async (email: string, region: string): Promise<any> => {
	const query = { $push: { subscribeList: email } };
	return Collections.Notifications().updateOne({ region }, query);
};

export default {
	getUnsubList,
	addToUnsubList,
	removeFromUnsubList,
	subscribeUser,
};
