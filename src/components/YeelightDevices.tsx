import React, {
    useCallback,
    useEffect,
    useState,
} from 'react';

import { useQuery } from '@apollo/client';
import { css, cx } from '@emotion/css';
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

import YeelightDeviceRow from 'src/components/YeelightDeviceRow';
import { QUERY_OPTIONS } from 'src/constants';
import * as queries from 'src/queries';

// import {
//     IDeviceCustomAttributesIndexed,
//     IYeelightDevice,
//     IYeelightDeviceMessage,
// } from 'src/typings/index.d';

// const rootStyles = css`
//     display: grid;
//     grid-template-columns: repeat(6, 1fr);
//     margin-top: 20px;
// `;

const YeelightDevices: React.FC<{
    // yeelightDevices: Array<IYeelightDevice>;
    // yeelightDeviceMessages: Array<IYeelightDeviceMessage>;
    // deviceCustomAttributes: IDeviceCustomAttributesIndexed;
    historyWindowSize?: number;
    onDeviceFeedback: (data: Array<IYeelightDeviceMessage>) => void;
    className?: string;
}> = ({
    // yeelightDevices,
    // yeelightDeviceMessages,
    // deviceCustomAttributes,
    onDeviceFeedback,
    className,
    historyWindowSize,
}) => {

        // query
        const { loading, error, data } = useQuery(
            queries.GET_YEELIGHT_DEVICES, {
                variables: {
                    historyWindowSize,
                },
                ...QUERY_OPTIONS,
            }
        );

        if (loading) return <>Loading...</>;
        if (error) return <>{error.message}</>;

        const { yeelightDevices } = data;

        if (!yeelightDevices.length) {
            return (
                <div>No single yeelight device is discovered yet...</div>
            );
        }

        return (
            <TableContainer
                component={Paper}
                className={cx(className, /* rootStyles */)}
            >
                <Table aria-label="simple table" size="small">
                <caption>Yeelight Devices</caption>
                    <TableHead>
                        <TableRow>
                            <TableCell>Custom Name</TableCell>
                            <TableCell>Model</TableCell>
                            <TableCell>Last Message</TableCell>
                            <TableCell>Host/Port</TableCell>
                            <TableCell>ID</TableCell>
                            <TableCell>On/Off</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {yeelightDevices.map(device => {
                            // const deviceMessages = device.messages.filter(
                            //     ({ device_id }) => device_id === device.id
                            // );
                            return (
                                <YeelightDeviceRow
                                    key={device.id}
                                    device={device}
                                    deviceMessages={device.messages}
                                    deviceCustomAttributes={device.customAttributes}
                                    onDeviceFeedback={onDeviceFeedback}
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );

        // return (
        //     <div
        //         className={rootStyles}
        //     >
        //         <div>Custom Name</div>
        //         <div>Model</div>
        //         <div>Last Message</div>
        //         <div>Host/Port</div>
        //         <div>ID</div>
        //         <div>On/Off</div>
        //         {yeelightDevices.map(device => {

        //             const deviceMessages = yeelightDeviceMessages.filter(({ device_id }) => device_id === device.id);

        //             return (
        //                 <YeelightDeviceRow
        //                     key={device.id}
        //                     device={device}
        //                     deviceMessages={deviceMessages}
        //                     deviceCustomAttributes={deviceCustomAttributes}
        //                     onDeviceFeedback={onDeviceFeedback}
        //                 />
        //             );

        //         })}
        //     </div>
        // );
    };

export default YeelightDevices;
