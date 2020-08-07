import Collections from 'db';
import { UpdateWriteOpResult } from 'mongodb';
import { MetaData } from 'db/notifications';

/**
 * @description fetches the relevant up to date unsubscribed list from the database
 * @param {string} region region that relates to the data
 * @return {Promise<Array<string>>} A Promise that resolves to an array of strings
 * @throws Error: if no document is found
 */
const getUnsubList = async (region: string): Promise<Array<string>> => {
    const doc = await Collections.Notifications().findOne({ region });
    if (doc === null) {
        throw new Error('Error finding region document');
    }
    return doc.unsubscribeList;
};

/**
 * @description fetches the relevant up to date subscribed list from the database
 * @param {string} region region that relates to the data
 * @return {Promise<Array<string>>} A Promise that resolves to an array of strings
 * @throws Error: if no document is found
 */
const getSubList = async (region: string): Promise<Array<string>> => {
    const doc = await Collections.Notifications().findOne({ region });
    if (doc === null) {
        throw new Error('Error finding region document');
    }
    return doc.subscribeList;
};

/**
 * @description adds an email to the relevant unsubscribed list in the database
 * @param {string} email email to be added to the list
 * @param {string} region region that relates to the data
 * @return {Promise<UpdateWriteOpResult>} Promise that resolves to a MongoDB cursor on success
 */
const addToUnsubList = async (
    email: string,
    region: string
): Promise<UpdateWriteOpResult> => {
    const query = { $addToSet: { unsubscribeList: email } };
    return Collections.Notifications().updateOne({ region }, query);
};

/**
 * @descritpion removes an email from the relevant unsubscribed list in the database
 * @param {string} email email to be added to the list
 * @param {string} region region that relates to the data
 * @return {Proise<UpdateWriteOpResult>} Promise that resolves to a MongoDB cursor on success
 */
const removeFromUnsubList = async (
    email: string,
    region: string
): Promise<UpdateWriteOpResult> => {
    const query = { $pull: { unsubscribeList: email } };
    return Collections.Notifications().updateOne({ region }, query);
};

/**
 * @description subscribes user to receive notifications
 * @param {string} email email to be added to the list
 * @param {string} region region that relates to the data
 * @return {Promise<UpdateWriteOpResult>} Promise that respoves to a MongoDB cursor
 */
const addToSubList = async (
    email: string,
    region: string
): Promise<UpdateWriteOpResult> => {
    const query = { $addToSet: { subscribeList: email } };
    return Collections.Notifications().updateOne({ region }, query);
};

/**
 * @descritpion removes an email from the relevant subscribed list in the database
 * @param {string} email email to be added to the list
 * @param {string} region region that relates to the data
 * @return {Proise<UpdateWriteOpResult>} Promise that resolves to a MongoDB cursor on success
 */
const removeFromSubList = async (
    email: string,
    region: string
): Promise<UpdateWriteOpResult> => {
    const query = { $pull: { subscribeList: email } };
    return Collections.Notifications().updateOne({ region }, query);
};

/**
 * @descritpion Checks if a given email is in the relevant subscribe list
 * @param {string} email email to be added to the list
 * @param {string} region region that relates to the data
 * @return {Promise<boolean>} Promise that resolves to a boolean
 * @throws Error: if no document is found
 */
const isSubscribed = async (
    email: string,
    region: string
): Promise<boolean> => {
    // const query = { subscribeList: { $elemMatch: email } };
    // const emailHash = uuidv5(email, uuidv5.URL);
    const doc = await Collections.Notifications().findOne({ region });
    if (doc === null) {
        throw new Error('Error finding region document');
    }
    const { subscribeList } = doc;
    return subscribeList.includes(email);
};

/**
 * @descritpion Checks if a given email is in the relevant unsubscribe list
 * @param {string} email email to be added to the list
 * @param {string} region region that relates to the data
 * @return {Promise<boolean>} Promise that resolves to a boolean
 * @throws Error: if no document is found
 */
const isUnsubscribed = async (
    email: string,
    region: string
): Promise<boolean> => {
    const doc = await Collections.Notifications().findOne({ region });
    if (doc === null) {
        throw new Error('Error finding region document');
    }
    const { unsubscribeList } = doc;
    return unsubscribeList.includes(email);
};

/**
 * @description adds invite metadata to invite history
 * @param {MetaData} metadata  invite metadata
 * @param {string} region region region that relates to the data
 * @returns {Promise<UpdateWriteOpResult>}
 */
const addToInviteHistory = async (
    metadata: MetaData,
    region: string
): Promise<UpdateWriteOpResult> => {
    const query = { $addToSet: { inviteHistory: metadata } };
    return Collections.Notifications().updateOne({ region }, query);
};

export default {
    getUnsubList,
    getSubList,
    addToUnsubList,
    removeFromUnsubList,
    addToSubList,
    removeFromSubList,
    isSubscribed,
    isUnsubscribed,
    addToInviteHistory,
};
