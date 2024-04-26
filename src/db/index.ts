/**
 * its important to have import directive without from
 * this is required to resolve circular dependency between model file and conn
 *
 */
import './Device';
import './DeviceCustomAttribute';
import './Message';

import { withDebug } from 'src/logger';
import type { ISonoffDevice } from 'src/typings';

import conn from './conn';

// import DeviceCustomAttribute from './DeviceCustomAttribute';
// import Message from './Message';

const debug = withDebug('db-next-mock');

/** @deprecated */
export const createOrUpdateSonoffDevice = async (...args: Array<any>) => debug('createOrUpdateSonoffDevice', args);
/** @deprecated */
export const createOrUpdateZigbeeDevice = async (...args: Array<any>) => debug('createOrUpdateZigbeeDevice', args);
/** @deprecated */
export const fetchDeviceCustomAttributes = async (...args: Array<any>) => {
    debug('fetchDeviceCustomAttributes', args);
    return [];
};
/** @deprecated */
export const insertIntoValveStatusMessages = async (...args: Array<any>) => debug('insertIntoValveStatusMessages', args);
/** @deprecated */
export const fetchSonoffDevices = async (...args: Array<any>): Promise<Array<ISonoffDevice>> => {
    debug('fetchSonoffDevices', args);
    return [];
};
/** @deprecated */
export const insertIntoDeviceMessagesUnified = async (...args: Array<any>) => debug('insertIntoDeviceMessagesUnified', args);
/** @deprecated */
export const createOrUpdateDeviceCustomAttribute = async (...args: Array<any>) => debug('createOrUpdateDeviceCustomAttribute', args);
/** @deprecated */
export const fetchDeviceMessagesUnified = async (...args: Array<any>) => debug('fetchDeviceMessagesUnified', args);
/** @deprecated */
export const fetchStats = async (...args: Array<any>) => debug('fetchStats', args);
/** @deprecated */
export const fetchValveStatusMessages = async (...args: Array<any>) => debug('fetchValveStatusMessages', args);
/** @deprecated */
export const fetchYeelightDeviceMessages = async (...args: Array<any>) => debug('fetchYeelightDeviceMessages', args);
/** @deprecated */
export const fetchYeelightDevices = async (...args: Array<any>) => debug('fetchYeelightDevices', args);
/** @deprecated */
export const fetchZigbeeDevicesV2 = async (...args: Array<any>) => debug('fetchZigbeeDevicesV2', args);

export default conn;
