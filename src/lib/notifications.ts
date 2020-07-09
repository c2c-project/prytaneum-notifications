import { UpdateWriteOpResult } from 'mongodb';

import Collections from 'db';

/**
 * @description fetches the relevant up to date unsubscribed list from the database
 * @param {string} region region that relates to the data
 * @return {Promise<Array<string>>} A Promise that resolves to an array of strings
 */
const getUnsubList = async (region: string): Promise<Array<string>> => {
    const doc = await Collections.Notifications().findOne({ region });
    console.log(doc);
    if (doc) {
        return doc.unsubscribeList;
    }
    throw new Error('Error getting the unsubscribe list from the database');
};

/**
 * @description adds an email to the relevant unsubscribed list in the database
 * @param {string} email email to be added to the list
 * @return {Promise<UpdateWriteOpResult>} Promise that resolves to a MongoDB cursor on success
 */
const addToUnsubList = async (email: string): Promise<any> => {
    return; //Collections.Notifications().updateOne({ _id });
};

/**
 * @descritpion removes an email from the relevant unsubscribed list in the database
 * @param {string} email email to be added to the list
 * @return {Proise<UpdateWriteOpResult>} Promise that resolves to a MongoDB cursor on success
 */
const removeFromUnsubList = async (email: string): Promise<any> => {
    return;
};

/**
 * @description subscribes user to receive notifications
 * @param {object} data object of data for the user that is subscribing
 * @return {Promise<UpdateWriteOpResult>} Promise that respoves to a MongoDB cursor
 */
const subscribeUser = async (data: any): Promise<any> => {
    return;
};

export default {
    getUnsubList,
    addToUnsubList,
    removeFromUnsubList,
    subscribeUser,
};
