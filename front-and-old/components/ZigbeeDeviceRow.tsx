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

import LastSeenBar from 'src/components/LastSeenBar';
import Messages from 'src/components/Messages';
import { HOUR, LAST_SEEN_OUTDATION } from 'src/constants';

const ZigbeeDeviceRow: React.FC<{
    device: IZigbee2MqttBridgeDevice & {
        timestamp: number;
        customAttributes: {
            name: string;
            isHidden: string;
        };
        messages: Array<{
            device_id: string;
            timestamp: number;
            battery: number;
            linkquality: number;
        }>;
    };
    showHidden: boolean;
}> = ({
    device,
    showHidden,
}) => {

    const isHidden = device.customAttributes?.isHidden === 'true';

    // hidden device
    if (isHidden && !showHidden) {
        return null;
    }

    const sortedMessages = sortBy(device.messages, 'timestamp').reverse();

    const mostRecentMessage = first(sortedMessages);
    const lastSeenMoment = mostRecentMessage ? moment(mostRecentMessage.timestamp) : undefined;
    const fromNowMs = lastSeenMoment ? Date.now() - lastSeenMoment.valueOf() : undefined;
    const outdated = fromNowMs ? fromNowMs > LAST_SEEN_OUTDATION : true;
    const timestampAsMoment = moment(device.timestamp);

    return (
        <TableRow hover>
            <TableCell>{device.ieee_address}</TableCell>
            <TableCell title={timestampAsMoment.format()}>{/* device.timestamp */timestampAsMoment.fromNow()}</TableCell>
            <TableCell>{device.definition?.description ?? '-'}{isHidden ? ' (Hidden)' : ''}</TableCell>
            <TableCell>{device.customAttributes?.name ?? '-'}</TableCell>
            <TableCell
                className={outdated ? css`color: ${red[500]} !important` : undefined}
            >
                {sortedMessages ? <Messages
                    deviceId={device.friendly_name}
                    sortedMessages={sortedMessages}
                /> : null}&nbsp;
                {lastSeenMoment ? lastSeenMoment.fromNow() : 'no info'}
                <LastSeenBar sortedMessages={sortedMessages} noDataGap={HOUR * 1} />
            </TableCell>
            <TableCell>{mostRecentMessage?.battery ?? '-'}</TableCell>
        </TableRow>
    );
};

ZigbeeDeviceRow.displayName = 'ZigbeeDeviceRow';

export default ZigbeeDeviceRow;
