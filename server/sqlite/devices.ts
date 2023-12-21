// import {
//     DataTypes,
//     Model,
//     ModelStatic,
//     Optional,
// } from 'sequelize';

// import conn from './';

// export interface LocalUploadModelAttributes {
//     // id: number;
//     // containerId: string;
//     // sourceFilename: string;
//     // sourceFileSize: number;
//     // targetFilename: string;
//     // targetFilePath: string;
//     // targetFileSize: number;
//     // createdAt: string;
//     // updatedAt: string;
//     // deletedAt: string;
//     // temporary: boolean;
//     // migrated: boolean;
//     // host: string;
//     // remotePath: string;
// }

// export type IFileStorageModel = Model<
//     LocalUploadModelAttributes,
//     Optional<LocalUploadModelAttributes, "id" | "createdAt" | "updatedAt" | "deletedAt">
// >;

// const model: ModelStatic<IFileStorageModel> = conn?.define(
//     'LocalUpload', {
//         id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//         containerId: { type: DataTypes.STRING, allowNull: false },
//         sourceFilename: { type: DataTypes.STRING, allowNull: false },
//         sourceFileSize: { type: DataTypes.INTEGER, allowNull: false },
//         targetFilename: { type: DataTypes.STRING, allowNull: false },
//         targetFilePath: { type: DataTypes.STRING, allowNull: false, unique: true },
//         targetFileSize: { type: DataTypes.INTEGER, allowNull: false },
//         fieldname: { type: DataTypes.STRING, allowNull: false },
//         temporary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: 0 },
//         migrated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: 0 },
//         host: DataTypes.STRING,
//         remotePath: DataTypes.STRING,
//     }, {
//         timestamps: true,
//         paranoid: true
//     }
// );

// export default model;
