
/** @jsx jsx */

// eslint-disable-next-line no-unused-vars
import { jsx, SerializedStyles } from '@emotion/core';
import { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import moment from 'moment';
import last from 'lodash/last';

import * as styles from './styles';

interface ILeakageSensorCardProps {
    mostRecentState?: IAqaraWaterSensorMessage;
    historyMessages?: Array<IAqaraWaterSensorMessage>;
    lastSeen?: number;
    rootCss?: SerializedStyles;
}

export default function LeakageSensorCard({
    mostRecentState,
    lastSeen,
    historyMessages,
    rootCss,
}: ILeakageSensorCardProps) {

    const [random, setRandom] = useState(0);

    // auto re-render
    useEffect(() => {
        setInterval(() => {
            setRandom(Math.random());
        }, 10000);
    }, []);

    const lastHistoryMessage = last(historyMessages);

    let lastSeenForUser;
    if (mostRecentState) {
        lastSeenForUser = mostRecentState.last_seen;
    } else if (lastHistoryMessage) {
        lastSeenForUser = lastHistoryMessage.last_seen;
    } else {
        lastSeenForUser = lastSeen;
    }

    let batteryForUser;
    if (mostRecentState) {
        batteryForUser = mostRecentState.battery;
    } else if (lastHistoryMessage) {
        batteryForUser = lastHistoryMessage.battery;
    }

    const formattedLastSeenTime = moment(lastSeenForUser).fromNow();

    return (
        <Card>
            <CardContent
                css={[
                    mostRecentState && mostRecentState.water_leak && styles.warn,
                    styles.root,
                    rootCss
                ]}
            >
                <img src="/images/aqara-water-sensor.png" alt="preview" />
                <div data-random={random} css={styles.nowrap} title={moment(lastSeenForUser).toISOString()}>
                    last seen {formattedLastSeenTime}
                </div>
                <div>{batteryForUser ? `battery ${batteryForUser}%` : 'no battery info'}</div>
            </CardContent>
        </Card>
    );
}
