import express from 'express';
import Papa from 'papaparse';

import { ClientError } from 'lib/errors';
import Notifications from '../lib/notificaitons';
import Invite from '../modules/invite';
import Subscribe from '../modules/subscribe';

import env from '../config/env';
import logger from '../lib/logger';

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
    deliveryTime?: string; // ISO format
}

router.post('/invite', (req, res, next) => {
    try {
        // Get headers and ensure they are all defined & that deliveryTime is valid
        const MoC = req.headers.moc as string | undefined;
        const topic = req.headers.topic as string | undefined;
        const eventDateTime = req.headers.eventdatetime as string | undefined;
        const constituentScope = req.headers.constituentscope as
            | string
            | undefined;
        const region = req.headers.region as string | undefined;
        const deliveryTimeHeader = req.headers.deliverytime as
            | string
            | undefined;
        if (
            MoC === undefined ||
            topic === undefined ||
            eventDateTime === undefined ||
            constituentScope === undefined ||
            region === undefined
        )
            throw new ClientError('Undefined Header Data');
        // Check deliveryTime
        let deliveryTime: Date;
        if (deliveryTimeHeader === undefined) {
            // Deliver right away by default if no deliveryTime is given
            deliveryTime = new Date(Date.now());
            if (env.NODE_ENV === 'test') {
                res.status(200).send(deliveryTime.toISOString());
                return;
            }
        } else if (Number.isNaN(Date.parse(deliveryTimeHeader))) {
            // Check if the ISO format is valid by parsing string, returns NaN if invalid
            throw new ClientError('Invalid ISO Date format');
        } else {
            // Delivery time is set to the time given
            deliveryTime = new Date(deliveryTimeHeader);
        }
        // Construct csvString from stream buffer
        let csvString = '';
        req.on('data', (data) => {
            csvString += data;
        });
        req.on('end', () => {
            async function invite() {
                try {
                    // Parse the csvString
                    const result = Papa.parse(csvString, {
                        header: true,
                    });
                    const inviteeList = result.data as Array<InviteeData>; // Validate these fields on frontend
                    const unsubSet = new Set(
                        await Notifications.getUnsubList(region as string) // Checked if undefined earlier
                    );
                    const filteredInviteeList = inviteeList.filter(
                        (item: InviteeData) => {
                            return !unsubSet.has(item.email);
                        }
                    );
                    if (filteredInviteeList.length === 0) {
                        res.status(400).send('No valid invitees');
                        // throw new ClientError('No valid invitees') // TODO FIX
                    }
                    const results = await Invite.inviteMany(
                        filteredInviteeList,
                        MoC as string, // Checked if undefined earlier
                        topic as string,
                        eventDateTime as string,
                        constituentScope as string,
                        deliveryTime
                    );
                    logger.print(JSON.stringify(results));
                    res.status(200).send();
                } catch (e) {
                    logger.err(e);
                }
            }
            // eslint-disable-next-line no-void
            void invite();
        });
    } catch (e) {
        logger.err(e);
        next(e);
    }
});

export interface SubscribeData {
    email: string;
    region: string;
}

router.post('/subscribe', async (req, res, next) => {
    try {
        const data = req.body as SubscribeData;
        if (data.email === undefined || data.region === undefined) {
            throw new ClientError('Invalid Data');
        }
        const isSubscribed = await Notifications.isSubscribed(
            data.email,
            data.region
        );
        if (isSubscribed) {
            res.status(400).send('Already subscribed');
            // throw new ClientError('Already subscribed.'); // TODO FIX
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
            throw new ClientError('Invalid Data');
        }
        const isUnsubscribed = await Notifications.isUnsubscribed(
            data.email,
            data.region
        );
        if (isUnsubscribed) {
            res.status(400).send('Already unsubscribed');
            // throw new ClientError('Already unsubscribed'); // TODO FIX
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
