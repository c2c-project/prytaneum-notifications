import Mongo from './mongo';
import Notifications from './notifications';

export default async function (): Promise<void> {
    await Mongo.init();
    await Notifications.init();
}
