/** @jsx jsx */

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { jsx, css, SerializedStyles } from '@emotion/core';
import moment from 'moment';

import {
    XYPlot,
    LineSeries,
    VerticalGridLines,
    HorizontalGridLines,
    XAxis,
    YAxis,
} from 'react-vis';

// const valueCss = css``;

// const unitCss = css`
//     align-self: flex-start;
//     color: ${grey[500]};
// `;

interface IMhzChartCardProps {
    seriesData: Array<{ x: number; y: number }>;
    css: SerializedStyles;
}

export default function MhzChartCard({ seriesData, css: rootCss }: IMhzChartCardProps) {
    return (
        <Card>
            <CardContent css={rootCss}>
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