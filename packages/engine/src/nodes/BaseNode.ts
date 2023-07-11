import { getExpressionResult } from '../expression';

export interface BaseNodeInterface {
  outgoing: Record<string, any>[];
  incoming: Record<string, any>[];
  nodeId: string;
  type: string;
  readonly baseType: string;
  execute(taskUnit): Promise<boolean>;
}

export type NodeConstructor = {
  new (config: {
    nodeConfig: NodeConfig;
    context: Record<string, any>;
    globalData: Record<string, any>;
  }): BaseNode;
};

export type IncomingConfig = {
  id: string;
  properties?: Record<string, any>;
  source: string;
};

export type OutgoingConfig = {
  id: string;
  target: string;
  properties?: Record<string, any>;
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
  nodeType: string;
  outgoing: OutgoingConfig[];
  properties?: Record<string, any>;
};

export type ExecParams = {
  executionId: string;
  taskId: string;
  nodeId: string;
  next: (data: NextTaskUnit) => void;
};

export default class BaseNode implements BaseNodeInterface {
  static nodeTypeName = 'BaseNode';
  /**
   * 节点的出边
   */
  outgoing: OutgoingConfig[];
  /**
   * 节点的入边
   */
  incoming: IncomingConfig[];
  /**
   * 节点的属性
   */
  properties?: Record<string, any>;
  nodeId: string;
  type: string;
  /**
   * 节点的上下文，是调用流程时传入的上下文
   */
  context: Record<string, any>;
  /**
   * 节点的全局数据，是调用流程时传入的全局数据。
   * 在计算表达式时，即基于全局数据进行计算。
   */
  globalData: Record<string, any>;
  readonly baseType: string;
  constructor({ nodeConfig, context, globalData }) {
    this.outgoing = nodeConfig.outgoing;
    this.incoming = nodeConfig.incoming;
    this.nodeId = nodeConfig.id;
    this.type = nodeConfig.type;
    this.properties = nodeConfig.properties;
    this.context = context;
    this.globalData = globalData;
    this.baseType = 'base';
  }
  /**
   * 节点的每一次执行都会生成一个唯一的taskId
   */
  async execute(params: ExecParams): Promise<boolean> {
    const r = await this.action();
    const outgoing = await this.getOutgoing();
    r && params.next({
      executionId: params.executionId,
      taskId: params.taskId,
      nodeId: this.nodeId,
      nodeType: this.type,
      properties: this.properties,
      outgoing,
    });
    return r;
  }
  async getOutgoing() {
    const outgoing = [];
    const expressions = [];
    for (const item of this.outgoing) {
      const { id, target, properties } = item;
      expressions.push(this.isPass(properties));
    }
    const result = await Promise.all(expressions);
    result.forEach((item, index) => {
      if (item) {
        outgoing.push(this.outgoing[index]);
      }
    });
    return outgoing;
  }
  async isPass(properties) {
    if (!properties) return true;
    const { conditionExpression } = properties;
    if (!conditionExpression) return true;
    try {
      const result = await getExpressionResult(`result${this.nodeId} = (${conditionExpression})`, {
        ...this.globalData,
      });
      return result[`result${this.nodeId}`];
    } catch (e) {
      return false;
    }
  }
  /**
   * 节点的执行逻辑
   * @returns {boolean} 返回true表示执行成功，返回false表示执行失败,中断流程执行
   */
  async action() {
    return true;
  }
}
