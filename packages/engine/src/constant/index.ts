export * from './LogCode'

// baseType
export const BASE_START_NODE = 'start'

// eventType
export const EVENT_INSTANCE_COMPLETE = 'instance:complete'
export const EVENT_INSTANCE_INTERRUPTED = 'instance:interrupted'
export const EVENT_INSTANCE_ERROR = 'instance:error'

// flowStatus
export enum FlowStatus {
  COMPLETED = 'completed',
  INTERRUPTED = 'interrupted',
  RUNNING = 'running',
  PENDING = 'pending',
  ERROR = 'error',
}

// actionStatus
export enum ActionStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  INTERRUPTED = 'interrupted',
}
