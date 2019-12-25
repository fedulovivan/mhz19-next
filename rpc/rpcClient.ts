import SocketIoClient from 'socket.io-client';

import { RpcBase, EVENT_RPC_REQUEST, EVENT_RPC_RESPONSE } from './index';

import {
    APP_HOST,
    APP_PORT,
} from '../constants';

export default class RpcClient extends RpcBase {

    io: SocketIOClient.Socket;

    constructor() {
        super();
        this.io = SocketIoClient(`ws://${APP_HOST}:${APP_PORT}`);
        this.io.on(EVENT_RPC_REQUEST, (name: string, id: number, requestPayload: object) => {
            const handler = this.methodHandlers.get(name);
            if (handler) {
                handler(requestPayload).then((response) => {
                    this.io.emit(EVENT_RPC_RESPONSE, name, id, response);
                });
            }
        });
        this.io.on(EVENT_RPC_RESPONSE, (name: string, id: number, params: object) => {
            const resolver = this.responsePromiseResolvers.get(id);
            if (resolver) {
                console.log('server response received', name, params);
                resolver(params);
            }
        });
    }

    emitRequest(name: string, requestId: number, params: object): void {
        this.io.emit(EVENT_RPC_REQUEST, name, requestId, params);
    }

}
