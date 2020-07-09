import { Collection } from 'mongodb';

import initNotifications, { NotificationDoc } from './notifications';
import { connectToMongo } from './mongo';

/**
 * re-export anything from the collection files
 */
export { close } from './mongo';
export { NotificationDoc } from './notifications';

/**
 * declare collections here, they won't be undefined before being called
 * guaranteed by calling connect on startup before we ever use any collections
 */
let Notifications: Collection<NotificationDoc>;

/**
 * connects to mongo and initializes db
 */
export async function connect(): Promise<void> {
	await connectToMongo();
	Notifications = initNotifications();
}

export default {
	Notifications: (): Collection<NotificationDoc> => Notifications,
};
