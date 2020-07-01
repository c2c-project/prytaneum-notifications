export default (function () {
    let initialized = false;

    const throwIfNotInitialized = () => {
        if (!initialized) {
            throw new Error('Not yet connected to DB');
        }
    };

    return {
        isInitialized() {
            return initialized;
        },
        async getUnsubList() {
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
        async subscribeUser(data: Array<any>) {
            throwIfNotInitialized();
            console.log('Subscribing user.');
            return;
        },
    };
})();
