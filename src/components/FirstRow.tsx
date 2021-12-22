import React from 'react';

import { gql, useQuery } from '@apollo/client';
import Button from '@material-ui/core/Button';
import PowerIcon from '@material-ui/icons/PowerSettingsNew';

import { powerOff } from 'src/actions';
import KeyValuePaper from 'src/components/KeyValuePaper';
import WindowSizePicker from 'src/components/WindowSizePicker';
import { QUERY_OPTIONS } from 'src/constants';
import * as queries from 'src/queries';

const FirstRow: React.FC<{
    historyWindowSize?: number;
    handleHistoryWindowSizeChange(e: any): void;
}> = ({
    historyWindowSize,
    handleHistoryWindowSizeChange,
}) => {

    const { loading, error, data } = useQuery(
        queries.GET_LAST_TEMPERATURE_MESSAGE, {
            variables: {
                historyWindowSize,
            },
            ...QUERY_OPTIONS,
        }
    );

    if (loading) return <>Loading...</>;
    if (error) return <>{error.message}</>;

    const { lastTemperatureMessage } = data;

    return (
        <KeyValuePaper
            asCards
            data={lastTemperatureMessage ? [
                ['Temperature', lastTemperatureMessage.temperature, '℃'],
                ['Humidity', lastTemperatureMessage.humidity, '%'],
                [
                    'Pressure',
                    Math.round(lastTemperatureMessage.pressure / 1.33322),
                    'mmh'
                ],
            ] : []}
        >
            <>
                <WindowSizePicker
                    historyWindowSize={historyWindowSize}
                    handleHistoryWindowSizeChange={handleHistoryWindowSizeChange}
                />
                <Button
                    style={{ justifySelf: 'end' }}
                    startIcon={<PowerIcon />}
                    onClick={() => {
                        // eslint-disable-next-line no-restricted-globals
                        if (confirm('Confirm server power off')) {
                            powerOff();
                        }
                    }}
                >
                    Poweroff
                </Button>
            </>
        </KeyValuePaper>
    );
};

FirstRow.displayName = 'FirstRow';

export default FirstRow;
