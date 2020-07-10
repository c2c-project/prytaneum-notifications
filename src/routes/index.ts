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
		const unsubList = await Notifications.getUnsubList(region);
		if (unsubList.includes(email))
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
		const { email, region } = req.body.data;
		const unsubList = await Notifications.getUnsubList(region);
		if (unsubList.includes(email))
			//Can simply take off of the unsub list to re-subscribe
			Notifications.removeFromUnsubList(email, region);
		Notifications.subscribeUser(email, region);
		res.status(200).send();
	} catch (e) {
		next(e);
	}
});

router.post('/unsubscribe', async (req, res, next) => {
	try {
		const { email, region } = req.body.data;
		Notifications.addToUnsubList(email, region);
		res.status(200).send();
	} catch (e) {
		next(e);
	}
});

export default router;
