import { Collection, ObjectId } from 'mongodb';
import { getCollection } from './mongo';

export interface NotificationDoc {
    _id: ObjectId;
    region: string;
    unsubscribeList: Array<string>;
}

export default (): Collection<NotificationDoc> =>
    getCollection<NotificationDoc>('Notifications');
