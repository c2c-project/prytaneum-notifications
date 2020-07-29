type Status =
    | 'CONNECTED'
    | 'DISCONNECTED'
    | 'RETRYING'
    | 'FAILED'
    | 'CONNECTING'
    | 'UNINITIALIZED';
const statusTable: { [index: string]: Status } = {};
export default {
    info: console.log,
    error: console.error,
    warn: console.warn,
    status(key: string, value: Status): void {
        this.info('\n***STATUS UPDATE***');
        this.info(`${key}: ${statusTable[key]} to ${value}`);
        statusTable[key] = value;
        this.info('***FULL TABLE***');
        this.info(statusTable, '\n');
    },
    initStatus(keys: string[]): void {
        for (let i = 0; i < keys.length; i += 1) {
            statusTable[keys[i]] = 'UNINITIALIZED';
        }
    },
};
