/* eslint-disable @typescript-eslint/indent */
import Mailgun from 'mailgun-js';
import jwt from 'jsonwebtoken';
import { UpdateWriteOpResult } from 'mongodb';

import { MetaData } from 'db/notifications';
import { ClientError } from 'lib/errors';
import Notifications from '../lib/notifications';
import Email from '../lib/emails/email';
import env from '../config/env';

export interface InviteeData {
    email: string;
    fName: string;
    lName: string;
}

export interface InviteData {
    MoC: string;
    topic: string;
    eventDateTime: string;
    constituentScope: string;
    region: string;
    deliveryTimeString?: string; // ISO/UTC format
    deliveryTime: Date;
    townHallID: string;
    previewEmail?: string;
}

export interface InviteEmailParams {
    MoC: string;
    topic: string;
    eventDateTime: string;
    constituentScope: string;
}

/**
 * @description gets a customized email template message for invites
 * @param {string} MoC Member of Congress
 * @param {string} topic Topic for the Town Hall
 * @param {string} eventDateTime The event date and time
 * @param {string} constituentScope the constituent scope
 * @returns {string} the filled out invite template string
 */
const getInviteString = ({
    MoC,
    topic,
    eventDateTime,
    constituentScope,
}: InviteEmailParams): string => {
    return `Dear  %recipient.fName%,
    
    Your Member of Congress,${MoC} will be participating in an online Deliberative Townhall on ${topic} at ${eventDateTime}. This event is organized by Connecting to Congress, an independent, non-partisan initiative led by the Ohio State University, whose mission is to connect a representative sample of constituents with their elected officials in productive online townhall meetings. All ${constituentScope} constituents are invited to attend this event; if you would like to participate, please register here %recipient.inviteLink%.

    The townhall will be online using the GoToWebcast platform, which has a limit of 3000 participants per event. After you register, you will receive an email with a unique link to join the online townhall,  which you can access via smartphone, tablet  or computer.

    The townhall will be moderated by the Connecting to Congress team. This is an opportunity for you to ask ${MoC} questions and let them know about any concerns or problems you have had as a result of the COVID-19 pandemic. Our goal for these Deliberative Townhalls is to help elected officials hear from not just the loudest and most powerful voices in the conversation, but a representative cross-section of their constituents, so they can better represent their district. We hope you will participate!

    Best,

    The Connecting to Congress Team
    For more information, please visit: https://connectingtocongress.org/
    `;
};

/**
 * @description Adds unsub link to a message with newline
 * @param {string} message Message body
 * @param {string} unsubLink the unsubscribe link
 */
const addUnsubLink = (message: string, unsubLink: string): string => {
    const updatedMessage = `${message}\n${unsubLink}`;
    return updatedMessage;
};

/**
 * @description generates a link that hashes the info for the user.
 * @param {string} email
 * @return {string} link string
 */
const generateInviteLink = (email: string, townHallID: string): string => {
    const jwtOptions: jwt.SignOptions = {
        algorithm: 'HS256',
    };
    const payload = { email, townHallID };
    const token = jwt.sign(payload, env.JWT_SECRET, jwtOptions);
    return `${env.ORIGIN}/invited/${token}`;
};

/**
 * @description generates a link to unsubscribe from emails
 * @param {string} email
 * @return {string} link string
 */
const generateUnsubscribeLink = (email: string, townHallID: string): string => {
    const jwtOptions: jwt.SignOptions = {
        algorithm: 'HS256',
    };
    const payload = { email, townHallID };
    const token = jwt.sign(payload, env.JWT_SECRET, jwtOptions);
    return `${env.ORIGIN}/unsubscribe/${token}`;
};

interface RecipiantVariables {
    [key: string]: { fName: string; inviteLink: string; unsubLink: string };
}

/**
 * @description Takes in inviteeList and constructs list of emails and strigified recipiantVariables
 * @param inviteeList list of invitee data
 * @return Returns the recipiant variables along with the list of recipiant emails
 */
const generateRecipiantVariables = (
    inviteeList: Array<InviteeData>,
    townHallID: string
): { emails: Array<string>; recipiantVariables: string } => {
    const emails = [];
    const recipiantVariables: RecipiantVariables = {};
    for (let i = 0; i < inviteeList.length; i += 1) {
        const { fName, email } = inviteeList[i];
        const inviteLink = generateInviteLink(email, townHallID);
        const unsubLink = generateUnsubscribeLink(email, townHallID);
        recipiantVariables[email] = { fName, inviteLink, unsubLink };
        emails.push(email);
    }
    return { emails, recipiantVariables: JSON.stringify(recipiantVariables) };
};

/**
 * @description sends out invites to a list of potential users
 * @param {string} inviteeList list of invitee data
 * @param {string} MoC Member of Congress
 * @param {string} topic Topic for the Town Hall
 * @param {string} eventDateTime The event date and time
 * @param {string} constituentScope the constituent scope
 * @param {Date} deliveryTime the date & time that the email should be sent out as Date object
 * @return {Promise<Array<string | Mailgun.messages.SendResponse>>} promise that resolves to the mailgun email results in array
 */
const inviteMany = async (
    inviteeList: Array<InviteeData>,
    MoC: string,
    topic: string,
    eventDateTime: string,
    constituentScope: string,
    deliveryTime: Date,
    townHallID: string
): Promise<Array<string | Mailgun.messages.SendResponse>> => {
    const results: Array<Promise<string | Mailgun.messages.SendResponse>> = [];
    const inviteBody = getInviteString({
        MoC,
        topic,
        eventDateTime,
        constituentScope,
    });
    const inviteString = addUnsubLink(
        inviteBody,
        'Unsubscribe: %recipient.unsubLink%'
    );
    const subject = 'Prytaneum Invite';
    // TODO Test with 1k invitees to handle Mailgun limit
    const subsetSize = 1000;
    for (let i = 0; i < inviteeList.length; i += subsetSize) {
        // Take max of 1k invitees and format to list of emails and string of recipiantVariables
        const subset = inviteeList.slice(
            i,
            Math.min(inviteeList.length, i + subsetSize)
        );
        const { emails, recipiantVariables } = generateRecipiantVariables(
            subset,
            townHallID
        );
        results.push(
            Email.sendEmail(
                emails,
                subject,
                inviteString,
                deliveryTime,
                recipiantVariables
            )
        );
    }
    return Promise.all(results);
};

const validateData = (data: InviteData): void => {
    if (
        data.MoC === undefined ||
        data.topic === undefined ||
        data.eventDateTime === undefined ||
        data.constituentScope === undefined ||
        data.region === undefined
    )
        throw new ClientError('Undefined data');
};

/**
 * @description Valides a given delivery time header
 * @param {string | undefined} deliveryTimeString delivery time taken from header
 * @returns {Date} Given date as Date object if defined. Defaults to current Date object if undefined.
 * @throws ClientError: If a given string is defined but invalid throws a formatting error
 */
const validateDeliveryTime = (deliveryTimeString: string | undefined): Date => {
    let deliveryTime: Date;
    if (deliveryTimeString === undefined) {
        // Deliver right away by default if no deliveryTime is given
        deliveryTime = new Date(Date.now());
    } else if (Number.isNaN(Date.parse(deliveryTimeString))) {
        // Check if the ISO format is valid by parsing string, returns NaN if invalid
        throw new ClientError('Invalid ISO Date format');
    } else {
        // Delivery time is set to the time given
        deliveryTime = new Date(deliveryTimeString);
    }
    return deliveryTime;
};

const inviteCSVList = async (
    inviteeList: Array<InviteeData>,
    data: InviteData,
    previewEmail?: string
): Promise<Array<string | Mailgun.messages.SendResponse>> => {
    const unsubSet = new Set(
        await Notifications.getUnsubList(data.region) // Checked if undefined earlier
    );
    const filteredInviteeList = inviteeList.filter((item: InviteeData) => {
        return !unsubSet.has(item.email);
    });
    if (filteredInviteeList.length === 0) {
        throw new ClientError('No valid invitees');
    }
    if (previewEmail)
        filteredInviteeList.push({
            email: previewEmail,
            fName: 'fName',
            lName: 'lName',
        } as InviteeData);
    return inviteMany(
        filteredInviteeList,
        data.MoC, // Checked if undefined earlier
        data.topic,
        data.eventDateTime,
        data.constituentScope,
        data.deliveryTime,
        data.townHallID
    );
};

const addInviteHistory = (
    file: Express.Multer.File,
    region: string
): Promise<UpdateWriteOpResult> => {
    // Parse metadata
    const metadata: MetaData = {
        name: file.originalname,
        size: file.size, // Size in bytes
        sentDateTime: new Date().toUTCString(),
    };
    return Notifications.addToInviteHistory(metadata, region);
};

export default {
    inviteMany,
    validateDeliveryTime,
    inviteCSVList,
    addInviteHistory,
    validateData,
};
