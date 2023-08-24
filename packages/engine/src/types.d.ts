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
export type ActionParam = {
  actionId: string;
} & NodeParam;

export type ActionStatus = 'success' | 'error' | 'interrupted' | 'pending';

export type OutgoingConfig = {
  id: string;
  target: string;
  properties?: Record<string, any>;
  result?: string;
};

export type ActionResult =  {
  status: ActionStatus;
  detail?: Record<string, any>;
} | void;

export type NextActionParam = {
  executionId: string;
  nodeId: string;
  actionId: string;
  nodeType: string;
  outgoing: OutgoingConfig[];
  properties?: Record<string, any>;
  detail?: Record<string, any>;
  status: ActionStatus;
}

export type ExecParams = {
  next: (data: NextActionParam) => void;
} & ActionParam;

export type ResumeParam = {
  data: Record<string, any>;
} & ActionParam;

export type ExecResumeParams = {
  next: (data: NextActionParam) => void;
} & ResumeParam;

export type RecorderData = {
  timestamp: number;
} & NextActionParam;

export interface RecorderInterface {
  addActionRecord: (task: RecorderData) => Promise<void>;
  getActionRecord: (actionId: string) => Promise<RecorderData>;
  getExecutionActions: (executionId: string) => Promise<string[]>;
  clear: () => void;
};

export type ResumeParams = {
  executionId: string;
  actionId: string;
  nodeId: string;
  data?: Record<string, any>;
}

export declare type Point = {
  id?: string;
  x: number;
  y: number;
  [key: string]: unknown;
};

export declare type TextConfig = {
  value: string;
} & Point;
export declare type GraphConfigData = {
  nodes: NodeConfig[];
  edges: EdgeConfig[];
};
export declare type NodeConfig = {
  id?: string;
  type: string;
  x: number;
  y: number;
  text?: TextConfig | string;
  zIndex?: number;
  properties?: Record<string, unknown>;
};
export declare type EdgeConfig = {
  id?: string;
  /**
   * 边的类型，不传默认为lf.setDefaultEdgeType(type)传入的类型。
   * LogicFlow内部默认为polyline
   */
  type?: string;
  sourceNodeId: string;
  sourceAnchorId?: string;
  targetNodeId: string;
  targetAnchorId?: string;
  startPoint?: {
      x: number;
      y: number;
  };
  endPoint?: {
      x: number;
      y: number;
  };
  text?: {
      x: number;
      y: number;
      value: string;
  } | string;
  pointsList?: Point[];
  zIndex?: number;
  properties?: Record<string, unknown>;
};

export declare type EngineConstructorOptions = {
  context?: Record<string, any>;
}
