import express from 'express';

import Notifications from '../lib/notificaitons/notifications';
import Invite from '../modules/invite';
import Subscribe from '../modules/subscribe';

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
                return !unsubList.includes(item.email);
            }
        );
        if (filteredInviteeList.length === 0)
            throw new ClientError('All invitees are unsubscribed');
        if (data.deliveryTime === undefined) {
            //Deliver right away by default if no deliveryTime is given
            const now = new Date(Date.now());
            data.deliveryTime = now.toISOString();
            if (env.NODE_ENV === 'test') {
                res.status(200).send(data.deliveryTime);
                return;
            }
        }
        //Check if the ISO format is valid by parsing string, returns NaN if invalid
        if (isNaN(Date.parse(data.deliveryTime)))
            throw new ClientError('Invalid ISO Date format');
        const results = await Invite.inviteMany(
            filteredInviteeList,
            data.MoC,
            data.topic,
            data.eventDateTime,
            data.constituentScope,
            new Date(data.deliveryTime)
        );
        res.status(200).send();
    } catch (e) {
        if (env.NODE_ENV === 'development') console.error(e);
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
        if (isUnsubscribed)
            throw new ClientError('Cannot invite unsubscribed user');
        if (data.deliveryTime === undefined) {
            //Deliver right away if no deliveryTime is given
            const now = new Date(Date.now());
            data.deliveryTime = now.toISOString();
            if (env.NODE_ENV === 'test') {
                res.status(200).send(data.deliveryTime);
                return;
            }
        }
        if (isNaN(Date.parse(data.deliveryTime)))
            throw new ClientError('Invalid ISO Date format');
        const result = await Invite.inviteOne(
            data.email,
            data.fName,
            data.MoC,
            data.topic,
            data.eventDateTime,
            data.constituentScope,
            new Date(data.deliveryTime)
        );
        res.status(200).send();
    } catch (e) {
        if (env.NODE_ENV === 'development') console.error(e);
        next(e);
    }
});

export interface NotifyManyData {
    townhallID: string;
    notificationDate: Date;
}

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
            res.status(200).send(isUnsubscribed);
            return;
        }
        if (isUnsubscribed) {
            Notifications.removeFromUnsubList(data.email, data.region);
            Subscribe.mailgunDeleteFromUnsubList(data.email);
        }
        //Remove from mailgun unsub list
        Notifications.addToSubList(data.email, data.region);
        res.status(200).send();
    } catch (e) {
        if (env.NODE_ENV === 'development') console.error(e);
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
            res.status(200).send(isSubscribed);
            return;
        }
        if (isSubscribed)
            Notifications.removeFromSubList(data.email, data.region);
        Notifications.addToUnsubList(data.email, data.region);
        Subscribe.mailgunUnsubscribe(data.email);
        //Add to mailgun unsub list as well
        res.status(200).send();
    } catch (e) {
        if (env.NODE_ENV === 'development') console.error(e);
        next(e);
    }
});

export default router;
