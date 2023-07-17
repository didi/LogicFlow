/**
 * 即将执行的节点参数
 */
export type NodeParam = {
  executionId: string;
  nodeId: string;
}
/**
 * 执行节点的参数
 */
export type TaskParam = {
  taskId: string;
} & NodeParam;

export type ExecParams = {
  next: (data: NextTaskParam) => void;
} & TaskParam;

export type ResumeParam = {
  data: Record<string, any>;
} & TaskParam;

export type ExecResumeParams = {
  next: (data: NextTaskParam) => void;
} & ResumeParam;

export type RecorderData = {
  nodeType: string;
  timestamp: number;
  properties?: Record<string, any>;
} & TaskParam;

export interface RecorderInterface {
  addTask: (task: RecorderData) => Promise<void>;
  getTask: (taskId: string) => Promise<RecorderData>;
  getExecutionTasks: (executionId: string) => Promise<string[]>;
  clear: () => void;
};

export type TaskStatus = 'success' | 'error' | 'interrupted' | '';

export type ActionResult = {
  status?: TaskStatus;
  detail?: Record<string, any>;
};

export type NodeExecResult = {
  executionId: string,
  taskId: string,
  nodeId: string,
  nodeType: string,
  properties?: Record<string, any>,
} & ActionResult;

export type ResumeParams = {
  executionId: string;
  taskId: string;
  nodeId: string;
  data?: Record<string, any>;
}
