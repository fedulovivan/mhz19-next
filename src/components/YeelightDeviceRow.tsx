/* eslint-disable no-plusplus */

import React, { useState } from 'react';

import Paper from '@material-ui/core/Paper';
// import { css } from '@emotion/css';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import moment from 'moment';

import { sendYeelightDeviceCommand } from 'src/actions';
import Messages from 'src/components/Messages';

let sentCommandIdSequence = 1;

const YeelightDeviceRow: React.FC<{
    device: IYeelightDevice;
    deviceMessages: Array<IYeelightDeviceMessage>;
    deviceCustomAttributes: IDeviceCustomAttributes;
    onDeviceFeedback: (data: Array<IYeelightDeviceMessage>) => void;
}> = ({
    device,
    deviceMessages,
    deviceCustomAttributes,
    onDeviceFeedback,
}) => {

    const [lastSendState, setLastSendState] = useState<IYeelightDeviceState | null>(null);
    const [lastCommandId, setLastCommandId] = useState<number | null>(null);

    const lastMessage = deviceMessages?.[0];
    const state = lastMessage?.result?.[0];
    const lastCommandFeedbackMessage = deviceMessages.find(({ id }) => id === lastCommandId);
    const lastCommandIsOk = lastCommandFeedbackMessage?.result?.[0] === 'ok';
    const isOn = state === 'on' || (lastCommandIsOk && lastSendState === 'on');

    const handleSwitchChange = (e) => {
        const newState = e.target.checked ? 'on' : 'off';
        const commandId = sentCommandIdSequence++;
        setLastSendState(newState);
        setLastCommandId(commandId);
        sendYeelightDeviceCommand(
            device.id,
            newState,
            commandId,
            onDeviceFeedback
        );
    };

    // <TableRow key={row.name}>
    //     <TableCell component="th" scope="row">
    //         {row.name}
    //     </TableCell>
    //     <TableCell align="right">{row.calories}</TableCell>
    //     <TableCell align="right">{row.fat}</TableCell>
    //     <TableCell align="right">{row.carbs}</TableCell>
    //     <TableCell align="right">{row.protein}</TableCell>
    // </TableRow>

    return (
        <TableRow hover>
            <TableCell>{deviceCustomAttributes?.[device.id]?.name ?? '-'}</TableCell>
            <TableCell>{device.model}</TableCell>
            <TableCell>
                {deviceMessages.length ? <Messages deviceId={device.id} sortedMessages={deviceMessages} /> : null}&nbsp;
                {lastMessage ? moment(lastMessage.timestamp).fromNow() : 'no data'}
            </TableCell>
            <TableCell>{device.host}:{device.port}</TableCell>
            <TableCell>{device.id}</TableCell>
            <TableCell>
                <Switch
                    checked={isOn}
                    color="primary"
                    onChange={handleSwitchChange}
                />
            </TableCell>
        </TableRow>
    );
};

export default YeelightDeviceRow;

// const [disabled, setDisabled] = useState<boolean>(false);
// setDisabled(true);
// setTimeout(() => setDisabled(false), 300);
// disabled={disabled}

/* <button disabled={isOn} type="button" onClick={() => toggleYeelightDevice(device.id, 'on')}>ON</button> */
/* <button disabled={!isOn} type="button" onClick={() => toggleYeelightDevice(device.id, 'off')}>OFF</button> */
/* className={css`
    button {
        border: 0;
        padding: 5px;
        &:nth-child(1) {
            border-top-left-radius: 5px;
            border-bottom-left-radius: 5px;
        }
        &:nth-child(2) {
            border-top-right-radius: 5px;
            border-bottom-right-radius: 5px;
        }
    }
`} */
