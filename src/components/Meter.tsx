/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { useCallback, useEffect } from 'react';

import { css, cx } from '@emotion/css';

const CH_HEIGHT = 30;
const TICK_WEIGHT_LITERS = 10;

const rootStyles = css`
    display: flex;
    align-items: center;
    .value {
        display: flex;
        align-items: center;
        column-gap: 3px;
        margin-left: 5px;
        .ch {
            font-family: monospace;
            font-size: 24px;
            height: ${CH_HEIGHT}px;
            width: 20px;
            border-radius: 3px;
            overflow: hidden;
            position: relative;
            .roll {
                transition: transform ease-in-out 500ms;
                line-height: ${CH_HEIGHT}px;
                position: absolute;
                background-color: grey;
                color: white;
                width: 100%;
                & > div {
                   text-align: center;
                }
            }
        }
        .unit {
            color: grey;
        }
    }
    .name {
        a {
            text-transform: uppercase;
            text-decoration: none;
            border-bottom: 1px blue dashed;
        }
    }
    &.hot > .name > a {
        color: red;
    }
    &.cold > .name > a {
        color: blue;
    }
`;

function setClipboard(text: string) {
    const type = "text/plain";
    const blob = new Blob([text], { type });
    const data = [new ClipboardItem({ [type]: blob })];
    return navigator.clipboard.write(data);
}

const Ch: React.FC<{ ch: string }> = ({ ch }) => {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
    const index = digits.indexOf(ch);
    const translateY = index * (CH_HEIGHT/*  + 1 */) * -1;
    if (index === -1) return <>{ch}</>;
    return (
        <div className="ch">
            <div className="roll" style={{ transform: `translateY(${translateY}px)` }}>
                {
                    digits.map((d) => (<div key={d}>{d}</div>))
                }
            </div>
        </div>
    );
};
Ch.displayName = 'Ch';

const Meter: React.FC<{
    value: number;
    className?: string;
    hot?: boolean;
    cold?: boolean;
}> = ({
    value,
    className,
    hot,
    cold
}) => {
    const formatted = new Intl.NumberFormat(
        'en-US',
        { minimumIntegerDigits: 3, minimumFractionDigits: 2 },
    ).format((value * TICK_WEIGHT_LITERS) / 1000);
    let name;
    if (hot) {
        name = 'Hot';
    } else if (cold) {
        name = 'Cold';
    }
    const valueInCubicMeters = String(Math.ceil(value / (TICK_WEIGHT_LITERS * 10)));
    const handleCopy = (event: any) => {
        setClipboard(valueInCubicMeters);
        event.preventDefault();
    };
    return (
        <React.StrictMode>
            <div className={cx(className, rootStyles, { hot, cold })}>
                <div className="name">
                    <a
                        title={`Copy integer value ${valueInCubicMeters} to clipboard (in cubic meters)`}
                        href="#"
                        onClick={handleCopy}
                    >
                        {name}
                    </a>
                </div>
                <div className="value">
                    {
                        formatted
                            .split('')
                            .map((ch, i) => (
                                // note that "formatted" variable is always have length of 7 characters
                                // this helps to avoid remounting <Ch />
                                // eslint-disable-next-line react/no-array-index-key
                                <Ch ch={ch} key={i} />
                            ))
                    }
                    <div className="unit">m&#179;</div>
                </div>
            </div>
        </React.StrictMode>
    );
};
Meter.displayName = 'Meter';
Meter.defaultProps = {
    hot: false,
    cold: false,
    value: 0,
};

export default Meter;
