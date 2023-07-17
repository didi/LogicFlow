// baseType
export const BASE_START_NODE = 'start';

// event name
export const EVENT_INSTANCE_COMPLETE = 'instance:complete';
export const EVENT_INSTANCE_INTERRUPTED = 'instance:interrupted';

// flow status
export enum FlowStatus {
  COMPLETED = 'completed',
  INTERRUPTED = 'interrupted',
  RUNNING = 'running',
  ERROR = 'error',
}

// task status
export enum TaskStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  INTERRUPTED = 'interrupted',
}
