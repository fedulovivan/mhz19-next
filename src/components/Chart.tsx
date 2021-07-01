/* eslint-disable prefer-template */
/* eslint-disable object-shorthand */
/* eslint-disable no-empty-pattern */

import React from 'react';

import {
  blue,
  green,
  grey,
  red,
} from '@material-ui/core/colors';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import brokenAxis from 'highcharts/modules/broken-axis';
import sortBy from 'lodash/sortBy';

import { NO_DATA_GAP } from 'src/constants';
import { IZigbeeDeviceMessage } from 'src/typings/index.d';

brokenAxis(Highcharts);

Highcharts.setOptions({
    time: {
        useUTC: false,
    }
});

function smooth(series: Array<[number, number]>, windowMargin = 3): Array<[number, number]> {
    const newseries: Array<[number, number]> = [];
    series.forEach((point, index) => {
        const valuesSlice = series
            .slice(index - windowMargin, index + windowMargin)
            .map(([timestamp, value]) => value);
        const sliceSum = valuesSlice?.length
            ? valuesSlice.reduce((memo, value) => memo + value)
            : undefined;
        if (sliceSum) {
            newseries.push([
                point[0],
                sliceSum / valuesSlice.length
            ]);
        } else {
            newseries.push(point);
        }
    });
    return newseries;
}

/**
 * was implemented before I've found gapSize options
 * but this utility may be usefull for making gaps, generated by gapSize, more narrow
 * see https://api.highcharts.com/highcharts/xAxis.breaks
 */
function getBreaks(sortedMessages: Array<{ timestamp: number }>): Array<Highcharts.XAxisBreaksOptions> {
    const result: Array<Highcharts.XAxisBreaksOptions> = [];
    let prevTick: number = 0;
    sortedMessages.forEach(({ timestamp }) => {
        const diff = timestamp - prevTick;
        if (prevTick !== 0 && diff > NO_DATA_GAP) {
            result.push({ from: prevTick, to: timestamp, breakSize: 1 });
        }
        prevTick = timestamp;
    });
    return result;
}

const SERIES_COLORS = [
    green[500],
    blue[400],
];

const Chart: React.FC<{
    messages: Array<{ deviceId: SVGStringList; timestamp: number } & IZigbeeDeviceMessage>;
    title: string;
}> = ({
    messages,
    title,
}) => {

    let temperatureSeries: Highcharts.SeriesLineOptions["data"] = [];
    let pressureSeries: Highcharts.SeriesLineOptions["data"] = [];
    const humiditySeries: Highcharts.SeriesLineOptions["data"] = [];

    const sortedMessages = sortBy(messages, 'timestamp');

    sortedMessages.forEach(({
        timestamp, temperature, pressure, humidity
    }) => {
        temperatureSeries.push([timestamp, temperature]);
        pressureSeries.push([timestamp, pressure / 1.33322]);
        humiditySeries.push([timestamp, humidity]);
    });

    // temperatureSeries = smooth(temperatureSeries, 10);
    pressureSeries = smooth(pressureSeries, 10);

    const options: Highcharts.Options = {
        chart: {
            zoomType: 'x',
        },
        credits: {
            enabled: false,
        },
        legend: {
            enabled: false
        },
        title: {
            text: title,
        },
        yAxis: [{
            title: {
                text: 'Temperature, C',
                style: { color: SERIES_COLORS[0] },
            },
            // lineColor: SERIES_COLORS[0],
            labels: { style: { color: SERIES_COLORS[0] } },
        }, {
            title: {
                text: 'Pressure, mmh',
                style: { color: SERIES_COLORS[1] },
            },
            opposite: true,
            // lineColor: SERIES_COLORS[1],
            labels: { style: { color: SERIES_COLORS[1] } },
        }/* , {
            title: {
                text: 'Humidity, %',
            },
            opposite: true,
        } */],
        xAxis: {
            type: 'datetime',
            // breaks: getBreaks(sortedMessages),
        },
        tooltip: {
            formatter: function () {
                // eslint-disable-next-line react/no-this-in-sfc
                return Highcharts.dateFormat('%B %e, %Y %H:%M', this.x) + '<br/>' + Highcharts.numberFormat(this.y, 2);
            }
        },
        series: [{
            type: 'line',
            data: temperatureSeries,
            yAxis: 0,
            color: SERIES_COLORS[0],
            gapSize: NO_DATA_GAP,
        }, {
            type: 'line',
            data: pressureSeries,
            yAxis: 1,
            color: SERIES_COLORS[1],
            gapSize: NO_DATA_GAP,
        }/* , {
            type: 'line',
            data: humiditySeries,
            yAxis: 2,
        } */],
    };

    return (
        <HighchartsReact
            highcharts={Highcharts}
            options={options}
        />
    );
};

export default Chart;