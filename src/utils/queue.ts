import logger, { withDebug } from 'src/logger';

import type { DEVICE } from '../constants';

const debug = withDebug('queue');

interface IQueueCtrOpts<T> {
    throttle: number;
    srcDeviceId: DEVICE;
    onFlushed: (items: Array<T>) => void;
}

export default class Queue<T> {
    private queue: Array<T> = [];
    private opts: IQueueCtrOpts<T>;
    private timer: NodeJS.Timeout | undefined;
    constructor(opts: IQueueCtrOpts<T>) {
        this.opts = opts;
        debug(`Queue created for srcDeviceId=${this.opts.srcDeviceId}`);
    }
    private flush(): Array<T> {
        debug(`Going to flush queue with ${this.queue.length} messages for ${this.opts.srcDeviceId}`);
        const result = [...this.queue];
        this.queue = [];
        this.timer = undefined;
        return result;
    }
    public push(item: T): void {
        this.queue.push({
            ...item,
            timestamp: Date.now(),
        });
        if (!this.timer) {
            this.timer = setTimeout(
                () => this.opts.onFlushed(this.flush()),
                this.opts.throttle,
            );
        }
        debug(`message added to queue, current length ${this.queue.length}`);
    }
}
