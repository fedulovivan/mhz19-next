import {
    BEDROOM_CEILING_LIGHT,
    DEVICE_NAME_TO_ID,
    IKEA_ONOFF_SWITCH,
    KITCHEN_CEILING_LIGHT,
    KITCHEN_UNDERCABINET_LIGHT,
    STORAGE_ROOM_ALL_LIGHTS,
    WALL_SWITCH_BEDROOM,
    WALL_SWITCH_KITCHEN,
} from 'lib/constants';

import {
    IMappings,
    OutputAction,
    PayloadConditionFunction,
} from './types';

const mappings: IMappings = [

    // mapping 0
    {
        onZigbeeMessage: {
            deviceId: DEVICE_NAME_TO_ID[WALL_SWITCH_BEDROOM],
            payloadConditions: [{
                field: "$message.action",
                function: PayloadConditionFunction.InList,
                arguments: ["single_left", "single_right"],
            }],
        },
        actions: [{
            type: OutputAction.YeelightDeviceSetPower,
            deviceId: DEVICE_NAME_TO_ID[BEDROOM_CEILING_LIGHT],
            payloadData: "$message.action",
            translation: {
                single_left: 'on',
                single_right: 'off',
            }
        }]
    },

    // mapping 1
    {
        onZigbeeMessage: {
            deviceId: DEVICE_NAME_TO_ID[WALL_SWITCH_KITCHEN],
            payloadConditions: [{
                field: "$message.action",
                function: PayloadConditionFunction.Equal,
                arguments: ["hold_right"],
            }],
        },
        actions: [{
            type: OutputAction.PostSonoffSwitchMessage,
            deviceId: DEVICE_NAME_TO_ID[KITCHEN_UNDERCABINET_LIGHT],
            payloadData: "off",
        }]
    },

    // mapping 2
    {
        onZigbeeMessage: {
            deviceId: DEVICE_NAME_TO_ID[WALL_SWITCH_KITCHEN],
            payloadConditions: [{
                field: "$message.action",
                function: PayloadConditionFunction.Equal,
                arguments: ["hold_left"],
            }],
        },
        actions: [{
            type: OutputAction.PostSonoffSwitchMessage,
            deviceId: DEVICE_NAME_TO_ID[KITCHEN_CEILING_LIGHT],
            payloadData: "off",
        }]
    },

    // mapping 3
    {
        onZigbeeMessage: {
            deviceId: DEVICE_NAME_TO_ID[WALL_SWITCH_KITCHEN],
            payloadConditions: [{
                field: "$message.action",
                function: PayloadConditionFunction.InList,
                arguments: ["single_left", "single_right"],
            }],
        },
        actions: [{
            type: OutputAction.PostSonoffSwitchMessage,
            deviceId: DEVICE_NAME_TO_ID[KITCHEN_CEILING_LIGHT],
            payloadData: "$message.action",
            translation: {
                single_left: 'on',
                single_right: 'off',
            }
        }, {
            type: OutputAction.PostSonoffSwitchMessage,
            deviceId: DEVICE_NAME_TO_ID[KITCHEN_UNDERCABINET_LIGHT],
            payloadData: "$message.action",
            translation: {
                single_left: 'on',
                single_right: 'off',
            }
        }]
    },

    // mapping 4
    {
        onZigbeeMessage: {
            deviceId: DEVICE_NAME_TO_ID[IKEA_ONOFF_SWITCH],
            payloadConditions: [{
                field: "$message.action",
                function: PayloadConditionFunction.InList,
                arguments: ["on", "off"],
            }]
        },
        actions: [{
            type: OutputAction.PostSonoffSwitchMessage,
            deviceId: DEVICE_NAME_TO_ID[STORAGE_ROOM_ALL_LIGHTS],
            payloadData: "$message.action",
        }]
    },

    // mapping 5
    {
        onZigbeeMessage: {
            deviceId: DEVICE_NAME_TO_ID[IKEA_ONOFF_SWITCH],
            payloadConditions: [{
                field: "$message.action",
                function: PayloadConditionFunction.Equal,
                arguments: ["on"],
            }],
        },
        actions: [{
            type: OutputAction.PostSonoffSwitchMessage,
            deviceId: DEVICE_NAME_TO_ID[STORAGE_ROOM_ALL_LIGHTS],
            payloadData: "off",
            delay: 20 * 60 * 1000, // 20 mins
        }]
    },

    // {
    //     onZigbeeMessage: {
    //         deviceId: WALL_SWITCH_BEDROOM,
    //         payloadConditions: [{
    //             value: "$message.action",
    //             function: PayloadConditionFunction.Equal,
    //             arguments: ["single_left"]
    //         }]
    //     },
    //     actions: [{
    //         type: OutputAction.YeelightDeviceSetPower,
    //         deviceId: BEDROOM_CEILING_LIGHT,
    //         payloadData: "on",
    //     }]
    // },

];

export default mappings;
