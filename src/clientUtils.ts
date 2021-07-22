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
