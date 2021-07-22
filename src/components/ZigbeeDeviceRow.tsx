import React, {
    useCallback,
    useEffect,
    useState,
} from 'react';

import { css } from '@emotion/css';
import { green, red } from '@material-ui/core/colors';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import first from 'lodash/first';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import moment from 'moment';

import Messages from 'src/components/Messages';
import {
    HISTORY_WINDOW_14DAYS,
    HISTORY_WINDOW_30DAYS,
    HISTORY_WINDOW_3DAYS,
    HISTORY_WINDOW_7DAYS,
    HISTORY_WINDOW_DAY,
    LAST_SEEN_OUTDATION,
} from 'src/constants';

const ZigbeeDeviceRow: React.FC<{
    device: any;
    deviceMessagesGroupped: any;
    deviceCustomAttributes: any;
}> = ({
    device,
    deviceMessagesGroupped,
    deviceCustomAttributes,
}) => {

    // ignore Coordinator device, it does not contain anything interesting
    if (device.friendly_name === 'Coordinator') return null;

    const deviceMessages = sortBy(deviceMessagesGroupped[device.friendly_name], 'timestamp').reverse();

    const mostRecentMessage = first(deviceMessages);
    const lastSeenMoment = mostRecentMessage ? moment(mostRecentMessage.timestamp) : undefined;
    const fromNowMs = lastSeenMoment ? Date.now() - lastSeenMoment.valueOf() : undefined;
    const outdated = fromNowMs ? fromNowMs > LAST_SEEN_OUTDATION : true;

    return (
        <TableRow hover>
            <TableCell>{device.description ?? '-'}</TableCell>
            <TableCell>{deviceCustomAttributes?.[device.friendly_name]?.name ?? '-'}</TableCell>
            <TableCell
                className={outdated ? css`color: ${red[500]} !important` : undefined}
            >
                {deviceMessages ? <Messages deviceId={device.friendly_name} data={deviceMessages} /> : null}&nbsp;
                {lastSeenMoment ? lastSeenMoment.fromNow() : 'no info'}
            </TableCell>
            <TableCell>{mostRecentMessage?.battery ?? '-'}</TableCell>
            <TableCell>{device.friendly_name}</TableCell>
        </TableRow>
    );
};

export default ZigbeeDeviceRow;
