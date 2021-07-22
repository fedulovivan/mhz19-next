import React, {
    useCallback,
    useEffect,
    useState,
} from 'react';

import { css } from '@emotion/css';
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

const KeyValuePaper: React.FC<{
    title?: string;
    data: Array<IRow>;
    children?: React.ReactElement;
}> = ({
    title,
    data,
    children,
}) => {
    return (
        <Paper
            elevation={2}
            className={rootStyles}
        >
            {
                data.map((row) => {
                    const [prefix, value, suffix] = row;
                    return (
                        <React.Fragment key={row.join('-')}>
                            <div className="prefix">{prefix}</div>:&nbsp;
                            <div className="value">{String(value)}</div>
                            <div className="suffix">{suffix}</div>,&nbsp;
                        </React.Fragment>
                    );
                })
            }
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
