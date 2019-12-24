export abstract class RpcBase {

    requestIdSequence: number = 0;

    responsePromiseResolvers: Map<number, (params: object) => void> = new Map();

    methodHandlers: Map<string, (params: object) => Promise<object|void>> = new Map();

    respondTo(name: string, handler: (params: object) => Promise<object|void>): void {
        this.methodHandlers.set(name, handler);
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

export const EVENT_RPC_REQUEST = 'rpc-request';
export const EVENT_RPC_RESPONSE = 'rpc-response';

export const METHOD_GET_BOOTSTRAP_DATA = 'methodGetBootstrapData';
export const METHOD_ADD_MHZ_DOC = 'methodAddMhzDoc';
export const METHOD_SET_DEVICE_STATE = 'methodSetDeviceState';
