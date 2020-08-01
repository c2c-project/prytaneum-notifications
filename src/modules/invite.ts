/* eslint-disable @typescript-eslint/indent */
import Mailgun from 'mailgun-js';
import jwt from 'jsonwebtoken';

import { InviteeData } from 'routes';
import logger from '../lib/logger';
import env from '../config/env';
import Email from '../lib/emails/email';

export interface InviteEmailParams {
    fName: string;
    MoC: string;
    topic: string;
    eventDateTime: string;
    constituentScope: string;
    registrationLink: string;
}
export type GlobalParams = Omit<
    InviteEmailParams,
    'fName' | 'registrationLink'
>;
export type EmailSpecificParams = Pick<
    InviteEmailParams,
    'fName' | 'registrationLink'
>;

/**
 * @description gets a customized email template message for invites
 * @param {string} MoC Member of Congress
 * @param {string} topic Topic for the Town Hall
 * @param {string} eventDateTime The event date and time
 * @param {string} constituentScope the constituent scope
 *
 * -->
 * @param {string} fName invitee name
 * @param {string} registrationLink a generated link for registration
 *
 * @returns {string} the filled out invite template string
 */
const getInviteString = ({
    MoC,
    topic,
    eventDateTime,
    constituentScope,
}: GlobalParams) => ({
    fName,
    registrationLink,
}: EmailSpecificParams): string => {
    return `Dear  ${fName},
    
    Your Member of Congress,${MoC} will be participating in an online Deliberative Townhall on ${topic} at ${eventDateTime}. This event is organized by Connecting to Congress, an independent, non-partisan initiative led by the Ohio State University, whose mission is to connect a representative sample of constituents with their elected officials in productive online townhall meetings. All ${constituentScope} constituents are invited to attend this event; if you would like to participate, please register here ${registrationLink}.

    The townhall will be online using the GoToWebcast platform, which has a limit of 3000 participants per event. After you register, you will receive an email with a unique link to join the online townhall,  which you can access via smartphone, tablet  or computer.

    The townhall will be moderated by the Connecting to Congress team. This is an opportunity for you to ask ${MoC} questions and let them know about any concerns or problems you have had as a result of the COVID-19 pandemic. Our goal for these Deliberative Townhalls is to help elected officials hear from not just the loudest and most powerful voices in the conversation, but a representative cross-section of their constituents, so they can better represent their district. We hope you will participate!

    Best,

    The Connecting to Congress Team
    For more information, please visit: https://connectingtocongress.org/

    Don't want emails from Prytaneum?
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

/**
 * @description sends out invites to a list of potential users
 * @param {string} inviteeList list of invitee data
 * @param {string} MoC Member of Congress
 * @param {string} topic Topic for the Town Hall
 * @param {string} eventDateTime The event date and time
 * @param {string} constituentScope the constituent scope
 * @param {string} deliveryTime the date & time that the email should be sent out in ISO format
 * @return {Promise<any>} promise that resolves to the mailgun email results
 */
const inviteMany = async (
    inviteeList: Array<InviteeData>,
    MoC: string,
    topic: string,
    eventDateTime: string,
    constituentScope: string,
    deliveryTime: Date
): Promise<
    Array<string | Mailgun.messages.SendResponse | undefined> | undefined
    // eslint-disable-next-line consistent-return
> => {
    try {
        let invitee: InviteeData;
        const results: Array<
            string | Mailgun.messages.SendResponse | undefined
        > = [];
        // TODO Update for each 1k invitees to handle Mailgun limit
        // eslint-disable-next-line no-restricted-syntax
        for (invitee of inviteeList) {
            const { email, fName } = invitee;
            const registrationLink = generateInviteLink(email);
            const inviteBody = getInviteString({
                MoC,
                topic,
                eventDateTime,
                constituentScope,
            })({ fName, registrationLink });
            const unsubscribeLink = generateUnsubscribeLink(email);
            const inviteString = addUnsubLink(inviteBody, unsubscribeLink);
            const subject = 'Prytaneum Town Hall Invite';
            // eslint-disable-next-line no-await-in-loop
            const result = await Email.sendEmail(
                email,
                subject,
                inviteString,
                deliveryTime
            );
            results.push(result);
        }
        return results;
    } catch (e) {
        logger.err(e);
    }
};

export default {
    inviteMany,
};
