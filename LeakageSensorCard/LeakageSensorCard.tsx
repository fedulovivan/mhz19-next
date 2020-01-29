
/** @jsx jsx */

// eslint-disable-next-line no-unused-vars
import { jsx, SerializedStyles } from '@emotion/core';
import { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import moment from 'moment';

import * as styles from './styles';

interface ILeakageSensorCardProps {
    deviceMessage?: IAqaraWaterSensorMessage;
    lastSeen?: number;
    css?: SerializedStyles;
}

export default function LeakageSensorCard({
    deviceMessage,
    lastSeen,
    css,
}: ILeakageSensorCardProps) {

    const [random, setRandom] = useState(0);

    // auto re-render
    useEffect(() => {
        setInterval(() => {
            setRandom(Math.random());
        }, 10000);
    }, []);

    const lastSeenForUser = deviceMessage ? deviceMessage.last_seen : lastSeen;

    const batteryForUser = deviceMessage?.battery;

    const formattedLastSeenTime = moment(lastSeenForUser).fromNow();

    return (
        <Card>
            <CardContent
                css={[
                    deviceMessage && deviceMessage.water_leak && styles.warn,
                    styles.root,
                    css
                ]}
            >
                <img src="/images/aqara-water-sensor.png" alt="preview" />
                <div
                    data-random={random}
                    css={styles.nowrap}
                    title={moment(lastSeenForUser).toISOString()}
                >
                    last seen {formattedLastSeenTime}
                </div>
                <div>{batteryForUser ? `battery ${batteryForUser}%` : 'no battery info'}</div>
            </CardContent>
        </Card>
    );
}
