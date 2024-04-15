import React, {
    useCallback,
    useEffect,
    useState,
} from 'react';

import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import {
    HISTORY_WINDOW_14DAYS,
    HISTORY_WINDOW_30DAYS,
    HISTORY_WINDOW_3DAYS,
    HISTORY_WINDOW_7DAYS,
    HISTORY_WINDOW_DAY,
    LAST_SEEN_OUTDATION,
} from 'src/constants';

const WindowSizePicker: React.FC<{
    historyWindowSize?: number;
    handleHistoryWindowSizeChange: (e: any) => void;
}> = ({
    historyWindowSize,
    handleHistoryWindowSizeChange,
}) => {
    return (
        <>
            History for:&nbsp;
            <Select
                value={historyWindowSize}
                onChange={handleHistoryWindowSizeChange}
                style={{width: '150px'}}
            >
                <MenuItem value={HISTORY_WINDOW_DAY}>1 day</MenuItem>
                <MenuItem value={HISTORY_WINDOW_3DAYS}>3 days</MenuItem>
                <MenuItem value={HISTORY_WINDOW_7DAYS}>7 days</MenuItem>
                <MenuItem value={HISTORY_WINDOW_14DAYS}>14 days</MenuItem>
                <MenuItem value={HISTORY_WINDOW_30DAYS}>30 days</MenuItem>
                <MenuItem value="">all time</MenuItem>
            </Select>
        </>
    );
};

export default WindowSizePicker;
