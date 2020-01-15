/* eslint-disable import/no-mutable-exports */
/* eslint-disable global-require */

import RpcBase from './rpcBase';

// import RpcServer from './rpcServer';
// import RpcClient from './rpcClient';

// export { default as RpcBase } from './rpcBase';
// export { default as RpcServer } from './rpcServer';
// export { default as RpcClient } from './rpcClient';

let RpcServer = null;
let RpcClient = null;

if (window) {
    RpcClient = require('./rpcClient');
}

if (process) {
    RpcServer = require('./rpcServer');
}

export { RpcBase, RpcServer, RpcClient };

export const EVENT_RPC_REQUEST = 'rpc-request';
export const EVENT_RPC_RESPONSE = 'rpc-response';

export const METHOD_GET_BOOTSTRAP_DATA = 'methodGetBootstrapData';
export const METHOD_ADD_MHZ_DOC = 'methodAddMhzDoc';
export const METHOD_SET_DEVICE_STATE = 'methodSetDeviceState';
