
/** @jsx jsx */

import { useState, useEffect } from 'react';
import { css, jsx } from '@emotion/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import red from '@material-ui/core/colors/red';
import moment from 'moment';

interface ILeakageSensorCardProps {
    mostRecentState: IAqaraWaterSensorMessage;
    lastHistoricalState: IAqaraWaterSensorMessage;
    lastSeen: string;
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
    width: 120px;
    max-width: 120px;
    display: grid;
    grid-auto-flow: row;
    grid-row-gap: 12px;
    justify-items: center;
    img {
        width: 100%;
    }
`;

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

    // improve me
    const formattedLastSeenTime = moment(
        mostRecentState.last_seen || (lastHistoricalState && lastHistoricalState.last_seen) || lastSeen
    ).fromNow();

    return (
        <Card>
            <CardContent css={[mostRecentState.water_leak && warn, root]}>
                <img
                    src="/images/aqara-water-sensor.png"
                />
                <div data-random={random} css={nowrap}>
                    last seen {formattedLastSeenTime}
                </div>
                <div>{mostRecentState.battery ? `battery ${mostRecentState.battery}%` : 'no battery info'}</div>
            </CardContent>
        </Card>
   );
}

LeakageSensorCard.defaultProps = {
    mostRecentState: {},
};
