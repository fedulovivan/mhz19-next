/**
 * graphql server middleware for express
 */

/* eslint-disable no-param-reassign */

import type { IResolvers } from '@graphql-tools/utils';
import { ApolloServerPluginLandingPageDisabled } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import { readFileSync } from 'fs';

import { DEVICE_NAME_TO_ID, TEMPERATURE_SENSOR } from 'src/constants';
import {
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
} from 'src/db';

const typeDefs = readFileSync('src/api/schema.gql').toString('utf8');

interface IMyContext {
    deviceMessagesUnified: Array<any>;
    deviceCustomAttributes: Record<string, string>;
    yeelightDeviceMessages: Array<any>;
}

const rootContext = async () => {
    const deviceCustomAttributes = toMap(await fetchDeviceCustomAttributes());
    return { deviceCustomAttributes };
};

// https://www.apollographql.com/docs/apollo-server/data/resolvers/
const resolvers: IResolvers<any, IMyContext> = {
    Query: {
        ping: () => ('pong'),
        zigbeeDevices: async (parent, args, context, info) => {
            context.deviceMessagesUnified = await fetchDeviceMessagesUnified(
                args.historyWindowSize,
            );
            return fetchZigbeeDevicesV2();
        },
        deviceMessagesUnified: (parent, args, context, info) => {
            return fetchDeviceMessagesUnified(
                args.historyWindowSize,
                args.deviceId,
            );
        },
        valveStatusMessages: (parent, args, context, info) => {
            return fetchValveStatusMessages(
                args.historyWindowSize,
                args.origin,
            );
        },
        lastTemperatureMessage: async (parent, args, context, info) => {
            const rows = await fetchDeviceMessagesUnified(
                undefined,
                DEVICE_NAME_TO_ID[TEMPERATURE_SENSOR],
                true
            );
            return rows.length ? rows[0] : null;
        },
        sonoffDevices: async (parent, args, context, info) => {
            return fetchSonoffDevices();
        },
        yeelightDevices: async (parent, args, context, info) => {
            context.yeelightDeviceMessages = await fetchYeelightDeviceMessages(
                args.historyWindowSize
            );
            return fetchYeelightDevices();
        },
        stats: (parent, args, context, info) => fetchStats(),
    },
    ZigbeeDeviceV2: {
        messages: (parent, args, context, info) => {
            return context.deviceMessagesUnified.filter(
                message => message.device_id === parent.ieee_address
            );
        },
        customAttributes: (parent, args, context, info) => {
            return context.deviceCustomAttributes[parent.ieee_address];
        },
    },
    SonoffDevice: {
        customAttributes: (parent, args, context, info) => {
            return context.deviceCustomAttributes[parent.device_id];
        },
    },
    YeelightDevice: {
        messages: (parent, args, context, info) => {
            return context.yeelightDeviceMessages.filter(
                message => message.device_id === parent.id
            );
        },
        customAttributes: (parent, args, context, info) => {
            return context.deviceCustomAttributes[parent.id];
        },
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
        ApolloServerPluginLandingPageDisabled
    ],
    context: rootContext
});

export default server;
