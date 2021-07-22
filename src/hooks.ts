/**
 * Copyright (c) DANATEQ PTE Ltd 2010-2020. All Rights Reserved.
 */

/* eslint-disable import/prefer-default-export */

import { useCallback, useState } from 'react';

/**
 * creates boolean state value with useState
 * and publishes two setters for it: for toggling on/off
 */
export const useBooleanState = (intialValue: boolean): [
    boolean,
    () => void,
    () => void
] => {
    const [value, set] = useState(intialValue);
    const on = useCallback((): void => set(true), [set]);
    const off = useCallback((): void => set(false), [set]);
    return [value, on, off];
};
