import React, { useState } from 'react';

import {
    ApolloClient,
    ApolloProvider,
    InMemoryCache,
} from '@apollo/client';
import { css } from '@emotion/css';
import { grey } from '@material-ui/core/colors';
import { hot } from 'react-hot-loader';

import { fetchAll, powerOff } from 'src/actions';
import { localStorageGetNumber, localStorageSet } from 'src/clientUtils';
import Chart from 'src/components/Chart';
import FirstRow from 'src/components/FirstRow';
import KeyValuePaper, { toDataRow } from 'src/components/KeyValuePaper';
import SonoffDevices from 'src/components/SonoffDevices';
import Stats from 'src/components/Stats';
import ValveButtons from 'src/components/ValveButtons';
import WindowSizePicker from 'src/components/WindowSizePicker';
import YeelightDevices from 'src/components/YeelightDevices';
import ZigbeeDevices from 'src/components/ZigbeeDevices';
import {
    DEVICE_NAME_TO_ID,
    GRAPHQL_URI,
    HISTORY_WINDOW_7DAYS,
    NO_DATA_GAP,
    TEMPERATURE_SENSOR,
} from 'src/constants';
import { useBooleanState } from 'src/hooks';

require('normalize.css');

const apolloClient = new ApolloClient({
    uri: GRAPHQL_URI,
    cache: new InMemoryCache(),
});

const rootStyles = css`
    /* background-color: ${grey[100]}; */
    /* https://uigradients.com/#Jodhpur */
    background: linear-gradient(to right, #0052D4, #65C7F7, #9CECFB);
    padding: 20px;
    /* & > .MuiPaper-root {
        margin-bottom: 20px;
    } */
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 20px;

    font-family: 'Roboto', sans-serif;

    .col-12 {
        grid-column: 1/13;
    }
`;

const Root: React.FC = () => {

    const defaultHistoryWindowSize = localStorageGetNumber('defaultHistoryWindowSize', HISTORY_WINDOW_7DAYS);

    // state
    const [historyWindowSize, setHistoryWindowSize] = useState<number | undefined>(defaultHistoryWindowSize);

    const handleHistoryWindowSizeChange = (e: any) => {
        const stringValue = e.target.value;
        localStorageSet('defaultHistoryWindowSize', stringValue);
        setHistoryWindowSize(stringValue ? parseInt(stringValue, 10) : undefined);
    };

    return (
        <ApolloProvider client={apolloClient}>
            {/* { fetchInProgress && <LinearProgress style={{ width: '100%', position: "fixed", zIndex: 999 }} /> } */}
            <div className={rootStyles}>

                <FirstRow
                    historyWindowSize={historyWindowSize}
                    handleHistoryWindowSizeChange={handleHistoryWindowSizeChange}
                />

                <Chart
                    className="col-12"
                    historyWindowSize={historyWindowSize}
                    title="Temperature and pressure trend"
                />

                <ValveButtons
                    className="col-12"
                    historyWindowSize={historyWindowSize}
                />

                <ZigbeeDevices
                    className="col-12"
                    historyWindowSize={historyWindowSize}
                />

                {/* <YeelightDevices
                    className="col-12"
                    historyWindowSize={historyWindowSize}
                    onDeviceFeedback={messages => {
                        if (messages.length) {
                            // setYeelightDeviceMessages(messages.concat(yeelightDeviceMessages));
                        }
                    }}
                /> */}

                <SonoffDevices
                    className="col-12"
                    onDeviceFeedback={(data) => {
                        if (data.error === 0) {
                            // setSonoffDevices(produce(sonoffDevices, devices => {
                            //     devices.forEach(device => {
                            //         if (device.device_id === data.deviceId) {
                            //             device.switch = data.switch;
                            //             device.timestamp = Date.now();
                            //         }
                            //     });
                            // }));
                        }
                    }}
                />

                <Stats />

            </div>
        </ApolloProvider>
    );

};

Root.displayName = 'Root';

export default hot(module)(Root);
