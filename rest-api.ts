import Express from 'express';

import {
    queryMhzDocs,
    queryConfigDocs,
} from 'app/db';

import {
    sendError
} from 'app/utils';

const router = Express.Router();

router.get('/mhz-docs', async (req, res) => {
    try {
        const result = await queryMhzDocs(parseInt(req.query.historyOption, 10));
        res.json(result);
    } catch (e) {
        sendError(res, e);
    }
});

router.get('/configs-docs', async (req, res) => {
    try {
        const result = await queryConfigDocs();
        res.json(result);
    } catch (e) {
        sendError(res, e);
    }
});

export default router;
