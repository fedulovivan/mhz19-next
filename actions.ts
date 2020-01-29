
import { METHOD_GET_MHZ_DOCS } from 'app/rpc';

import {
    GET_MHZ_DOCS_PENDING,
    GET_MHZ_DOCS_SUCCEED,
    GET_MHZ_DOCS_FAILED,
    SET_HISTORY_OPTION,
} from 'app/actionTypes';

export const getMhzDocs = (historyOption) => async (dispatch, rpcClient) => {
    dispatch({ type: SET_HISTORY_OPTION, payload: { historyOption } });
    dispatch({ type: GET_MHZ_DOCS_PENDING });
    const responsePayload = await rpcClient.call(METHOD_GET_MHZ_DOCS, { historyOption });
    if (responsePayload.error) {
        return dispatch({ type: GET_MHZ_DOCS_FAILED });
    }
    return dispatch({ type: GET_MHZ_DOCS_SUCCEED, payload: responsePayload });
};
