import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import csvParser from 'csv-parser';

import { ClientError } from 'lib/errors';
import Notifications from 'lib/notifications';
import logger from 'lib/logger';
import Invite, { InviteData, InviteeData } from 'modules/invite';
import Subscribe, { SubscribeData } from 'modules/subscribe';

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(__dirname, '/downloads/'));
    },
    filename(req, file, cb) {
        cb(null, file.originalname);
    },
});

// eslint-disable-next-line @typescript-eslint/ban-types
const fileFilter = (
    req: unknown,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (file.mimetype === 'text/csv') {
        cb(null, true); // Accept
    } else {
        cb(new ClientError('Invalid File')); // Reject
    }
};

// TODO Discuss storing locally or in memory
const inviteUpload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 10, // 10 MB limit
    },
    fileFilter,
});

router.post(
    '/invite',
    inviteUpload.single('inviteFile'), // form-data key
    async (req, res, next) => {
        const { file } = req;
        try {
            if (!file) throw new ClientError('File undefined'); // Check if file is undefined (rejected)
            const data = req.body as InviteData;
            Invite.validateData(data);
            data.deliveryTime = Invite.validateDeliveryTime(
                data.deliveryTimeString
            );
            const inviteeData: Array<InviteeData> = [];
            const fileStream = fs.createReadStream(file.path).pipe(csvParser());
            const BATCH_SIZE = 5000; // Only store 5k invitees in memory at a time.
            // eslint-disable-next-line no-restricted-syntax
            for await (const fileData of fileStream) {
                if (inviteeData.length < BATCH_SIZE) {
                    inviteeData.push(fileData);
                } else {
                    inviteeData.push(fileData); // Push latest one
                    // Handle and reset dataList
                    const results = await Invite.inviteCSVList(
                        inviteeData,
                        data
                    );
                    logger.print(JSON.stringify(results));
                    inviteeData.splice(0, BATCH_SIZE);
                }
            }
            // Remove file after use
            fs.unlink(file.path, (err) => {
                if (err) logger.err(JSON.stringify(err));
            });
            if (inviteeData.length > 0) {
                // Handle any remaining data
                const results = await Invite.inviteCSVList(inviteeData, data);
                logger.print(JSON.stringify(results));
            }
            res.status(200).send();
        } catch (e) {
            if (file) {
                // Remove file after use
                fs.unlink(file.path, (err) => {
                    if (err) logger.err(JSON.stringify(err));
                });
            }
            logger.err(e);
            next(e);
        }
    }
);

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
