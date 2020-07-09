import express from 'express';

import Notifications from '../lib/notifications';
import Email from '../lib/email';

const router = express.Router();

router.get('/hello-world', (req, res) => res.send('Hello world!'));

router.post('/notify-many', async (req, res, next) => {
    try {
        const body = req.body;
        const data = body.data;
        const unsubList = await Notifications.getUnsubList(body.region);
        console.log(unsubList);
        const filteredData = data.filter((item: any) => {
            return !unsubList.includes(item.email);
        });
        console.log(filteredData);
        Email.notifyMany(filteredData);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

router.post('/notify-one', async (req, res, next) => {
    try {
        const body = req.body;
        const data = body.data;
        const unsubList = await Notifications.getUnsubList(body.region);
        if (unsubList.includes(data.email))
            //Depends on how we plan to implement Subscriptions/Unsubscribing
            //throw new ClientError('Cannot notify unsubscribed user')
            Email.notifyOne(data);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

router.post('/subscribe', async (req, res, next) => {
    try {
        const body = req.body;
        const data = body.data;
        const unsubList = await Notifications.getUnsubList(body.region);
        if (unsubList.includes(data.email))
            //Can simply take off of the unsub list to re-subscribe
            Notifications.removeFromUnsubList(data.email);
        Notifications.subscribeUser(data);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

router.post('/unsubscribe', async (req, res, next) => {
    try {
        const { email } = req.body.data;
        Notifications.addToUnsubList(email);
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

export default router;
