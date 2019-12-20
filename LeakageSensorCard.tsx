
/** @jsx jsx */

import { useState, useEffect } from 'react';
import { css, jsx } from '@emotion/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import red from '@material-ui/core/colors/red';
import moment from 'moment';

interface ILeakageSensorCardProps {
    mostRecentState?: IAqaraWaterSensorMessage;
    lastHistoricalState?: IAqaraWaterSensorMessage;
    lastSeen?: string;
}

export default function LeakageSensorCard(
    { mostRecentState, lastSeen, lastHistoricalState }: ILeakageSensorCardProps
) {

    const [random, setRandom] = useState(0);

    // autorefresh
    useEffect(()=> {
        setInterval(() => {
            setRandom(Math.random());
        }, 10000);
    }, []);

    const isWaterLeak = css`
        background-color: ${red[300]};
    `;

    const img = css`
        width: 100px;
        height: 100px;
        &:hover {
            width: 105px;
            height: 105px;
        }
    `;

    // improve me
    const formattedLastSeenTime = moment(
        mostRecentState.last_seen || (lastHistoricalState && lastHistoricalState.last_seen) || lastSeen
    ).fromNow();

    return (
        <Card>
            <CardContent css={mostRecentState.water_leak && isWaterLeak}>
                <img
                    css={img}
                    src="/images/aqara-water-sensor.jpg"
                />
                <div data-random={random}>
                    last seen {formattedLastSeenTime}
                </div>
                <div>{mostRecentState.battery ? `battery ${mostRecentState.battery}%` : 'battery info is not yet available'}</div>
            </CardContent>
        </Card>
   );
}

LeakageSensorCard.defaultProps = {
    mostRecentState: {},
};
