/// <reference types="socket.io" />

/* eslint-disable no-console */

import { EVENT_RPC_RESPONSE } from './index';

export default abstract class RpcBase {

    requestIdSequence: number = 0;

    responsePromiseResolvers: Map<number, (params: object) => void> = new Map();

    methodHandlers: Map<string, (params: object) => Promise<object|void>> = new Map();

    respondTo(name: string, handler: (params: object) => Promise<object|void>): void {
        this.methodHandlers.set(name, handler);
    }

    rpcResponseHandler(name: string, id: number, params: object) {
        const resolver = this.responsePromiseResolvers.get(id);
        if (resolver) {
            console.log('rpc response received', name, params);
            resolver(params);
        }
    }

    rpcRequestHandler(
        socket: SocketIo.Socket | SocketIOClient.Socket,
        name: string,
        id: number,
        requestPayload: object
    ) {
        console.log('rpc request received:', name, requestPayload);
        const handler = this.methodHandlers.get(name);
        if (handler) {
            handler(requestPayload).then((response) => {
                socket.emit(EVENT_RPC_RESPONSE, name, id, response);
            });
        }
    }

    abstract emitRequest(methodName: string, requestId: number, params: object): void;

    async call(methodName: string, params: object) {
        return new Promise((resolve) => {
            this.requestIdSequence += 1;
            const requestId = this.requestIdSequence;
            this.emitRequest(methodName, requestId, params);
            this.responsePromiseResolvers.set(requestId, resolve);
        });
    }

}
