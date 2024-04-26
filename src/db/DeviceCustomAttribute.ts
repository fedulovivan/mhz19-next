/**
 * see /Users/ivanf/Desktop/Projects/branches/trunk_58894/frontend/lib/sqlite/models/localUpload.ts
 */

import {
    DataTypes,
    Model,
    ModelStatic,
} from 'sequelize';

import conn from './conn';

export interface DeviceCustomAttributeFields {
    device_id: string;
    attribute_type: string;
    value?: string;
}

export type IDeviceCustomAttributeModel = Model<
    DeviceCustomAttributeFields
>;

const model: ModelStatic<IDeviceCustomAttributeModel> = conn.define(
    'DeviceCustomAttribute', {
        device_id: { type: DataTypes.STRING, allowNull: false },
        attribute_type: { type: DataTypes.STRING, allowNull: false },
        value: { type: DataTypes.STRING },
    }, {
        timestamps: false,
        underscored: true,
    }
);

export default model;
