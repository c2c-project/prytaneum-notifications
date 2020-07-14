import express from 'express';

import Notifications from '../lib/notifications';
import Email from '../lib/email';

const router = express.Router();

interface InviteeData {
    email: string;
    fName: string;
    lName: string;
}

//TODO Change Notify to Invite
interface NotifyManyData {
    inviteeList: Array<InviteeData>;
    MoC: string;
    topic: string;
    eventDateTime: string;
    constituentScope: string;
    region: string;
}

router.post('/notify-many', async (req, res, next) => {
    try {
        const { data } = req.body as { data: NotifyManyData };
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

interface NotifyOneData {
    email: string;
    fName: string;
    MoC: string;
    topic: string;
    eventDateTime: string;
    constituentScope: string;
    region: string;
}

router.post('/notify-one', async (req, res, next) => {
    try {
        const { data } = req.body as { data: NotifyOneData };
        const isUnsubscribed = await Notifications.isUnsubscribed(
            data.email,
            data.region
        );
        if (isUnsubscribed) throw new Error('Cannot notify unsubscribed user');
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

interface SubscribeData {
    email: string;
    region: string;
}

router.post('/subscribe', async (req, res, next) => {
    try {
        const { data } = req.body as { data: SubscribeData };
        const isUnsubscribed = await Notifications.isUnsubscribed(
            data.email,
            data.region
        );
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
        const { data } = req.body as { data: SubscribeData };
        const isSubscribed = await Notifications.isSubscribed(
            data.email,
            data.region
        );
        if (isSubscribed) {
            Notifications.removeFromSubList(data.email, data.region);
        }
        Notifications.addToUnsubList(data.email, data.region);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

export default router;
