import { TaskStatus } from '../constant/constant';
import { getExpressionResult } from '../expression';
import type {
  ActionResult,
  NodeExecResult,
  ExecResumeParams,
  ExecParams,
} from '../types.d';

export interface BaseNodeInterface {
  outgoing: Record<string, any>[];
  incoming: Record<string, any>[];
  nodeId: string;
  type: string;
  readonly baseType: string;
  execute(taskParam): Promise<NodeExecResult>;
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

export type NextTaskParam = {
  executionId: string;
  nodeId: string;
  taskId: string;
  nodeType: string;
  outgoing: OutgoingConfig[];
  properties?: Record<string, any>;
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
  public async execute(params: ExecParams): Promise<NodeExecResult> {
    const r = await this.action({
      executionId: params.executionId,
      taskId: params.taskId,
      nodeId: this.nodeId,
    });
    if (!r || r.status === TaskStatus.SUCCESS) {
      const outgoing = await this.getOutgoing();
      params.next({
        executionId: params.executionId,
        taskId: params.taskId,
        nodeId: this.nodeId,
        nodeType: this.type,
        properties: this.properties,
        outgoing,
      });
    }
    return {
      status: r && r.status,
      detail: r && r.detail,
      executionId: params.executionId,
      taskId: params.taskId,
      nodeId: this.nodeId,
      nodeType: this.type,
      properties: this.properties,
    };
  }
  /**
   * 节点在执行中断后，可以通过resume方法恢复执行。
   * 自定义节点时不建议重写此方法
   */
  public async resume(params: ExecResumeParams): Promise<undefined> {
    const outgoing = await this.getOutgoing();
    await this.onResume({
      executionId: params.executionId,
      nodeId: params.nodeId,
      taskId: params.taskId,
      data: params.data,
    });
    params.next({
      executionId: params.executionId,
      taskId: params.taskId,
      nodeId: this.nodeId,
      nodeType: this.type,
      properties: this.properties,
      outgoing,
    });
    return undefined;
  }
  private async getOutgoing(): Promise<OutgoingConfig[]> {
    const outgoing = [];
    const expressions = [];
    for (const item of this.outgoing) {
      const { properties } = item;
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
  private async isPass(properties) {
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
   * @overridable 可以自定义节点重写此方法。
   * @param params.executionId 流程执行记录ID
   * @param params.taskId 此节点执行记录ID
   * @param params.nodeId 节点ID
   */
  public async action(params: {
    executionId: string;
    taskId: string;
    nodeId: string;
  }): Promise<ActionResult> {
    return undefined;
  }
  /**
   * 节点的重新恢复执行逻辑
   * @overridable 可以自定义节点重写此方法。
   * @param params.executionId 流程执行记录ID
   * @param params.taskId 此节点执行记录ID
   * @param params.nodeId 节点ID
   */
  public async onResume(params: {
    executionId: string,
    taskId: string,
    nodeId: string,
    data?: Record<string, any>,
  }): Promise<void> {
    return undefined;
  }
}
