/* eslint-disable @typescript-eslint/indent */
import Mailgun from 'mailgun-js';
import jwt from 'jsonwebtoken';
import { isUndefined } from 'util';

import { InviteeData } from 'routes';
import env from '../config/env';
import Email from '../lib/emails/email';

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
 *
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

// Create function to add the unsub link to end of email message
const addUnsubLink = (message: string, unsubLink: string): string => {
    const updatedMessage = `${message}\n${unsubLink}`;
    return updatedMessage;
};

/**
 * @description generates a link that hashes the info for the user.
 * @param {string} email
 * @return {string} link string
 */
const generateInviteLink = (email: string): string => {
    const jwtOptions: jwt.SignOptions = {
        algorithm: 'HS256',
        expiresIn: '7d',
    };
    const payload = { email };
    const token = jwt.sign(payload, env.JWT_SECRET, jwtOptions);
    return `${env.ORIGIN}/invited/${token}`;
};

/**
 * @description generates a link to unsubscribe from emails
 * @param {string} email
 * @return {string} link string
 */
const generateUnsubscribeLink = (email: string): string => {
    // const uuid = uuidv5(email, uuidv5.URL);
    const jwtOptions: jwt.SignOptions = {
        algorithm: 'HS256',
        expiresIn: '7d',
    };
    const payload = { email };
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
    inviteeList: Array<InviteeData>
): { emails: Array<string>; recipiantVariables: string } => {
    if (inviteeList.length === 0) {
        throw new Error('Empty invitee list');
    }
    const emails = [];
    const recipiantVariables: RecipiantVariables = {};
    let invitee = inviteeList.pop();
    while (!isUndefined(invitee)) {
        const { fName, email } = invitee;
        const inviteLink = generateInviteLink(email);
        const unsubLink = generateUnsubscribeLink(email);
        recipiantVariables[email] = { fName, inviteLink, unsubLink };
        emails.push(email);
        invitee = inviteeList.pop();
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
 * @param {string} deliveryTime the date & time that the email should be sent out in ISO format
 * @return {Promise<Array<string | Mailgun.messages.SendResponse>>} promise that resolves to the mailgun email results in array
 */
const inviteMany = async (
    inviteeList: Array<InviteeData>,
    MoC: string,
    topic: string,
    eventDateTime: string,
    constituentScope: string,
    deliveryTime: Date
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
    while (inviteeList.length) {
        // Take max of 1k invitees and format to list of emails and string of recipiantVariables
        const subset = inviteeList.splice(0, 1000);
        const { emails, recipiantVariables } = generateRecipiantVariables(
            subset
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

export default {
    inviteMany,
};
