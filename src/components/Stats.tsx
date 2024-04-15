import React from 'react';

import { useQuery } from '@apollo/client';
import { css, cx } from '@emotion/css';
import Paper from '@material-ui/core/Paper';

import KeyValuePaper from 'src/components/KeyValuePaper';
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

    const stats = { ...data.stats };
    delete stats.__typename;
    const data2 = Object.entries(stats);

    // console.log(stats);
    // console.log(data2);
    // data2.map(console.log);

    return (
        <KeyValuePaper data={data2} asCards />
    );
};

Stats.displayName = 'Stats';

export default Stats;
