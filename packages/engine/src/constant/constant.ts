// baseType
export const BASE_START_NODE = 'start';

// event name
export const EVENT_INSTANCE_COMPLETE = 'instance:complete';
export const EVENT_INSTANCE_INTERRUPTED = 'instance:interrupted';
export const EVENT_INSTANCE_ERROR = 'instance:error';

// flow status
export enum FlowStatus {
  COMPLETED = 'completed',
  INTERRUPTED = 'interrupted',
  RUNNING = 'running',
  PENDING = 'pending',
  ERROR = 'error',
}

// action status
export enum ActionStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  INTERRUPTED = 'interrupted',
}
