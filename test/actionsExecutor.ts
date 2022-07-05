/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-expressions */

import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
// @ts-ignore
import win from 'why-is-node-running';

import {
    ActionsExecutor,
    IMappings,
    mapping,
    OutputAction,
    PayloadConditionFunction,
    supportedConditionFunctions,
    supportedOutputActions,
} from 'src/automation-engine';

const mqttClientPublishSpy = sinon.spy();
const postSonoffSwitchMessageSpy = sinon.spy();

// const utMapping: IMappings = [
//     {
//         onZigbeeMessage: {
//             deviceId: '1',
//             payloadConditions: [{
//                 value: "$message.action",
//                 function: PayloadConditionFunction.Equal,
//                 arguments: ["single_left"]
//             }]
//         },
//         actions: [{
//             type: OutputAction.YeelightDeviceSetPower,
//             deviceId: '2',
//             payloadData: "on",
//         }]
//     }
// ];

const actionsExecutor = new ActionsExecutor({
    mapping: [
        ...mapping,
        // ...utMapping,
    ],
    supportedOutputActions,
    supportedAdapters: {
        Mqtt: () => ({
            publish: mqttClientPublishSpy
        }),
        Sonoff: () => postSonoffSwitchMessageSpy,
    }
});

chai.use(sinonChai);

describe('automation-engine/ActionsExecutor', function () {

    it('InList condition and Zigbee2MqttSetState action', function () {

        const spyInList = sinon.spy(supportedConditionFunctions, 'InList');
        const spyZigbee2MqttSetState = sinon.spy(supportedOutputActions, 'Zigbee2MqttSetState');
        actionsExecutor.handleZigbeeMessage(
            '0x50325ffffe6ca5da', {
                action: 'on',
                click: 'on',
                battery: 100,
                action_rate: 0,
                linkquality: 100,
                update_available: false
            }
        );

        expect(spyInList).to.have.been.calledOnce;
        expect(spyInList).to.have.been.calledWith('on', ['on', 'off']);

        expect(spyZigbee2MqttSetState).to.have.been.calledTwice;
        expect(spyZigbee2MqttSetState).to.have.been.calledWith('0x00158d0003a010a5', 'on');
        expect(spyZigbee2MqttSetState).to.have.been.calledWith('0x00158d000391f252', 'on');

        expect(mqttClientPublishSpy).to.have.been.calledTwice;
        expect(mqttClientPublishSpy).to.have.been.calledWith('zigbee2mqtt/0x00158d0003a010a5/set/state', 'on');
        expect(mqttClientPublishSpy).to.have.been.calledWith('zigbee2mqtt/0x00158d000391f252/set/state', 'on');

    });

    it('InList condition, PostSonoffSwitchMessage action, translation map', function() {

        actionsExecutor.handleZigbeeMessage(
            '0x00158d0004244bda', {
                action: "single_left",
                battery: 100,
                click: "left",
                linkquality: 135,
                voltage: 3005
            }
        );

        expect(postSonoffSwitchMessageSpy).to.have.been.calledTwice;
        expect(postSonoffSwitchMessageSpy).to.have.been.calledWith('10011cec96', 'on');
        expect(postSonoffSwitchMessageSpy).to.have.been.calledWith('10011c1eeb', 'on');
    });

    // uncomment to see why mocha did not exited automatically
    // after(() => win());
});
