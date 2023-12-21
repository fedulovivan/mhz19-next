/* eslint-disable no-plusplus */

import { exec } from 'child_process';
import Express from 'express';

// import first from 'lodash/first';
// import set from 'lodash/set';
import { KITCHEN_CEILING_LIGHT, KITCHEN_UNDERCABINET_LIGHT } from 'lib/constants';
import type { IDeviceCustomAttribute, TOnOff } from 'lib/typings';

import db, {
    createOrUpdateDeviceCustomAttribute,
    fetchDeviceCustomAttributes,
    fetchDeviceMessagesUnified,
    fetchSonoffDevices,
    fetchStats,
    fetchValveStatusMessages,
    fetchYeelightDeviceMessages,
    fetchYeelightDevices,
    fetchZigbeeDevices,
    fetchZigbeeDevicesV2,
    toMap,
} from '../db';
import { withCategory } from '../logger';
import mqttClient from '../mqttClient';
import conn from '../sqlite';
import {
    asyncTimeout,
    getAppUrl,
    getOptInt,
    postSonoffSwitchMessage,
    sendError,
} from '../utils';

const log = withCategory('mhz19-api-rest');

// import yeelightDevices from 'src/yeelightDevices';

const router = Express.Router();

const powerOff = () => new Promise((resolve, reject) => {
    exec(`sudo systemctl poweroff`, (error, stdout, stderr) => {
        if (error) reject(error);
        resolve([stdout, stderr]);
    });
});

router.post('/poweroff', async (req, res) => {
    try {
        const result = await powerOff();
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
            getOptInt(<string>req.query.historyWindowSize)
        );
        res.json(rows);
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
        const result = toMap(await fetchDeviceCustomAttributes());
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
//         log.info(`calling set_power state=${state} on device ${deviceId}`);
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

// TODO this should not be GET
router.get('/sqlite/force-sync', async (req, res) => {
    try {
        const result = await conn.sync({ force: true });
        res.json(result);
    } catch (e: any) {
        sendError(res, e);
    }
});

log.debug(`rest api started, ${router.stack.length} routes`/* , router */);

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