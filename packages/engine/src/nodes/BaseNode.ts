import { createTaskId } from '../util/ID';

export interface BaseNodeInterface {
  outgoing: Record<string, any>[];
  incoming: Record<string, any>[];
  nodeId: string;
  taskId: string;
  type: string;
  readonly baseType: string;
  execute(taskUnit): Promise<void>;
}

export type NodeConstructor = {
  new (config: NodeConfig): BaseNode;
};

export type IncomingConfig = {
  id: string;
  condition?: Record<string, any>;
  source: string;
};

export type OutgoingConfig = {
  id: string;
  condition?: Record<string, any>;
  target: string;
};

export type NodeConfig = {
  id: string;
  type: string;
  properties?: Record<string, any>;
  incoming: IncomingConfig[];
  outgoing: OutgoingConfig[];
};

export type NextTaskUnit = {
  executionId: string;
  nodeId: string;
  taskId: string;
  outgoing: OutgoingConfig[];
};

export type ExecParams = {
  executionId: string;
  taskId: string;
  nodeId: string;
  next: (data: NextTaskUnit) => void;
};

export default class BaseNode implements BaseNodeInterface {
  static nodeTypeName = 'BaseNode';
  outgoing: OutgoingConfig[];
  incoming: IncomingConfig[];
  properties?: Record<string, any>;
  nodeId: string;
  taskId: string;
  type: string;
  readonly baseType: string;
  constructor(nodeConfig: NodeConfig) {
    this.outgoing = nodeConfig.outgoing;
    this.incoming = nodeConfig.incoming;
    this.nodeId = nodeConfig.id;
    this.type = nodeConfig.type;
    this.properties = nodeConfig.properties;
    this.baseType = 'base';
  }
  /**
   * 节点的每一次执行都会生成一个唯一的taskId
   */
  async execute(params: ExecParams) {
    const r = await this.action();
    const outgoing = await this.getOutgoing();
    r && params.next({
      executionId: params.executionId,
      taskId: params.taskId,
      nodeId: this.nodeId,
      outgoing,
    });
    // return r;
  }
  async getOutgoing() {
    return this.outgoing;
  }

  async action() {
    return true;
  }
}
