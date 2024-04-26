/**
 * see /Users/ivanf/Desktop/Projects/branches/trunk_58894/frontend/lib/sqlite/models/localUpload.ts
 */

import {
    DataTypes,
    Model,
    ModelStatic,
} from 'sequelize';

import type { ISonoffDevice } from 'src/typings';

import { DeviceClass } from '../constants';
import conn from './conn';

export interface DeviceFields {
    device_id: string;
    device_class: DeviceClass;
    json?: Record<string, any>;
}

export type IDeviceModel = Model<
    DeviceFields
>;

const model: ModelStatic<IDeviceModel> = conn.define(
    'Device', {
        device_id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
        device_class: { type: DataTypes.STRING, allowNull: false },
        json: { type: DataTypes.JSON },
    }, {
        timestamps: true,
        underscored: true,
    }
);

export default model;
