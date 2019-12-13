import Express from 'express';

import {
    queryMhzDocs,
} from './db';

import {
    sendError
} from './utils';

const router = Express.Router();

router.get('/mhz', async (req, res) => {
    try {
        const result = await queryMhzDocs(parseInt(req.query.historyOption, 10));
        res.json(result);
    } catch (e) {
        sendError(res, e);
    }
})

export default router;