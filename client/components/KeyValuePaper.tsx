import React, {
    useCallback,
    useEffect,
    useState,
} from 'react';

import { css, cx } from '@emotion/css';
import { grey } from '@material-ui/core/colors';
import Paper from '@material-ui/core/Paper';

type IRow = [prefix: string, value: string | number | undefined, suffix?: string];

const rootStyles = css`
    padding: 20px;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    .title {
        margin-top: 1em;
        font-size: 14px;
        color: ${grey[600]};
    }
    .prefix {
        display: inline-block;
    }
    .value, .suffix {
        font-size: 1.2em;
        display: inline-block;
    }
`;

const cardRootStyles = css`
    display: grid;
    padding: 10px;
    /* background: linear-gradient(to right, #a8ff78, #78ffd6); */
    .prefix {
        grid-row: 2/3;
        grid-column: 1/3;
    }
    .value, .suffix {
        grid-row: 1/2;
        font-size: 2em;
        display: inline-block;
    }
`;

const KeyValuePaper: React.FC<{
    title?: string;
    data: Array<IRow>;
    children?: React.ReactElement;
    asCards?: boolean;
    className?: string;
}> = ({
    title,
    data,
    children,
    asCards,
    className
}) => {
    const items = data.map((row) => {
        const [prefix, value, suffix] = row;
        const key = row.join('-');
        if (asCards) {
            return (
                <Paper
                    key={key}
                    className={cardRootStyles}
                    elevation={2}
                >
                    <div className="value">{String(value)}</div>
                    <div className="suffix">{suffix}</div>
                    <div className="prefix">{prefix}</div>
                </Paper>
            );
        }
        return (
            <React.Fragment key={key}>
                <div className="prefix">{prefix}</div>:&nbsp;
                <div className="value">{String(value)}</div>
                <div className="suffix">{suffix}</div>,&nbsp;
            </React.Fragment>
        );
    });
    if (asCards) {
        return (
            <>
                {items}
                <Paper
                    className={cardRootStyles}
                    elevation={2}
                >
                    {children}
                </Paper>
            </>
        );
    }
    return (
        <Paper
            elevation={2}
            className={cx(className, rootStyles)}
        >
            {items}
            {children}
            {title && <div className="title">{title}</div>}
        </Paper>
    );
};

export const toDataRow = (valuesObject: Record<string, any>): Array<IRow> => {
    const result: Array<IRow> = [];
    Object.keys(valuesObject).forEach((key) => {
        result.push([key, valuesObject[key]]);
    });
    return result;
};

export default KeyValuePaper;
