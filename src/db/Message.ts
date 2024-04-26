/**
 * see /Users/ivanf/Desktop/Projects/branches/trunk_58894/frontend/lib/sqlite/models/localUpload.ts
 */

import {
    DataTypes,
    Model,
    ModelStatic,
} from 'sequelize';

import conn from './conn';

export interface MessageFields {
    device_id: string;
    json?: Record<string, any> | null;
}

export type IMessageModel = Model<
    MessageFields
>;

const model: ModelStatic<IMessageModel> = conn.define(
    'Message', {
        device_id: { type: DataTypes.STRING, allowNull: false },
        json: { type: DataTypes.JSON },
    }, {
        timestamps: true,
        underscored: true,
    }
);

export default model;
