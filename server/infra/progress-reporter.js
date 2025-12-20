import { EventEmitter } from 'events';

// export type ProgressEvent = {
//     stage: 'upload' | 'stt' | 'llm' | 'pdf' | 'done' | 'error';
//     level?: 'info' | 'debug' | 'warn' | 'error';
//     message: string;
//     meta?: Record<string, any>;
// };

export class ProgressReporter extends EventEmitter {
    constructor(logger) {
        super();

        this.logger = logger;
    }

    report(event) {
        const level = event.level || 'info';

        this.logger[level](
            { stage: event.stage, meta: event.meta },
            event.message
        );

        this.emit('progress', {
            stage: event.stage,
            level,
            message: event.message,
        });
    }
}
