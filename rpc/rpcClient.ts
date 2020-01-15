import SocketIoClient from 'socket.io-client';

import { RpcBase, EVENT_RPC_REQUEST, EVENT_RPC_RESPONSE } from './index';

import {
    APP_HOST,
    APP_PORT,
} from '../constants';

export default class RpcClient extends RpcBase {

    clientSocket: SocketIOClient.Socket;

    constructor() {
        super();
        this.clientSocket = SocketIoClient(`ws://${APP_HOST}:${APP_PORT}`);
        this.clientSocket.on(
            EVENT_RPC_REQUEST,
            (name: string, id: number, requestPayload: object) => this.rpcRequestHandler(
                this.clientSocket,
                name,
                id,
                requestPayload
            )
        );
        this.clientSocket.on(EVENT_RPC_RESPONSE, this.rpcResponseHandler.bind(this));
    }

    emitRequest(name: string, requestId: number, params: object): void {
        this.clientSocket.emit(EVENT_RPC_REQUEST, name, requestId, params);
    }

}
