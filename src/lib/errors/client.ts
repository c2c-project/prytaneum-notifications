/**
 * Use this if you DO want to send the error message back to the client
 */

export default class ClientError extends Error {
    internalError: string;

    name: string;

    constructor(clientMessage: string, serverMessage = '') {
        super(clientMessage);
        this.name = 'ClientError';
        this.internalError = `${serverMessage}`;
    }
}
