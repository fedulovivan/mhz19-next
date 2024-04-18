/* eslint-disable no-plusplus */

import Express, { Router } from 'express';
import first from 'lodash/first';
import set from 'lodash/set';

import db, {
    createOrUpdateDeviceCustomAttribute,
    fetchDeviceCustomAttributes,
    fetchDeviceMessagesUnified,
    fetchSonoffDevices,
    fetchStats,
    fetchValveStatusMessages,
    fetchYeelightDeviceMessages,
    fetchYeelightDevices,
    fetchZigbeeDevicesV2,
} from 'src/db';
import * as lastDeviceState from 'src/lastDeviceState';
import logger from 'src/logger';
import mqttClient from 'src/mqttClient';
import { actionsExecutor } from 'src/server';
import type { IDeviceCustomAttribute, TOnOff } from 'src/typings';
import {
    asyncTimeout,
    exec2,
    getAppUrl,
    getOptInt,
    mqttMessageDispatcher,
    playAlertSingle,
    postSonoffSwitchMessage,
    sendError,
    uptime,
} from 'src/utils';

const router: Router = Express.Router();

// const powerOff = () => new Promise((resolve, reject) => {
//     exec(`sudo systemctl poweroff`, (error, stdout, stderr) => {
//         if (error) reject(error);
//         resolve([stdout, stderr]);
//     });
// });

router.get('/stats', async (req, res) => {
    try {
        const uptimeData = await uptime();
        const actionsExecutorStats = actionsExecutor.getStats();
        res.json({
            actionsExecutor: actionsExecutorStats,
            uptime: uptimeData,
        });
    } catch (e: any) {
        sendError(res, e);
    }
});

router.get('/play-alert', async (req, res) => {
    try {
        const result = await playAlertSingle();
        res.json(result);
    } catch (e: any) {
        sendError(res, e);
    }
});

router.get('/uptime', async (req, res) => {
    try {
        const result = await uptime();
        res.json(result);
    } catch (e: any) {
        sendError(res, e);
    }
});

router.post('/poweroff', async (req, res) => {
    try {
        const result = await exec2(`sudo systemctl poweroff`);
        res.json(result);
    } catch (e: any) {
        sendError(res, e);
    }
});

router.put('/valve-state/:id/:state', async (req, res) => {
    mqttClient.publish(`/VALVE/${req.params.id}/STATE/SET`, req.params.state);
    res.json();
});

router.get('/valve-state', async (req, res) => {
    try {
        const rows = await fetchValveStatusMessages(
            getOptInt(<string>req.query.historyWindowSize)
        );
        res.json(rows);
    } catch (e: any) {
        sendError(res, e);
    }
});

router.get('/device-messages-unified', async (req, res) => {
    try {
        const rows = await fetchDeviceMessagesUnified(
            getOptInt(<string>req.query.historyWindowSize),
            <string>req.query.deviceId,
        );
        res.json(rows);
    } catch (e: any) {
        sendError(res, e);
    }
});

router.get('/last-device-messages/:deviceId?', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const rows = lastDeviceState.toJSON();
        res.json(
            deviceId?.length
                ? rows.find(row => row.deviceId === deviceId) ?? null
                : rows
        );
    } catch (e: any) {
        sendError(res, e);
    }
});

router.get('/yeelight-device-messages', async (req, res) => {
    try {
        const rows = await fetchYeelightDeviceMessages(
            getOptInt(<string>req.query.historyWindowSize),
            <string>req.query.deviceId,
            getOptInt(<string>req.query.commandId),
        );
        res.json(rows);
    } catch (e: any) {
        sendError(res, e);
    }
});

router.get('/zigbee-devices', async (req, res) => {
    try {
        const rows = await fetchZigbeeDevicesV2();
        res.json(rows);
    } catch (e: any) {
        sendError(res, e);
    }
});

router.get('/yeelight-devices', async (req, res) => {
    try {
        const rows = await fetchYeelightDevices();
        res.json(rows);
    } catch (e: any) {
        sendError(res, e);
    }
});

router.get('/sonoff-devices', async (req, res) => {
    try {
        const rows = await fetchSonoffDevices();
        res.json(rows);
    } catch (e: any) {
        sendError(res, e);
    }
});

router.get('/device-custom-attributes', async (req, res) => {
    try {
        const result = await fetchDeviceCustomAttributes();
        res.json(result);
    } catch (e: any) {
        sendError(res, e);
    }
});

router.post('/device-custom-attributes/:deviceId/:attributeType', async (req, res) => {
    try {
        const { deviceId, attributeType } = req.params as unknown as IDeviceCustomAttribute;
        const { value } = req.body;
        const result = await createOrUpdateDeviceCustomAttribute({
            deviceId,
            attributeType,
            value,
        });
        res.json(result);
    } catch (e: any) {
        sendError(res, e);
    }
});

router.put('/sonoff-device/:deviceId/switch', async (req, res) => {
    const { deviceId } = req.params;
    const { state } = req.body;
    try {
        const result = await postSonoffSwitchMessage(
            state as TOnOff,
            deviceId
        );
        res.json(result);
    } catch (e: any) {
        sendError(res, e);
    }
});

// router.put('/yeelight-device/:deviceId/:state', async (req, res) => {
//     try {
//         const { deviceId, state } = req.params;
//         const { commandId } = req.body;
//         const device = yeelightDevices.get(deviceId);
//         if (!device) {
//             return sendError(res, `yeelight device ${deviceId} is not registered\n${new Error().stack}`);
//         }
//         debug(`calling set_power state=${state} on device ${deviceId}`);
//         device.sendCommand({
//             id: commandId,
//             method: 'set_power',
//             params: [state, 'smooth', 0],
//         });
//         await asyncTimeout(100);
//         const lastMessages = await fetchYeelightDeviceMessages(
//             undefined,
//             deviceId,
//             commandId
//         );
//         res.json(lastMessages);
//     } catch (e: any) {
//         sendError(res, e);
//     }
// });

router.get('/stats', async (req, res) => {
    try {
        const result = await fetchStats();
        res.json(result);
    } catch (e: any) {
        sendError(res, e);
    }
});

export default router;

// router.get('/temperature-sensor-messages', async (req, res) => {
//     try {
//         const rows = await fetchTemperatureSensorMessages(
//             getOptInt(<string>req.query.historyWindowSize)
//         );
//         res.json(rows);
//     } catch (e: any) {
//         sendError(res, e);
//     }
// });
