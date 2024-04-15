import { DEVICE, DEVICE_NAME } from 'src/constants';

import {
    IMappings,
    OutputAction,
    PayloadConditionFunction,
} from './types.d';

const mappings: IMappings = [

    // close both valves if leakage was detected for any of sensors and send bot message
    {
        onZigbeeMessage: {
            srcDevices: [DEVICE.LEAKAGE_SENSOR_TOILET, DEVICE.LEAKAGE_SENSOR_BATHROOM, DEVICE.LEAKAGE_SENSOR_KITCHEN],
            payloadConditions: [{
                field: "$message.water_leak",
                function: PayloadConditionFunction.Equal,
                arguments: [true],
            }]
        },
        actions: [{
            type: OutputAction.TelegramBotMessage,
            payloadData: (message, srcDeviceId, dstDeviceId) => (
                `Leakage detected for ${DEVICE_NAME[srcDeviceId]}`
            ),
        }, {
            type: OutputAction.ValveSetState,
            deviceId: DEVICE.TOILET_VALVES_MANIPULATOR,
            payloadData: "close",
        }, {
            type: OutputAction.ValveSetState,
            deviceId: DEVICE.KITCHEN_VALVES_MANIPULATOR,
            payloadData: "close",
        }]
    },

    // send bot message if leakage event was ceased
    {
        onZigbeeMessage: {
            srcDevices: [DEVICE.LEAKAGE_SENSOR_TOILET, DEVICE.LEAKAGE_SENSOR_BATHROOM, DEVICE.LEAKAGE_SENSOR_KITCHEN],
            payloadConditions: [{
                field: "$message.water_leak",
                function: PayloadConditionFunction.Equal,
                arguments: [false],
            }, {
                field: "$message.water_leak",
                function: PayloadConditionFunction.Changed,
            }]
        },
        actions: [{
            type: OutputAction.TelegramBotMessage,
            payloadData: (message, srcDeviceId, dstDeviceId) => (
                `Leakage ceased for ${DEVICE_NAME[srcDeviceId]}`
            ),
        }]
    },

    // Notify via telegram, when "apple collection door" was opened/closed
    {
        onZigbeeMessage: {
            srcDevices: [DEVICE.SONOFF_DOOR_SENSOR],
            payloadConditions: [{
                field: "$message.contact",
                function: PayloadConditionFunction.InList,
                arguments: [true, false],
            }, {
                field: "$message.contact",
                function: PayloadConditionFunction.Changed,
            }],
        },
        actions: [{
            type: OutputAction.TelegramBotMessage,
            payloadData: (message, srcDeviceId, dstDeviceId) => (
                `Apple collection door is ${(message as any).contact ? 'closed' : 'opened!'} (${DEVICE_NAME[srcDeviceId]})`
            ),
        }]
    },
    
    // Notify via telegram, when "storage room door" was opened/closed
    {
        onZigbeeMessage: {
            srcDevices: [DEVICE.LIFE_CONTROL_DOOR_SENSOR],
            payloadConditions: [{
                field: "$message.contact",
                function: PayloadConditionFunction.InList,
                arguments: [true, false],
            }, {
                field: "$message.contact",
                function: PayloadConditionFunction.Changed,
            }],
        },
        actions: [{
            type: OutputAction.TelegramBotMessage,
            payloadData: (message, srcDeviceId, dstDeviceId) => (
                `Storage room door is ${(message as any).contact ? 'closed' : 'opened!'} (${DEVICE_NAME[srcDeviceId]})`
            ),
        }]
    },
    
    // Notify via telegram, when "money door" was opened/closed
    {
        onZigbeeMessage: {
            srcDevices: [DEVICE.LIFE_CONTROL_DOOR_SENSOR_NEW],
            payloadConditions: [{
                field: "$message.contact",
                function: PayloadConditionFunction.InList,
                arguments: [true, false],
            }, {
                field: "$message.contact",
                function: PayloadConditionFunction.Changed,
            }],
        },
        actions: [{
            type: OutputAction.TelegramBotMessage,
            payloadData: (message, srcDeviceId, dstDeviceId) => (
                `Money door is ${(message as any).contact ? 'closed' : 'opened!'} (${DEVICE_NAME[srcDeviceId]})`
            ),
        }]
    },

    // Toggle vent manually
    {
        onZigbeeMessage: {
            srcDevices: [DEVICE.IKEA_ONOFF_SWITCH],
            payloadConditions: [{
                field: "$message.action",
                function: PayloadConditionFunction.InList,
                arguments: ["on", "off"],
            }]
        },
        actions: [{
            type: OutputAction.PostSonoffSwitchMessage,
            deviceId: DEVICE.STORAGE_ROOM_VENT,
            payloadData: "$message.action",
        }]
    },

    // on vent after door was closed and movement sensor is reporting occupancy and ceiling light is on
    {
        onZigbeeMessage: {
            srcDevices: [DEVICE.LIFE_CONTROL_DOOR_SENSOR],
            payloadConditions: [{
                field: "$message.contact",
                function: PayloadConditionFunction.Equal,
                arguments: [true],
            }, {
                otherDeviceId: DEVICE.MOVEMENT_SENSOR,
                field: "$message.occupancy",
                function: PayloadConditionFunction.Equal,
                arguments: [true],
            }, {
                otherDeviceId: DEVICE.STORAGE_ROOM_CEILING_LIGHT,
                field: "$message.state",
                function: PayloadConditionFunction.Equal,
                arguments: ["ON"],
            }],
        },
        actions: [{
            type: OutputAction.PostSonoffSwitchMessage,
            deviceId: DEVICE.STORAGE_ROOM_VENT,
            payloadData: "on",
        }]
    },       

    // off vent right after movement sensor has reported no occupancy
    // (!) note, there is no need to check door status here
    {
        onZigbeeMessage: {
            srcDevices: [DEVICE.MOVEMENT_SENSOR],
            payloadConditions: [{
                field: "$message.occupancy",
                function: PayloadConditionFunction.Equal,
                arguments: [false],
            }],
        },
        actions: [{
            type: OutputAction.PostSonoffSwitchMessage,
            deviceId: DEVICE.STORAGE_ROOM_VENT,
            payloadData: "off",
        }]
    },
    
    // off vent right after switching ceiling lights off
    {
        onZigbeeMessage: {
            srcDevices: [DEVICE.STORAGE_ROOM_CEILING_LIGHT],
            payloadConditions: [{
                field: "$message.state",
                function: PayloadConditionFunction.Equal,
                arguments: ["OFF"],
            }, {
                field: "$message.state",
                function: PayloadConditionFunction.Changed,
            }],
        },
        actions: [{
            type: OutputAction.PostSonoffSwitchMessage,
            deviceId: DEVICE.STORAGE_ROOM_VENT,
            payloadData: "off",
        }]
    },       

    // on/off storage room ceiling light upon receiving occupancy=true/false from motion sensor
    // note that sensor will send occupancy=false after 90s if no motion will be detected
    // (90s could be altered via property "occupancy_timeout" at http://macmini:7000/#/device/0x00158d000a823bb0/settings-specific)
    {
        onZigbeeMessage: {
            srcDevices: [DEVICE.MOVEMENT_SENSOR],
            payloadConditions: [{
                field: "$message.occupancy",
                function: PayloadConditionFunction.InList,
                arguments: [true, false],
            }],
        },
        actions: [{
            type: OutputAction.Zigbee2MqttSetState,
            deviceId: DEVICE.STORAGE_ROOM_CEILING_LIGHT,
            payloadData: "$message.occupancy",
            translation: {
                true: "ON",
                false: "OFF"
            }
        }]
    },    

    // toggle bedroom ceiling light
    {
        onZigbeeMessage: {
            srcDevices: [DEVICE.WALL_SWITCH_BEDROOM],
            payloadConditions: [{
                field: "$message.action",
                function: PayloadConditionFunction.InList,
                arguments: ["single_left", "single_right"],
            }],
        },
        actions: [{
            type: OutputAction.YeelightDeviceSetPower,
            deviceId: DEVICE.BEDROOM_CEILING_LIGHT,
            payloadData: "$message.action",
            translation: {
                single_left: 'on',
                single_right: 'off',
            }
        }]
    },

];

export default mappings;

// {
//     onZigbeeMessage: {
//         srcDevices: [DEVICE.TOILET_VALVES_MANIPULATOR, DEVICE.KITCHEN_VALVES_MANIPULATOR],
//         payloadConditions: [{
//             field: "$message.leakage",
//             function: PayloadConditionFunction.InList,
//             arguments: [true, false],
//         }]
//     },
//     actions: [{
//         type: OutputAction.TelegramBotMessage,
//         payloadData: (message, srcDeviceId, dstDeviceId) => (
//             JSON.stringify(message)
//         ),
//     }]
// },    
// {
//     type: OutputAction.Zigbee2MqttSetState,
//     deviceId: DEVICE.STORAGE_ROOM_CEILING_LIGHT,
//     payloadData: "ON",
// }    
// mapping 3
// {
//     onZigbeeMessage: {
//         deviceId: DEVICE_NAME_TO_ID[WALL_SWITCH_KITCHEN],
//         payloadConditions: [{
//             field: "$message.action",
//             function: PayloadConditionFunction.InList,
//             arguments: ["single_left", "single_right"],
//         }],
//     },
//     actions: [{
//         type: OutputAction.PostSonoffSwitchMessage,
//         deviceId: DEVICE_NAME_TO_ID[KITCHEN_CEILING_LIGHT],
//         payloadData: "$message.action",
//         translation: {
//             single_left: 'on',
//             single_right: 'off',
//         }
//     }, {
//         type: OutputAction.PostSonoffSwitchMessage,
//         deviceId: DEVICE_NAME_TO_ID[STORAGE_ROOM_VENT],
//         payloadData: "$message.action",
//         translation: {
//             single_left: 'on',
//             single_right: 'off',
//         }
//     }]
// },  

// {
//     onZigbeeMessage: {
//         deviceId: DEVICE.LIFE_CONTROL_DOOR_SENSOR,
//         conditionOperator: 'AND',
//         payloadConditions: [{
//             field: "$message.contact",
//             function: PayloadConditionFunction.InList,
//             arguments: [true, false],
//         }, {
//             otherDeviceId: DEVICE.MOVEMENT_SENSOR,
//             field: "$message.occupancy",
//             function: PayloadConditionFunction.Equal,
//             arguments: [true],
//         }],
//     },
//     actions: [{
//         type: OutputAction.Zigbee2MqttSetState,
//         deviceId: DEVICE.STORAGE_ROOM_CEILING_LIGHT,
//         payloadData: "$message.contact",
//         translation: {
//             true: "ON",
//             false: "OFF"
//         }
//     }]
// },    

// mapping 5
// {
//     onZigbeeMessage: {
//         deviceId: DEVICE_NAME_TO_ID[IKEA_ONOFF_SWITCH],
//         payloadConditions: [{
//             field: "$message.action",
//             function: PayloadConditionFunction.Equal,
//             arguments: ["on"],
//         }],
//     },
//     actions: [{
//         type: OutputAction.PostSonoffSwitchMessage,
//         deviceId: DEVICE_NAME_TO_ID[SONOFF_MINI_PINK_LABEL],
//         payloadData: "off",
//         delay: 20 * 60 * 1000, // 20 mins
//     }]
// },

// mapping 1
// {
//     onZigbeeMessage: {
//         deviceId: DEVICE_NAME_TO_ID[WALL_SWITCH_KITCHEN],
//         payloadConditions: [{
//             field: "$message.action",
//             function: PayloadConditionFunction.Equal,
//             arguments: ["hold_right"],
//         }],
//     },
//     actions: [{
//         type: OutputAction.PostSonoffSwitchMessage,
//         deviceId: DEVICE_NAME_TO_ID[STORAGE_ROOM_VENT],
//         payloadData: "off",
//     }]
// },    

// mapping 2
// {
//     onZigbeeMessage: {
//         deviceId: DEVICE_NAME_TO_ID[WALL_SWITCH_KITCHEN],
//         payloadConditions: [{
//             field: "$message.action",
//             function: PayloadConditionFunction.Equal,
//             arguments: ["hold_left"],
//         }],
//     },
//     actions: [{
//         type: OutputAction.PostSonoffSwitchMessage,
//         deviceId: DEVICE_NAME_TO_ID[KITCHEN_CEILING_LIGHT],
//         payloadData: "off",
//     }]
// },  

// mapping 7
// switch lights off in 10 mins, if occupancy=false was not send by motion sensor
// {
//     onZigbeeMessage: {
//         deviceId: "0x00158d000a823bb0",
//         payloadConditions: [{
//             field: "$message.occupancy",
//             function: PayloadConditionFunction.Equal,
//             arguments: [true],
//         }],
//     },
//     actions: [{
//         type: OutputAction.PostSonoffSwitchMessage,
//         deviceId: DEVICE_NAME_TO_ID[SONOFF_MINI_PINK_LABEL],
//         payloadData: "off",
//         delay: 20 * 60 * 1000, // 10 mins
//     }]
// },    

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