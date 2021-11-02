export function localStorageSet(field: string, value: number) {
    window.localStorage.setItem(field, String(value));
}

export function toZigbeeDeviceFormat(foo: IValveStateMessage) {
    return {
        description: `Valves manipulator box`,
        friendly_name: `valves-manipulator-box`,
        ...foo,
    };
}

export function localStorageGetNumber(field: string, defValue: number): number {
    const val = window.localStorage.getItem(field);
    if (val) return Number(val);
    return defValue;
}

export const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
});

export const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
});

export const durationFormatter = (rawMillis: number) => {
    const millis = Math.abs(rawMillis);
    const MS_IN_HOUR = 1000 * 3600;
    const MS_IN_MINUTE = 1000 * 60;
    const hours = Math.floor(millis / MS_IN_HOUR);
    const minutes = Math.floor((millis - hours * MS_IN_HOUR) / MS_IN_MINUTE);
    return `${hours}h ${minutes}m`;
};
