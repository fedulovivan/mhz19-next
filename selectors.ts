import { createSelector } from 'reselect';
import each from 'lodash/each';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import last from 'lodash/last';

export const getZigbeeDevivesMessages = (state: IInitialState) => state.zigbeeDevivesMessages;

export const getZigbeeDevices = (state: IInitialState) => state.zigbeeDevices;

export const getMhzDocs = (state: IInitialState) => state.mhzDocs;

export const getHistoryOption = (state: IInitialState) => state.historyOption;

export const isPendingGetMhzDocs = (state: IInitialState) => state.isPendingGetMhzDocs;

export const getLastMhzDoc = createSelector(
    getMhzDocs,
    (docs) => last(docs),
);

export const getLastMhzDocCo2 = createSelector(
    getLastMhzDoc,
    (lastMhzDoc) => lastMhzDoc?.co2
);

export const getLastMhzDocTemp = createSelector(
    getLastMhzDoc,
    (lastMhzDoc) => lastMhzDoc?.temp
);


export const getSeriesData = createSelector(
    getMhzDocs,
    (mhzDocs) => (
        mhzDocs
            ? mhzDocs.map(({ co2, timestamp }) => ({ x: timestamp, y: co2 }))
            : []
    ),
);

export const getZigbeeDevicesSortedByType = createSelector(
    getZigbeeDevices,
    (devices) => sortBy(devices, 'type'),
);

export const getLatestMessages = createSelector(
    getZigbeeDevivesMessages,
    (messages): { [topic: string]: IAqaraWaterSensorMessage | IAqaraPowerPlugMessage } => {
        const result: { [topic: string]: IAqaraWaterSensorMessage | IAqaraPowerPlugMessage } = {};
        const sorted = sortBy(messages, 'timestamp');
        const groupped = groupBy(sorted, 'topic');
        each(groupped, (group, topic) => {
            if (group.length > 0) {
                result[topic] = group[group.length - 1];
            }
        });
        return result;
    }
);
