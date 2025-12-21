import { progressStore } from './progress-store.js';

export class ProgressReporter {
    constructor(jobId, logger) {
        this.jobId = jobId;

        this.logger = logger;

        if (!progressStore.has(jobId)) {
            progressStore.set(jobId, {
                events: [],
                listeners: new Set(),
                pdf: null,
            });
        }
    }

    report(event) {
        const entry = progressStore.get(this.jobId);

        this.logger.info(event);

        entry.events.push({
            ...event,
            ts: Date.now(),
        });

        for (const listener of entry.listeners) {
            listener(event);
        }
    }

    subscribe(listener) {
        const entry = progressStore.get(this.jobId);

        for (const event of entry.events) {
            listener(event);
        }

        entry.listeners.add(listener);

        return () => {
            entry.listeners.delete(listener);
        };
    }
}
