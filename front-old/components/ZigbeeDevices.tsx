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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import ZigbeeDeviceRow from 'src/components/ZigbeeDeviceRow';
import { QUERY_OPTIONS } from 'src/constants';
import * as queries from 'src/queries';

const ZigbeeDevices: React.FC<{
    historyWindowSize?: number;
    className?: string;
}> = ({
    className,
    historyWindowSize,
}) => {

        const [showHidden, setShowHidden] = useState(false);
        const { loading, error, data } = useQuery(
            queries.GET_ZIGBEE_DEVICES, {
                variables: {
                    historyWindowSize,
                },
                ...QUERY_OPTIONS,
            }
        );

        if (loading) return <>Loading...</>;
        if (error) return <>{error.message}</>;

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
                            <TableCell>IEEE Address</TableCell>
                            <TableCell>Updated</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Custom Name</TableCell>
                            <TableCell>Last Message</TableCell>
                            <TableCell>Battery</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.zigbeeDevices.map((device: any) => {
                            if (device.type === 'Coordinator') return null;
                            return (
                                <ZigbeeDeviceRow
                                    key={device.friendly_name}
                                    device={device}
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
