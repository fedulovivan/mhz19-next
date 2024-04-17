/**
 * see /Users/ivanf/Desktop/Projects/branches/trunk_58894/frontend/lib/sqlite/models/localUpload.ts
 */

import {
    DataTypes,
    Model,
    ModelStatic,
} from 'sequelize';

import conn from 'src/sqlite/conn';

export interface MessageAttributes {
    device_id: string;
    device_class_id: number;
    timestamp: Date;
    json: object | null;
}

export type IMessageModel = Model<
    MessageAttributes
>;

const model: ModelStatic<IMessageModel> = conn.define(
    'Message', {
        device_id: { type: DataTypes.STRING, allowNull: false },
        device_class_id: { type: DataTypes.NUMBER, allowNull: false },
        timestamp: { type: DataTypes.DATE, allowNull: false },
        json: { type: DataTypes.JSON, allowNull: true },
    }, {
        timestamps: false,
        underscored: true,
    }
);

export default model;
