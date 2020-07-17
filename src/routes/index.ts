import express from 'express';
import { v5 as uuidv5 } from 'uuid';
import isISODate from 'is-iso-date';

import Notifications from '../lib/notifications';
import Email from '../lib/emails/email';

import env from '../config/env';
import { ClientError } from 'lib/errors';

const router = express.Router();

export interface InviteeData {
    email: string;
    fName: string;
    lName: string;
}

export interface InviteManyData {
    inviteeList: Array<InviteeData>;
    MoC: string;
    topic: string;
    eventDateTime: string;
    constituentScope: string;
    region: string;
    deliveryTime?: string; //ISO format
}

router.post('/invite-many', async (req, res, next) => {
    try {
        const data: InviteManyData = req.body;
        const unsubList = await Notifications.getUnsubList(data.region);
        const filteredInviteeList = data.inviteeList.filter(
            (item: InviteeData) => {
                const emailHash = uuidv5(item.email, uuidv5.URL);
                return !unsubList.includes(emailHash);
            }
        );
        if (data.deliveryTime === undefined) {
            //Deliver right away by default if no deliveryTime is given
            const now = new Date(Date.now());
            data.deliveryTime = now.toISOString();
            if (env.NODE_ENV === 'test') {
                res.status(200).send(data.deliveryTime);
                return;
            }
        } else if (!isISODate(data.deliveryTime)) {
            throw new ClientError('Invalid ISO Date format');
            //Check that date is not in the past
        } else if (new Date(data.deliveryTime).getTime() - Date.now() < 0) {
            // Default or throw error?
            throw new ClientError('Past time picked');
        }
        const results = await Email.inviteMany(
            filteredInviteeList,
            data.MoC,
            data.topic,
            data.eventDateTime,
            data.constituentScope,
            data.deliveryTime
        );
        console.log(results);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

export interface InviteOneData {
    email: string;
    fName: string;
    lName: string;
    MoC: string;
    topic: string;
    eventDateTime: string;
    constituentScope: string;
    region: string;
    deliveryTime?: string; //ISO Format
}

router.post('/invite-one', async (req, res, next) => {
    try {
        const data: InviteOneData = req.body;
        const isUnsubscribed = await Notifications.isUnsubscribed(
            data.email,
            data.region
        );
        if (data.deliveryTime === undefined) {
            //Deliver right away if no deliveryTime is given
            const now = new Date(Date.now());
            data.deliveryTime = now.toISOString();
            if (env.NODE_ENV === 'test') {
                res.status(200).send(data.deliveryTime);
                return;
            }
        } else if (!isISODate(data.deliveryTime)) {
            throw new ClientError('Invalid ISO Date format');
            //Check that date is not in the past
        } else if (new Date(data.deliveryTime).getTime() - Date.now() < 0) {
            // Default or throw error?
            throw new ClientError('Past time picked');
        }
        if (isUnsubscribed) throw new Error('Cannot invite unsubscribed user');
        const result = await Email.inviteOne(
            data.email,
            data.fName,
            data.MoC,
            data.topic,
            data.eventDateTime,
            data.constituentScope,
            data.deliveryTime
        );
        console.log(result);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

export interface NotifyManyData {
    townhallID: string;
    notificationDate: Date;
}

// router.post('/notify-many', async (req, res, next) => {
//     try {
//         res.status(200).send();
//     } catch (e) {
//         next(e);
//     }
// });

export interface SubscribeData {
    email: string;
    region: string;
}

router.post('/subscribe', async (req, res, next) => {
    try {
        const data: SubscribeData = req.body;
        if (data.email === undefined || data.region === undefined) {
            throw new ClientError('Invalid Data');
        }
        const isSubscribed = await Notifications.isSubscribed(
            data.email,
            data.region
        );
        if (isSubscribed) {
            throw new ClientError('Already subscribed.');
        }
        const isUnsubscribed = await Notifications.isUnsubscribed(
            data.email,
            data.region
        );
        if (env.NODE_ENV === 'test') {
            //console.log(`Adding to subList: ${data.email}, ${data.region}`);
            res.status(200).send(isUnsubscribed);
            return;
        }
        if (isUnsubscribed) {
            Notifications.removeFromUnsubList(data.email, data.region);
            Email.mailgunDeleteFromUnsubList(data.email);
        }
        //Remove from mailgun unsub list
        Notifications.addToSubList(data.email, data.region);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

//TODO Update to use the uuid instead of email
router.post('/unsubscribe', async (req, res, next) => {
    try {
        const data: SubscribeData = req.body;
        if (data.email === undefined || data.region === undefined) {
            throw new ClientError('Invalid Data');
        }
        const isUnsubscribed = await Notifications.isUnsubscribed(
            data.email,
            data.region
        );
        if (isUnsubscribed) {
            throw new ClientError('Already unsubscribed');
        }
        const isSubscribed = await Notifications.isSubscribed(
            data.email,
            data.region
        );
        if (env.NODE_ENV === 'test') {
            //console.log(`Adding to unsubList: ${data.email}, ${data.region}`);
            res.status(200).send(isSubscribed);
            return;
        }
        if (isSubscribed)
            Notifications.removeFromSubList(data.email, data.region);
        Notifications.addToUnsubList(data.email, data.region);
        Email.mailgunUnsubscribe(data.email);
        //Add to mailgun unsub list as well
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

export default router;
