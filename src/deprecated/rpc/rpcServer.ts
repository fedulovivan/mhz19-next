import Debug from 'debug';
// eslint-disable-next-line no-unused-vars
import http from 'http';
import SocketIo from 'socket.io';

import { APP_HOST, APP_PORT } from 'src/constants';

import {
  EVENT_RPC_REQUEST,
  EVENT_RPC_RESPONSE,
  RpcBase,
} from './index';

const debug = Debug('mhz19-rpc-server');

export default class RpcServer extends RpcBase {

    socketIoServer: SocketIo.Server;

    constructor(httpServer: http.Server) {
        super();
        this.socketIoServer = SocketIo(httpServer, { origins: `http://${APP_HOST}:${APP_PORT}` });
        this.socketIoServer.on('connection', (serverSocket) => {
            debug(`new ws connection id=${serverSocket.id}`);
            serverSocket.on(
                EVENT_RPC_REQUEST,
                (name: string, id: number, requestPayload: object) => this.rpcRequestHandler(
                    serverSocket, name, id, requestPayload
                )
            );
            serverSocket.on(EVENT_RPC_RESPONSE, this.rpcResponseHandler.bind(this));
        });
    }

    emitRequest(name: string, requestId: number, params: object): void {
        this.socketIoServer.emit(EVENT_RPC_REQUEST, name, requestId, params);
    }

}
