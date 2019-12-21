
/** @jsx jsx */

import { css, jsx, SerializedStyles } from '@emotion/core';
import { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import red from '@material-ui/core/colors/red';
import moment from 'moment';

interface ILeakageSensorCardProps {
    mostRecentState?: IAqaraWaterSensorMessage;
    lastHistoricalState?: IAqaraWaterSensorMessage;
    lastSeen?: string;
    css?: SerializedStyles;
}

const nowrap = css`
    white-space: nowrap;
    text-overflow: ellipsis;
    min-width: 0;
`;

const warn = css`
    background-color: ${red[600]};
    color: white;
`;

const root = css`
    display: grid;
    width: 120px;
    max-width: 120px;
    grid-auto-flow: row;
    grid-row-gap: 12px;
    justify-items: center;
    img {
        width: 100%;
    }
`;

export default function LeakageSensorCard({
    mostRecentState,
    lastSeen,
    lastHistoricalState,
    css: rootCss,
}: ILeakageSensorCardProps) {

    const [random, setRandom] = useState(0);

    // autorefresh
    useEffect(() => {
        setInterval(() => {
            setRandom(Math.random());
        }, 10000);
    }, []);

    // improve me
    const formattedLastSeenTime = moment(
        (mostRecentState && mostRecentState.last_seen)
        || (lastHistoricalState && lastHistoricalState.last_seen) || lastSeen
    ).fromNow();

    return (
        <Card>
            <CardContent
                css={[
                    mostRecentState && mostRecentState.water_leak && warn,
                    root,
                    rootCss
                ]}
            >
                <img src="/images/aqara-water-sensor.png" alt="preview" />
                <div data-random={random} css={nowrap}>
                    last seen
                    {formattedLastSeenTime}
                </div>
                <div>{mostRecentState && mostRecentState.battery ? `battery ${mostRecentState.battery}%` : 'no battery info'}</div>
            </CardContent>
        </Card>
    );
}
