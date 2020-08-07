import { Collection, ObjectId } from 'mongodb';
import { getCollection } from './mongo';

export interface MetaData {
    name: string;
    lastModified: string; // UTC Format
    size: number; // Size in bytes
    sentDateTime: string; // UTC Format
}

export interface NotificationDoc {
    _id: ObjectId;
    region: string;
    unsubscribeList: Array<string>;
    subscribeList: Array<string>;
    inviteHistory: Array<MetaData>;
}

export default (): Collection<NotificationDoc> =>
    getCollection<NotificationDoc>('notifications');
