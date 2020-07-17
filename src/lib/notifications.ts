import Collections, { NotificationDoc } from 'db';
import { UpdateWriteOpResult, Cursor } from 'mongodb';
import { v5 as uuidv5 } from 'uuid';

/**
 * @description fetches the relevant up to date unsubscribed list from the database
 * @param {string} region region that relates to the data
 * @return {Promise<Array<string>>} A Promise that resolves to an array of strings
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
    const emailHash = uuidv5(email, uuidv5.URL);
    const query = { $addToSet: { unsubscribeList: emailHash } };
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
    const emailHash = uuidv5(email, uuidv5.URL);
    const query = { $pull: { unsubscribeList: emailHash } };
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
    const emailHash = uuidv5(email, uuidv5.URL);
    const query = { $addToSet: { subscribeList: emailHash } };
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
    const emailHash = uuidv5(email, uuidv5.URL);
    const query = { $pull: { subscribeList: emailHash } };
    return Collections.Notifications().updateOne({ region }, query);
};

/**
 * @descritpion Checks if a given email is in the relevant subscribe list
 * @param {string} email email to be added to the list
 * @param {string} region region that relates to the data
 * @return {Promise<boolean>} Promise that resolves to a boolean
 */
const isSubscribed = async (
    email: string,
    region: string
): Promise<boolean> => {
    // const query = { subscribeList: { $elemMatch: email } };
    const emailHash = uuidv5(email, uuidv5.URL);
    const doc = await Collections.Notifications().findOne({ region });
    if (doc === null) {
        throw new Error('Error finding region document');
    }
    const subscribeList = doc.subscribeList;
    return subscribeList.includes(emailHash);
};

/**
 * @descritpion Checks if a given email is in the relevant unsubscribe list
 * @param {string} email email to be added to the list
 * @param {string} region region that relates to the data
 * @return {Promise<boolean>} Promise that resolves to a boolean
 */
const isUnsubscribed = async (
    email: string,
    region: string
): Promise<boolean> => {
    const emailHash = uuidv5(email, uuidv5.URL);
    const doc = await Collections.Notifications().findOne({ region });
    if (doc === null) {
        throw new Error('Error finding region document');
    }
    const unsubscribeList = doc.unsubscribeList;
    return unsubscribeList.includes(emailHash);
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
};
