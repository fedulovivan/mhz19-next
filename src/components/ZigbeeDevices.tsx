import React, {
    useCallback,
    useEffect,
    useState,
} from 'react';

import { css } from '@emotion/css';
import {
    green,
    grey,
    red,
} from '@material-ui/core/colors';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import {
    localStorageGetNumber,
    localStorageSet,
    toZigbeeDeviceFormat,
} from 'src/clientUtils';
import ZigbeeDeviceRow from 'src/components/ZigbeeDeviceRow';

const ZigbeeDevices: React.FC<{
    zigbeeDevices: any;
    valvesLastState: IValveStateMessage;
    deviceMessagesGroupped: any;
    deviceCustomAttributes: any;
}> = ({
    zigbeeDevices,
    valvesLastState,
    deviceMessagesGroupped,
    deviceCustomAttributes,
}) => {
        return (
            <TableContainer component={Paper}>
                <Table aria-label="simple table" size="small">
                    <caption>Zigbee Devices, <a target="_blank" href="/images/networkmap.svg">Open Zigbee Network Map</a></caption>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Custom Name</TableCell>
                            <TableCell>Last Message</TableCell>
                            <TableCell>Battery</TableCell>
                            <TableCell>Device ID</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[...zigbeeDevices, toZigbeeDeviceFormat(valvesLastState)].map(device => {
                            return (
                                <ZigbeeDeviceRow
                                    key={device.friendly_name}
                                    device={device}
                                    deviceMessagesGroupped={deviceMessagesGroupped}
                                    deviceCustomAttributes={deviceCustomAttributes}
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

export default ZigbeeDevices;
