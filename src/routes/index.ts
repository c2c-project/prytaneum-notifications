import express from 'express';

import Notifications from '../lib/notifications';
import Email from '../lib/email';

import env from '../config/env';

const router = express.Router();

export interface InviteeData {
    email: string;
    fName: string;
    lName: string;
}

//TODO Change Notify to Invite
export interface InviteManyData {
    inviteeList: Array<InviteeData>;
    MoC: string;
    topic: string;
    eventDateTime: string;
    constituentScope: string;
    region: string;
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
        Email.inviteMany(filteredInviteeList);
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
}

router.post('/invite-one', async (req, res, next) => {
    try {
        const data: InviteOneData = req.body;
        const isUnsubscribed = await Notifications.isUnsubscribed(
            data.email,
            data.region
        );
        if (isUnsubscribed) throw new Error('Cannot invite unsubscribed user');
        Email.inviteOne(
            data.email,
            data.fName,
            data.MoC,
            data.topic,
            data.eventDateTime,
            data.constituentScope
        );
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

export interface SubscribeData {
    email: string;
    region: string;
}

router.post('/subscribe', async (req, res, next) => {
    try {
        const data: SubscribeData = req.body;
        const isSubscribed = await Notifications.isSubscribed(
            data.email,
            data.region
        );
        if (isSubscribed) {
            res.status(400).send('Already subscribed.');
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
        if (isUnsubscribed)
            Notifications.removeFromUnsubList(data.email, data.region);
        Notifications.addToSubList(data.email, data.region);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

router.post('/unsubscribe', async (req, res, next) => {
    try {
        const data: SubscribeData = req.body;
        const isUnsubscribed = await Notifications.isUnsubscribed(
            data.email,
            data.region
        );
        if (isUnsubscribed) {
            res.status(400).send('Already unsubscribed');
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
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

export default router;
