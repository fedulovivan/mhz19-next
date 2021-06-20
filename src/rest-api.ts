import Express from 'express';
import first from 'lodash/first';

import { queryConfigDocs, queryMhzDocs } from 'src/db';
import db from 'src/db2';
import mqttClient from 'src/mqttClient';
import { sendError } from 'src/utils';

const router = Express.Router();

router.put('/valve-state/:state', async (req, res) => {
    mqttClient.publish(`/VALVE/STATE/SET`, req.params.state);
    res.json();
});

router.get('/valve-state/get-last', async (req, res) => {
    db.all(`SELECT * FROM valve_status_messages ORDER BY timestamp DESC LIMIT 1`, (error, rows) => {
        if (error) return sendError(res, error);
        res.json(first(rows));
    });
});

router.get('/valve-state', async (req, res) => {
    db.all(`SELECT * FROM valve_status_messages`, (error, rows) => {
        if (error) return sendError(res, error);
        res.json(rows);
    });
});

// router.get('/temperature-sensor-messages', async (req, res) => {
//     res.json([]);
//     // db.all(`SELECT * FROM temperature_sensor_messages ORDER BY timestamp DESC LIMIT 10`, (error, rows) => {
//     //     if (error) return sendError(res, error);
//     //     res.json(rows);
//     // });
// });

router.get('/zigbee-devices', async (req, res) => {
    db.all(`SELECT * FROM zigbee_devices`, (error, rows) => {
        if (error) return sendError(res, error);
        res.json(rows);
    });
});

router.get('/device-messages-unified', async (req, res) => {
    db.all(`SELECT * FROM device_messages_unified ORDER BY timestamp DESC`, (error, rows) => {
        if (error) return sendError(res, error);
        res.json(rows.map(({ json, ...rest }) => ({
            ...rest,
            ...JSON.parse(json),
        })));
    });
});

// router.get('/mhz-docs', async (req, res) => {
//     try {
//         const result = await queryMhzDocs(parseInt(req.query.historyOption, 10));
//         res.json(result);
//     } catch (e) {
//         sendError(res, e);
//     }
// });

// router.get('/configs-docs', async (req, res) => {
//     try {
//         const result = await queryConfigDocs();
//         res.json(result);
//     } catch (e) {
//         sendError(res, e);
//     }
// });

export default router;
