/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';

import { css } from '@emotion/css';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { DataGrid, GridColumns } from '@material-ui/data-grid';
import useOnclickOutside from 'react-cool-onclickoutside';

import { dateFormatter } from 'src/clientUtils';

const rootStyles = css`
    display: grid;
    grid-template-rows: 20px auto 35px;
    z-index: 999;
    position: absolute;
    width: 600px;
    height: 400px;
    padding: 10px;
    header {
        font-size: 16px;
        font-weight: bold;
        overflow: hidden;
    }
    section {
        /* overflow-y: scroll;
        display: grid;
        grid-template-columns: 150px auto;
        grid-row-gap: 10px; */
    }
    footer {
        /* display: flex;
        overflow: hidden; */
    }
`;

const columns: GridColumns = [
    {
        field: 'timestamp', headerName: 'Timestamp', flex: 1, sortable: false,
    },
    {
        field: 'json', headerName: 'JSON', flex: 2, sortable: false,
    }
];

function toDataGridRows(sortedMessages: Array<any>): Array<any> {
    return sortedMessages.map((row, index) => {
        const {
            device_id,
            timestamp,
            ...json
        } = row;
        const id = [timestamp, index].join('-');
        return {
            id,
            timestamp: dateFormatter.format(new Date(timestamp)),
            json: JSON.stringify(json),
        };
    });
}

const Messages: React.FC<{
    sortedMessages: Array<any>;
    deviceId: string;
}> = ({ sortedMessages, deviceId }) => {
    const [shownModal, setShowModal] = useState(false);
    const showMessage = (e) => {
        setShowModal(true);
        e.preventDefault();
        return false;
    };
    const ref = useOnclickOutside(() => {
        setShowModal(false);
    });
    return (
        <>
            {shownModal && (
                <Paper
                    elevation={3}
                    className={rootStyles}
                    ref={ref}
                >
                    <header>{sortedMessages.length} message(s) for device {deviceId}</header>
                    <section>
                        <DataGrid
                            columns={columns}
                            rows={toDataGridRows(sortedMessages)}
                            // pageSize={10}
                            autoPageSize
                        />
                    </section>
                    <footer>
                        <Button
                            onClick={() => setShowModal(false)}
                            variant="outlined"
                            color="primary"
                            // size="large"
                        >
                            Close
                        </Button>
                    </footer>
                </Paper>
            )}
            <Link
                href="#"
                onClick={showMessage}
                className={css`margin-right: 5px;`}
                title={`View ${sortedMessages.length} message(s)`}
            >
                view
            </Link>
        </>
    );
};

export default Messages;
