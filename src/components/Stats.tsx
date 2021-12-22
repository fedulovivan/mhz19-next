import React from 'react';

import { useQuery } from '@apollo/client';
import { css, cx } from '@emotion/css';
import Paper from '@material-ui/core/Paper';

import { QUERY_OPTIONS } from 'src/constants';
import * as queries from 'src/queries';

const Stats: React.FC = () => {

    const { loading, error, data } = useQuery(
        queries.GET_STATS, {
            ...QUERY_OPTIONS,
        }
    );

    if (loading) return <>Loading...</>;
    if (error) return <>{error.message}</>;

    const { stats } = data;

    return (
        <Paper
            elevation={2}
            className={cx(css`
                padding: 20px;
            `, 'col-12')}
        >
            {JSON.stringify(stats, null, ' ')}
        </Paper>
    );
};

Stats.displayName = 'Stats';

export default Stats;
