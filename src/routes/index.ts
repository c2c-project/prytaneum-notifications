import express from 'express';
import multer from 'multer';

import { ClientError } from 'lib/errors';
import Notifications from '../lib/notifications';
import Invite, { InviteData } from '../modules/invite';
import Subscribe, { SubscribeData } from '../modules/subscribe';
import logger from '../lib/logger';

const router = express.Router();

// Multer setup
// eslint-disable-next-line @typescript-eslint/ban-types
const fileFilter = (
    req: unknown,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (file.mimetype === 'text/csv') {
        cb(null, true); // Accept
    } else {
        cb(null, false); // Reject
    }
};

// TODO Discuss storing locally or in memory
const upload = multer({
    limits: {
        fileSize: 1024 * 1024 * 10, // 10 MB limit
    },
    fileFilter,
});

router.post('/invite', upload.single('inviteFile'), async (req, res, next) => {
    try {
        if (!req.file) throw new ClientError('Invalid File'); // Check if file is undefined (rejected)
        const data = req.body as InviteData;
        Invite.validateData(data);
        data.deliveryTime = Invite.validateDeliveryTime(
            data.deliveryTimeString
        );
        const csvString = req.file.buffer.toString();
        const results = await Invite.inviteCSVList(csvString, data);
        logger.print(JSON.stringify(results));
        const opResult = await Invite.addInviteHistory(req.file, data.region);
        logger.print(JSON.stringify(opResult));
        res.status(200).send();
    } catch (e) {
        logger.err(e);
        next(e);
    }
});

router.post('/subscribe', async (req, res, next) => {
    try {
        const data = req.body as SubscribeData;
        if (data.email === undefined || data.region === undefined) {
            throw new ClientError('Invalid Body');
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
        // By default any subscriber will be removed from the unsub list
        if (isUnsubscribed) {
            await Notifications.removeFromUnsubList(data.email, data.region);
            await Subscribe.mailgunDeleteFromUnsubList(data.email);
        }
        await Notifications.addToSubList(data.email, data.region);
        res.status(200).send();
    } catch (e) {
        logger.err(e);
        next(e);
    }
});

router.post('/unsubscribe', async (req, res, next) => {
    try {
        const data = req.body as SubscribeData;
        if (data.email === undefined || data.region === undefined) {
            throw new ClientError('Invalid Body');
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
        if (isSubscribed)
            // Remove email from subscribe list
            await Notifications.removeFromSubList(data.email, data.region);
        await Notifications.addToUnsubList(data.email, data.region);
        await Subscribe.mailgunUnsubscribe(data.email);
        res.status(200).send();
    } catch (e) {
        logger.err(e);
        next(e);
    }
});

export default router;
