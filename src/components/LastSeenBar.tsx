import React from 'react';

import { css } from '@emotion/css';
import { green, red } from '@material-ui/core/colors';
import { oneLine } from 'common-tags';
import round from 'lodash/round';

import { dateFormatter, timeFormatter } from 'src/clientUtils';
import { NO_DATA_GAP } from 'src/constants';

const toPercent = (tick: number, min: number, max: number) => {
    const span = max - min;
    const value = ((tick - min) / span) * 100;
    return value;
};

const HEIGHT = 8;
const POZ_COLOR = green[100];

const rootStyles = css`
    display: block;
    width: 100%;
    height: ${HEIGHT}px;
    border-radius: ${HEIGHT}px;
    background-color: ${POZ_COLOR};
    position: relative;
    .tick {
        border-radius: ${HEIGHT}px;
        border: 1px solid ${POZ_COLOR};
        position: absolute;
        height: ${HEIGHT - 2}px;
        background-color: ${red[300]};
        transition: transform .2s;
        &:hover {
            transform: scale(1.2);
        }
    }
`;

const LastSeenBar: React.FC<{
    sortedMessages: Array<IRootDeviceUnifiedMessage>;
}> = ({ sortedMessages }) => {

    if (!sortedMessages?.length) return null;

    const ticks: Array<[number, number]> = [];

    let lastTimestamp: number = /* Date.now() */0;
    let max: number = 0;
    let min: number = 0;

    const MINUS_24_HOURS = Date.now() - 3600 * 24 * 1000;

    const filteredMessages = sortedMessages
        .filter(message => message && message.timestamp > MINUS_24_HOURS);

    filteredMessages.forEach((message, index) => {

        const { timestamp } = message;

        if (!max) max = timestamp;
        if (index === filteredMessages.length - 1) min = timestamp;

        if (lastTimestamp - timestamp > NO_DATA_GAP) {
            ticks.push([timestamp, lastTimestamp]);
        }

        lastTimestamp = timestamp;
    });

    return (
        <div className={rootStyles}>
            {ticks.map((tickTuple) => {
                const [from, to] = tickTuple;
                const left = toPercent(from, min, max);
                const right = toPercent(to, min, max);
                const width = right - left;
                return <div
                    title={oneLine`
                        Offline period:
                        ${round((to - from) / 1000 / 3600, 2)} hours.
                        From ${timeFormatter.format(from)} till ${timeFormatter.format(to)}
                    `}
                    key={from}
                    className="tick"
                    style={{ left: `${left}%`, width: `${width}%` }}
                />;
            })}
        </div>
    );

};

export default LastSeenBar;
