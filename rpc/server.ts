import SocketIo from 'socket.io';
import Debug from 'debug';
// eslint-disable-next-line no-unused-vars
import http from 'http';

import { RpcBase, EVENT_RPC_REQUEST, EVENT_RPC_RESPONSE } from './index';

import {
    APP_HOST,
    APP_PORT,
} from '../constants';

const debug = Debug('mhz-rpc-server');

export default class RpcServer extends RpcBase {

    io: SocketIo.Server;

    constructor(httpServer: http.Server) {
        super();
        this.io = SocketIo(httpServer, { origins: `http://${APP_HOST}:${APP_PORT}` });
        this.io.on('connection', (socket) => {
            debug(`new ws connection id=${socket.id}`);
            socket.on(EVENT_RPC_REQUEST, (name, id, requestPayload) => {
                debug('new rpc-request', name, id, requestPayload);
                const handler = this.methodHandlers.get(name);
                if (handler) {
                    handler(requestPayload).then((response) => {
                        socket.emit(EVENT_RPC_RESPONSE, name, id, response);
                    });
                }
            });
            socket.on(EVENT_RPC_RESPONSE, (name: string, id: number, params: object) => {
                const resolver = this.responsePromiseResolvers.get(id);
                if (resolver) {
                    debug('client response received', name, params);
                    resolver(params);
                }
            });
        });
    }

    emitRequest(name: string, requestId: number, params: object): void {
        this.io.emit(EVENT_RPC_REQUEST, name, requestId, params);
    }

}
