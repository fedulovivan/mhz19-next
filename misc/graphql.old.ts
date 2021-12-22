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

const graphql = require('graphql');

const schemaFileString = readFileSync('src/api/schema.gql').toString('utf8');
const graphqlSchema = buildSchema(schemaFileString);

/* https://marmelab.com/blog/2017/09/06/dive-into-graphql-part-iii-building-a-graphql-server-with-nodejs.html */
const rootReslover = {
    valveStatusMessages: (args: any) => fetchValveStatusMessages(
        args.historyWindowSize,
        args.origin,
    ),
    deviceMessagesUnified: (args: any) => fetchDeviceMessagesUnified(args.historyWindowSize, args.deviceId),
    zigbeeDevices: async (args: any) => fetchZigbeeDevices(undefined, args.historyWindowSize),
    zigbeeDevice: (args: any) => fetchZigbeeDevices(args.deviceId).then(rows => first(rows)),
    ping: () => `ponged at ${(new Date()).toISOString()}`,
    ZigbeeDevice: {
        messages: (parent, args, context, info) => {
            return [{ device_id: '1', timestamp: 123123 }];
        },
    },
};

export default graphqlHTTP({
    schema: graphqlSchema,
    graphiql: true,
    rootValue: rootReslover,
});

// const graphqlSchema = new graphql.GraphQLSchema({
//     query: new graphql.GraphQLObjectType({
//         name: 'Query',
//         fields: {
//             ping: {
//                 type: graphql.GraphQLString,
//                 resolve: () => 'pong',
//             },
//             devices: {
//                 type: new graphql.GraphQLList(new graphql.GraphQLObjectType({
//                     name: 'Device',
//                     fields: {
//                         name: {
//                             type: graphql.GraphQLString,
//                         },
//                         messages: {
//                             type: new graphql.GraphQLList(graphql.GraphQLString)
//                         }
//                     }
//                 })),
//                 resolve: () => ([{ name: 'foo' }])
//             }
//         }
//     })
// });