/**
 * see /Users/ivanf/Desktop/Projects/branches/trunk_58894/frontend/lib/sqlite/models/localUpload.ts
 */

import {
    DataTypes,
    Model,
    ModelStatic,
} from 'sequelize';

import conn from './';

export interface MessageAttributes {
    device_id: string;
    timestamp: string;
    json: string;
}

export type IMessageModel = Model<
    MessageAttributes
>;

const model: ModelStatic<IMessageModel> = conn?.define(
    'Message', {
        device_id: { type: DataTypes.STRING, allowNull: false },
        timestamp: { type: DataTypes.NUMBER, allowNull: false },
        json: { type: DataTypes.JSON, allowNull: false },
    }
);

export default model;
