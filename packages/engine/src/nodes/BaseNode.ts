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

export default class BaseNode implements BaseNodeInterface {
  static nodeTypeName = 'BaseNode';
  outgoing: Record<string, any>[];
  incoming: Record<string, any>[];
  nodeId: string;
  taskId: string;
  type: string;
  readonly baseType: string;
  constructor(nodeConfig) {
    this.outgoing = [];
    this.incoming = [];
    this.nodeId = nodeConfig.id;
    this.type = nodeConfig.type;
    this.baseType = 'base';
  }
  /**
   * 节点的每一次执行都会生成一个唯一的taskId
   */
  async execute(params) {
    console.log('BaseNode execute');
    this.taskId = createTaskId();
    const r = await this.action();
    console.log('outgoing', this.outgoing);
    const outgoing = await this.getOutgoing();
    r && params.next({
      executionId: params.executionId,
      taskId: this.taskId,
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
