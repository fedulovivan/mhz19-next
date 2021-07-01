
import RpcClient from 'src/rpc/rpcClient';
import { METHOD_GET_MHZ_DOCS } from 'src/rpc';

import {
    GET_MHZ_DOCS_PENDING,
    GET_MHZ_DOCS_SUCCEED,
    GET_MHZ_DOCS_FAILED,
    SET_HISTORY_OPTION,
} from 'src/react/actionTypes';

export const getMhzDocs = (historyOption: number) => async (dispatch: DispatchWithoutAction, rpcClient: RpcClient) => {
    dispatch({ type: SET_HISTORY_OPTION, payload: { historyOption } });
    dispatch({ type: GET_MHZ_DOCS_PENDING });
    const responsePayload = await rpcClient.call(METHOD_GET_MHZ_DOCS, { historyOption });
    if (responsePayload.error) {
        return dispatch({ type: GET_MHZ_DOCS_FAILED });
    }
    return dispatch({ type: GET_MHZ_DOCS_SUCCEED, payload: responsePayload });
};
