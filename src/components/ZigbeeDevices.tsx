import React, {
    useCallback,
    useEffect,
    useState,
} from 'react';

import {
    ApolloClient,
    ApolloProvider,
    gql,
    InMemoryCache,
    useQuery,
} from '@apollo/client';
import { css, cx } from '@emotion/css';
import {
    green,
    grey,
    red,
} from '@material-ui/core/colors';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
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
    zigbeeDevices: Array<IZigbee2mqttBridgeConfigDevice>;
    deviceMessagesGroupped: any;
    deviceCustomAttributes: any;
    className?: string;
}> = ({
    zigbeeDevices,
    deviceMessagesGroupped,
    deviceCustomAttributes,
    className
}) => {

        const [showHidden, setShowHidden] = useState(false);
        const { loading, error, data } = useQuery(gql`
            {
                zigbeeDevices {
                    friendly_name
                    description
                }
            }
        `);

        return (
            <TableContainer
                component={Paper}
                className={cx(className, /* rootStyles */)}
            >
                <Table aria-label="simple table" size="small">
                    <caption>
                        Zigbee Devices,
                        <a target="_blank" href="/images/networkmap.svg">Open Zigbee Network Map</a>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showHidden}
                                    color="primary"
                                    onChange={(e, checked) => {
                                        setShowHidden(checked);
                                    }}
                                />
                            }
                            label="Show hidden"
                        />
                    </caption>
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
                        {zigbeeDevices.map(device => {
                            return (
                                <ZigbeeDeviceRow
                                    key={device.friendly_name}
                                    device={device}
                                    deviceMessagesGroupped={deviceMessagesGroupped}
                                    deviceCustomAttributes={deviceCustomAttributes[device.friendly_name]}
                                    showHidden={showHidden}
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

export default ZigbeeDevices;

/* [...zigbeeDevices, toZigbeeDeviceFormat(valvesLastState)] */
