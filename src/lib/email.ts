import mailgun from 'mailgun-js';
import env from '../config/env';

const mg = mailgun({
    apiKey: env.MAILGUN_API_KEY,
    domain: env.MAILGUN_DOMAIN,
});

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

    Your Member of Congress,${MoC} will be participating in an online Deliberative Townhall on ${topic} at ${eventDateTime}. This event is organized by Connecting to Congress, an independent, non-partisan initiative led by the Ohio State University, whose mission is to connect a representative sample of constituents with their elected officials in productive online townhall meetings. All ${constituentScope} constituents are invited to attend this event; if you would like to participate, please register here  ${registrationLink}.

    The townhall will be online using the GoToWebcast platform, which has a limit of 3000 participants per event. After you register, you will receive an email with a unique link to join the online townhall,  which you can access via smartphone, tablet  or computer.

    The townhall will be moderated by the Connecting to Congress team. This is an opportunity for you to ask ${MoC} questions and let them know about any concerns or problems you have had as a result of the COVID-19 pandemic. Our goal for these Deliberative Townhalls is to help elected officials hear from not just the loudest and most powerful voices in the conversation, but a representative cross-section of their constituents, so they can better represent their district. We hope you will participate!

    Best,

    The Connecting to Congress Team
    For more information, please visit: https://connectingtocongress.org/
    `;
};

const generateInviteLink = () => {};

/**
 * @description internal function to use mg api to send email
 * @param {Object} data email data based on mg api docs
 * @returns {Promise}
 */
const sendEmail = async (email: string, message: string) => {
    // in development mode, don't send an email, instead we will test this on the staging server
    if (env.NODE_ENV === 'development') {
        console.log(`To: ${email}: \n${message}`);
        return new Promise((resolve) => resolve('success'));
    }
    return; //mg.messages().send(data);
};

const inviteMany = (...args: any) => {
    const data = args[0];
    console.log(data);
};

/**
 * @description sends out an email invite to a potential user
 * @param {string} email the email address that will be invited
 * @param {string} fName invitee name
 * @param {string} MoC Member of Congress
 * @param {string} topic Topic for the Town Hall
 * @param {string} eventDateTime The event date and time
 * @param {string} constituentScope the constituent scope
 */
const inviteOne = async (
    email: string,
    fName: string,
    MoC: string,
    topic: string,
    eventDateTime: string,
    constituentScope: string
) => {
    const registrationLink = 'link';
    const inviteString = getInviteString({
        MoC,
        topic,
        eventDateTime,
        constituentScope,
    })({ fName, registrationLink });
    await sendEmail(email, inviteString);
};

export default { inviteMany, inviteOne };
