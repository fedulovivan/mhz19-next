import Express from 'express';
import first from 'lodash/first';
import set from 'lodash/set';

import db, {
  fetchDeviceCustomAttributes,
  fetchDeviceMessagesUnified,
  fetchStats,
  fetchTemperatureSensorMessages,
  fetchYeelightDeviceMessages,
  fetchYeelightDevices,
} from 'src/db2';
import log from 'src/logger';
import mqttClient from 'src/mqttClient';
import { getOptInt, sendError } from 'src/utils';
import yeelightDevices from 'src/yeelightDevices';

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

router.get('/device-messages-unified', async (req, res) => {
    try {
        const rows = await fetchDeviceMessagesUnified(
            getOptInt(<string>req.query.historyWindowSize)
        );
        res.json(rows);
    } catch (e) {
        sendError(res, e);
    }
});

router.get('/yeelight-device-messages', async (req, res) => {
    try {
        const rows = await fetchYeelightDeviceMessages(
            getOptInt(<string>req.query.historyWindowSize)
        );
        res.json(rows);
    } catch (e) {
        sendError(res, e);
    }
});

router.get('/temperature-sensor-messages', async (req, res) => {
    try {
        const rows = await fetchTemperatureSensorMessages(
            getOptInt(<string>req.query.historyWindowSize)
        );
        res.json(rows);
    } catch (e) {
        sendError(res, e);
    }
});

router.get('/zigbee-devices', async (req, res) => {
    db.all(`SELECT * FROM zigbee_devices`, (error, rows) => {
        if (error) return sendError(res, error);
        res.json(rows);
    });
});

router.get('/yeelight-devices', async (req, res) => {
    try {
        const rows = await fetchYeelightDevices();
        res.json(rows);
    } catch (e) {
        sendError(res, e);
    }
});

router.get('/device-custom-attributes', async (req, res) => {
    try {
        const rows = await fetchDeviceCustomAttributes();
        const result = {};
        rows.forEach(row => {
            set(result, `${row.device_id}.${row.attribute_type}`, row.value);
        });
        res.json(result);
    } catch (e) {
        sendError(res, e);
    }
});

router.put('/yeelight-device/:deviceId/:state', async (req, res) => {
    const { deviceId, state } = req.params;
    const device = yeelightDevices.get(deviceId);
    if (!device) {
        return sendError(res, `yeelight device ${deviceId} is not discovered`);
    }
    log.info(`calling set_power state=${state} on device ${deviceId}`);
    device.sendCommand({
        id: -1,
        method: 'set_power',
        params: [state, 'smooth', 0],
    });
    res.json({ ok: true });
});

router.get('/stats', async (req, res) => {
    try {
        const result = await fetchStats();
        res.json(result);
    } catch (e) {
        sendError(res, e);
    }
});

export default router;
