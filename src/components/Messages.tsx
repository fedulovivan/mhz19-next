/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { css } from '@emotion/css';

const rootStyles = css`
    display: grid;
    grid-template-rows: 20px auto 25px;
    z-index: 999;
    position: absolute;
    width: 600px;
    height: 400px;
    background-color: white;
    border: 1px solid gray;
    border-radius: 5px;
    padding: 10px;
    header {
        font-size: 16px;
        font-weight: bold;
        overflow: hidden;
    }
    section {
        overflow-y: scroll;
        display: grid;
        grid-template-columns: 150px auto;
        grid-row-gap: 10px;
    }
    footer {
        display: flex;
        overflow: hidden;
    }
`;

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
});

const Messages: React.FC<{
    data: Array<any>;
    deviceId: string;
}> = ({ data, deviceId }) => {
    const [shownModal, setShowModal] = useState(false);
    // const [clickPosition, setClickPosition] = useState(null);
    const showMessage = (e) => {
        setShowModal(true);
        // setClickPosition(e.target);
        // alert(JSON.stringify(data, null, '  '));
        e.preventDefault();
        return false;
    };

    return (
        <>
            {shownModal && (
                <div
                    className={rootStyles}
                >
                    <header>{data.length} message(s) for device {deviceId}</header>
                    <section>
                        <div>Timestamp</div>
                        <div>JSON</div>
                        {
                            data.map((row, index) => {
                                const {
                                    device_id,
                                    timestamp,
                                    ...json
                                } = row;
                                return (
                                    <React.Fragment key={/* timezstamp */index}>
                                        <div>{dateFormatter.format(new Date(timestamp))}</div>
                                        <div>{JSON.stringify(json)}</div>
                                    </React.Fragment>
                                );
                            })
                        }
                    </section>
                    <footer>
                        <button type="button" onClick={() => setShowModal(false)}>Close</button>
                    </footer>
                </div>
            )}
            <a
                href="#"
                onClick={showMessage}
                className={css`margin-right: 5px;`}
                title={`View ${data.length} message(s)`}
            >
                view
            </a>
        </>
    );
};

export default Messages;
