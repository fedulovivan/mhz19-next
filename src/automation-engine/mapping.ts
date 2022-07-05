import {
    BEDROOM_CEILING_LIGHT,
    DEVICE_NAME_TO_ID,
    IKEA_ONOFF_SWITCH,
    KITCHEN_CEILING_LIGHT,
    KITCHEN_UNDERCABINET_LIGHT,
    WALL_SWITCH_BEDROOM,
    WALL_SWITCH_KITCHEN,
} from 'src/constants';

import {
    IMappings,
    OutputAction,
    PayloadConditionFunction,
} from './types.d';

const mappings: IMappings = [

    // mapping 05
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

    // mapping 04
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

    // mapping 03
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

    // mapping 02
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

    // mapping 01
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
            type: OutputAction.Zigbee2MqttSetState,
            deviceId: '0x00158d000391f252',
            payloadData: "$message.action",
        }, {
            type: OutputAction.Zigbee2MqttSetState,
            deviceId: '0x00158d0003a010a5',
            payloadData: "$message.action",
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
