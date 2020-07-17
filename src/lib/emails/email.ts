import mailgun from 'mailgun-js';
import { v5 as uuidv5 } from 'uuid';
import jwt from 'jsonwebtoken';
import env from '../../config/env';
import { InviteeData } from 'routes';

const mg = mailgun({ apiKey: env.MAILGUN_API_KEY, domain: env.MAILGUN_DOMAIN });

export interface InviteEmailParams {
    fName: string;
    MoC: string;
    topic: string;
    eventDateTime: string;
    constituentScope: string;
    registrationLink: string;
    unsubscribeLink: string;
}
export type GlobalParams = Omit<
    InviteEmailParams,
    'fName' | 'registrationLink' | 'unsubscribeLink'
>;
export type EmailSpecificParams = Pick<
    InviteEmailParams,
    'fName' | 'registrationLink' | 'unsubscribeLink'
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
    unsubscribeLink,
}: EmailSpecificParams): string => {
    return `Dear  ${fName},
    
    Your Member of Congress,${MoC} will be participating in an online Deliberative Townhall on ${topic} at ${eventDateTime}. This event is organized by Connecting to Congress, an independent, non-partisan initiative led by the Ohio State University, whose mission is to connect a representative sample of constituents with their elected officials in productive online townhall meetings. All ${constituentScope} constituents are invited to attend this event; if you would like to participate, please register here ${registrationLink}.

    The townhall will be online using the GoToWebcast platform, which has a limit of 3000 participants per event. After you register, you will receive an email with a unique link to join the online townhall,  which you can access via smartphone, tablet  or computer.

    The townhall will be moderated by the Connecting to Congress team. This is an opportunity for you to ask ${MoC} questions and let them know about any concerns or problems you have had as a result of the COVID-19 pandemic. Our goal for these Deliberative Townhalls is to help elected officials hear from not just the loudest and most powerful voices in the conversation, but a representative cross-section of their constituents, so they can better represent their district. We hope you will participate!

    Best,

    The Connecting to Congress Team
    For more information, please visit: https://connectingtocongress.org/

    Don't want emails from Prytaneum? Unsubscribe at: ${unsubscribeLink}
    `;
};

/**
 * @description generates a link that hashes the info for the user
 * @param {string} email
 * @return {string} link string
 */
const generateInviteLink = (email: string): string => {
    const emailHash = uuidv5(email, uuidv5.URL);
    const jwtOptions: jwt.SignOptions = {
        algorithm: 'HS256',
        expiresIn: '7d',
    };
    const payload = { uid: emailHash };
    const token = jwt.sign(payload, env.JWT_SECRET, jwtOptions);
    return `${env.ORIGIN}/invited/${token}`;
};

/**
 * @description generates a link to unsubscribe from emails
 * @param {string} email
 * @return {string} link string
 */
const generateUnsubscribeLink = (email: string): string => {
    const emailHash = uuidv5(email, uuidv5.URL);
    const jwtOptions: jwt.SignOptions = {
        algorithm: 'HS256',
        expiresIn: '7d',
    };
    const payload = { uid: emailHash };
    const token = jwt.sign(payload, env.JWT_SECRET, jwtOptions);
    return `${env.ORIGIN}/unsubscribe/${token}`;
};

/**
 * @description internal function to use mg api to send email
 * @param {string} to email adress being sent to
 * @returns {Promise<any>}
 */
const sendEmail = async (
    to: string,
    subject: string,
    text: string
): Promise<any> => {
    // in development mode, don't send an email, instead we will test this on the staging server
    if (env.NODE_ENV === 'development') {
        const data: mailgun.messages.SendData = {
            to,
            from: `Prytaneum <${env.MAILGUN_FROM_EMAIL}>`,
            subject,
            text,
            'o:testmode': 'true',
        };
        return await mg.messages().send(data);
    } else if (env.NODE_ENV === 'test') {
        console.log(`To: ${to}: \n${text}`);
        return new Promise((resolve) => resolve('success'));
    } else {
        const data: mailgun.messages.SendData = {
            to,
            from: `Prytaneum <${env.MAILGUN_FROM_EMAIL}>`,
            subject,
            text,
            //'o:deliverytime': 'Fri, 6 Jul 2017 18:10:10 -0000',
        };
        return await mg.messages().send(data);
    }
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
    deliveryTime: string
): Promise<any> => {
    const deliveryTimeDate = new Date(deliveryTime);
    return new Promise((resolve) => {
        setTimeout(async () => {
            let invitee: InviteeData;
            const results: any = [];
            for (invitee of inviteeList) {
                const { email, fName } = invitee;
                const registrationLink = generateInviteLink(email);
                const unsubscribeLink = generateUnsubscribeLink(email);
                const inviteString = getInviteString({
                    MoC,
                    topic,
                    eventDateTime,
                    constituentScope,
                })({ fName, registrationLink, unsubscribeLink });
                const subject = 'Prytaneum Town Hall Invite';
                const result = await sendEmail(email, subject, inviteString);
                results.push(result);
            }
            resolve(results);
        }, deliveryTimeDate.getTime() - Date.now());
    });
};

/**
 * @description sends out an email invite to a potential user
 * @param {string} email the email address that will be invited
 * @param {string} fName invitee name
 * @param {string} MoC Member of Congress
 * @param {string} topic Topic for the Town Hall
 * @param {string} eventDateTime The event date and time
 * @param {string} constituentScope the constituent scope
 * @param {string} deliveryTime the date & time that the email should be sent out in ISO format
 * @return {Promise<any>} promise that resolves to the mailgun email results
 */
const inviteOne = async (
    email: string,
    fName: string,
    MoC: string,
    topic: string,
    eventDateTime: string,
    constituentScope: string,
    deliveryTime: string
): Promise<any> => {
    const deliveryTimeDate = new Date(deliveryTime);
    return new Promise((resolve) => {
        setTimeout(async () => {
            const registrationLink = generateInviteLink(email);
            const unsubscribeLink = generateUnsubscribeLink(email);
            const inviteString = getInviteString({
                MoC,
                topic,
                eventDateTime,
                constituentScope,
            })({ fName, registrationLink, unsubscribeLink });
            const subject = 'Prytaneum Town Hall Invite';
            const result = await sendEmail(email, subject, inviteString);
            resolve(result);
        }, deliveryTimeDate.getTime() - Date.now());
    });
};

const mailgunUnsubscribe = async (email: string): Promise<any> => {
    //prettier-ignore
    return await mg.post(`/${env.MAILGUN_DOMAIN}/unsubscribes`, {
        'address': email,
        'tag': '*'
    });
};

const mailgunDeleteFromUnsubList = async (email: string): Promise<any> => {
    //prettier-ignore
    return await mg.delete(`/${env.MAILGUN_DOMAIN}/unsubscribes/${email}`, {});
};

export default {
    inviteMany,
    inviteOne,
    mailgunUnsubscribe,
    mailgunDeleteFromUnsubList,
};

// /**
//  * @description internal function to use mg api to send email
//  * @param {string} to email adress being sent to
//  * @returns {Promise}
//  */
// const sendEmail = async (
//     to: string,
//     subject: string,
//     text: string
// ): Promise<any> => {
//     // in development mode, don't send an email, instead we will test this on the staging server
//     if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
//         //console.log(`To: ${to}: \n${text}`);
//         console.log('Email Sent');
//         //return new Promise((resolve) => resolve('success'));
//     }
//     const mailOptions: Mail.Options = {
//         to,
//         from: `Prytaneum <${env.GMAIL_USER}>`,
//         subject,
//         text,
//     };
//     const transporter: Mail = nodemailer.createTransport({
//         service: 'gmail',
//         secure: true,
//         auth: {
//             type: 'OAuth2',
//             user: env.GMAIL_USER,
//             clientId: env.GMAIL_ID,
//             clientSecret: env.GMAIL_SECRET,
//             refreshToken: env.GMAIL_REFRESH_TOKEN,
//             accessToken: env.GMAIL_ACCESS_TOKEN,
//         },
//     });
//     const info = await transporter.sendMail(mailOptions);
//     return info;
// };
