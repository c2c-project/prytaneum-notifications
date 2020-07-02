import { Collection, ObjectId } from 'mongodb';
import Mongo from './mongo';

export interface NotificationDoc {
    _id?: ObjectId;
}

export default (function () {
    let initialized = false;
    let collection: Collection<NotificationDoc>;

    const throwIfNotInitialized = () => {
        if (!initialized) {
            throw new Error('Not yet connected to DB');
        }
    };

    return {
        isInitialized(): Boolean {
            return initialized;
        },
        async init(): Promise<void> {
            if (!initialized) {
                collection = await Mongo.collection<NotificationDoc>(
                    'notifications'
                );
                initialized = true;
            }
        },
        async getUnsubList(): Promise<Array<string>> {
            throwIfNotInitialized();
            return ['email@example.com'];
        },
        async addToUnsubList(email: string) {
            throwIfNotInitialized();
            console.log(`Adding ${email} to unsub list.`);
            return;
        },
        async removeFromUnsubList(email: string) {
            throwIfNotInitialized();
            console.log(`Removing ${email} from unsub list.`);
            return;
        },
        async subscribeUser(data: any) {
            throwIfNotInitialized();
            console.log('Subscribing user.');
            return;
        },
    };
})();
