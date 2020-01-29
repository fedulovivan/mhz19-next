/** @jsx jsx */

// eslint-disable-next-line no-unused-vars
import { jsx, SerializedStyles } from '@emotion/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import moment from 'moment';

import {
    XYPlot,
    LineSeries,
    VerticalGridLines,
    HorizontalGridLines,
    XAxis,
    YAxis,
} from 'react-vis';

import * as styles from './styles';

interface IMhzChartCardProps {
    seriesData: Array<{ x: number; y: number }>;
    css: SerializedStyles;
    loading: boolean;
}

export default function MhzChartCard({ seriesData, css: rootCss, loading }: IMhzChartCardProps) {
    return (
        <Card>
            <CardContent css={[rootCss, loading && styles.loading]}>
                <XYPlot width={300} height={200}>
                    <YAxis />
                    <XAxis tickTotal={5} tickFormat={v => moment(v).format('HH:mm')} />
                    <VerticalGridLines />
                    <HorizontalGridLines />
                    <LineSeries data={seriesData} />
                </XYPlot>
            </CardContent>
        </Card>
    );
}
