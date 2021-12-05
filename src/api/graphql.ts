/**
 * graphql server middleware for express
 */

import { graphqlHTTP } from 'express-graphql';
import { readFileSync } from 'fs';
import { buildSchema } from 'graphql';
import first from 'lodash';

import {
    fetchDeviceMessagesUnified,
    fetchValveStatusMessages,
    fetchZigbeeDevices,
} from 'src/db';

const schemaFileString = readFileSync('src/api/schema.gql').toString('utf8');
const graphqlSchema = buildSchema(schemaFileString);

const rootReslover = {
    valveStatusMessages: (args: any) => fetchValveStatusMessages(args.historyWindowSize),
    deviceMessagesUnified: (args: any) => fetchDeviceMessagesUnified(args.historyWindowSize, args.deviceId),
    zigbeeDevices: () => fetchZigbeeDevices(),
    zigbeeDevice: (args: any) => fetchZigbeeDevices(args.deviceId).then(rows => first(rows)),
    ping: () => `ponged at ${(new Date()).toISOString()}`,
};

export default graphqlHTTP({
    schema: graphqlSchema,
    rootValue: rootReslover,
    graphiql: true,
});

// const graphqlSchema = buildASTSchema(gql`
//     type Query {
//         ping: String
//         deviceMessagesUnified(historyWindowSize: Int!): [DeviceMessageUnified]
//     }
//     type DeviceMessageUnified {
//         device_id: String
//         timestamp: Float
//     }
// `);
