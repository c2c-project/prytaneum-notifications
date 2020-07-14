import express from 'express';

import Notifications from '../lib/notifications';
import Email from '../lib/email';

const router = express.Router();

router.post('/notify-many', async (req, res, next) => {
    try {
        const body = req.body;
        const data = body.data;
        if (body === undefined || data === undefined) {
            throw new Error('Undefined Data');
        }
        const unsubList = await Notifications.getUnsubList(body.region);
        const filteredData = data.filter((item: any) => {
            return !unsubList.includes(item.email);
        });
        Email.notifyMany(filteredData);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

router.post('/notify-one', async (req, res, next) => {
    try {
        const data = req.body;
        const { email, region } = data;
        if (req.body === undefined || data === undefined) {
            throw new Error('Undefined Data');
        }
        if (Notifications.isUnsubscribed(email, region))
            throw new Error('Cannot notify unsubscribed user');
        Email.notifyOne(data);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

router.post('/subscribe', async (req, res, next) => {
    try {
        const { email, region } = req.body.data;
        //const unsubList = await Notifications.getUnsubList(region);
        const isUnsubscribed = await Notifications.isUnsubscribed(
            email,
            region
        );
        console.log(isUnsubscribed);
        if (isUnsubscribed) Notifications.removeFromUnsubList(email, region);
        Notifications.addToSubList(email, region);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

router.post('/unsubscribe', async (req, res, next) => {
    try {
        const { email, region } = req.body.data;
        //const subList = await Notifications.getSubList(region);
        const isSubscribed = await Notifications.isSubscribed(email, region);
        console.log(isSubscribed);
        if (isSubscribed) {
            Notifications.removeFromSubList(email, region);
        }
        Notifications.addToUnsubList(email, region);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

export default router;
