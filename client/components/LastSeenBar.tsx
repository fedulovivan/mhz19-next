import React from 'react';

import { css, cx } from '@emotion/css';
import { green, red } from '@material-ui/core/colors';
import { oneLine } from 'common-tags';
import round from 'lodash/round';

import {
    dateFormatter,
    durationFormatter,
    timeFormatter,
} from 'src/clientUtils';
import { NO_DATA_GAP } from 'src/constants';

const toPercent = (tick: number, min: number, max: number) => {
    const span = max - min;
    const value = ((tick - min) / span) * 100;
    return value;
};

const HEIGHT = 8;
const POZ_COLOR = '#a8e063';
// const POZ_COLOR = green[100];
const TICK_COLOR = '#f64f59';
// const TICK_COLOR = red[300];

const rootStyles = css`
    .label {

    }
    .container {
        display: block;
        width: 100%;
        height: ${HEIGHT}px;
        border-radius: ${HEIGHT}px;
        /* background-color: ${POZ_COLOR}; */
        background: linear-gradient(to right, #56ab2f, #a8e063);
        position: relative;
        .tick {
            border-radius: ${HEIGHT}px;
            border: 1px solid ${POZ_COLOR};
            position: absolute;
            height: ${HEIGHT - 2}px;
            background-color: ${TICK_COLOR};
            transition: transform .2s;
            &:hover {
                transform: scale(1.2);
            }
        }
    }
`;

const LastSeenBar: React.FC<{
    sortedMessages: Array<{ timestamp: number }>;
    className?: string;
    label?: string;
}> = ({
    sortedMessages,
    className,
    label,
}) => {

    if (!sortedMessages?.length) return null;

    const ticks: Array<[number, number]> = [];

    const NOW = Date.now();
    const MINUS_24_HOURS = NOW - /* 3 * */ 24 * 3600 * 1000;
    const min: number = MINUS_24_HOURS;
    const max: number = NOW;

    // render bar only for the last 24 hours
    const filteredMessages = sortedMessages
        .filter(message => message && message.timestamp > MINUS_24_HOURS);

    let prevMessage: { timestamp: number };

    filteredMessages.forEach((message, index) => {
        const diff = prevMessage ? prevMessage.timestamp - message.timestamp : undefined;
        if (diff && diff > NO_DATA_GAP) {
            ticks.push([message.timestamp, prevMessage.timestamp]);
        }
        prevMessage = message;
    });

    const mostRecentMessage = filteredMessages[0];
    if (mostRecentMessage?.timestamp + NO_DATA_GAP < NOW) {
        ticks.push([mostRecentMessage.timestamp, NOW]);
    }

    return (
        <div className={cx(rootStyles, className)}>
            {label && <div className="label">{label}</div>}
            <div className="container">
                {ticks.map((tickTuple) => {
                    const [from, to] = tickTuple;
                    const left = toPercent(from, min, max);
                    const right = toPercent(to, min, max);
                    const width = right - left;
                    return <div
                        title={oneLine`
                            Offline period:
                            ${durationFormatter(to - from)}
                            (from ${timeFormatter.format(from)} till ${to === NOW ? 'now' : timeFormatter.format(to)})
                        `}
                        key={from}
                        className="tick"
                        style={{ left: `${left}%`, width: `${width}%` }}
                    />;
                })}
            </div>
        </div>
    );

};

LastSeenBar.displayName = 'LastSeenBar';

export default LastSeenBar;
