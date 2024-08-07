import { ActionStatus } from '../constant/constant';
import { getExpressionResult } from '../expression';
import type {
  NextActionParam,
  ActionResult,
  ExecResumeParams,
  ExecParams,
  OutgoingConfig,
} from '../types.d';

export interface BaseNodeInterface {
  outgoing: Record<string, any>[];
  incoming: Record<string, any>[];
  nodeId: string;
  type: string;
  readonly baseType: string;
  execute(actionParam): Promise<NextActionParam>;
}

export type NodeConstructor = {
  new (config: {
    nodeConfig: NodeConfig;
    context: Record<string, any>;
    globalData: Record<string, any>;
  }): BaseNode;
  action(params: {
    executionId: string;
    actionId: string;
    nodeId: string;
  }): Promise<NextActionParam>;
  onResume(params: {
    executionId: string;
    actionId: string;
    nodeId: string;
    data?: Record<string, any>;
  }): Promise<void>;
};

export type IncomingConfig = {
  id: string;
  properties?: Record<string, any>;
  source: string;
};

export type NodeConfig = {
  id: string;
  type: string;
  properties?: Record<string, any>;
  incoming: IncomingConfig[];
  outgoing: OutgoingConfig[];
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
    this.properties = nodeConfig.properties || {};
    this.context = context;
    this.globalData = globalData;
    this.baseType = 'base';
  }
  /**
   * 节点的每一次执行都会生成一个唯一的actionId
   */
  public async execute(params: ExecParams): Promise<NextActionParam> {
    const r = await this.action({
      executionId: params.executionId,
      actionId: params.actionId,
      nodeId: this.nodeId,
    });
    const status = r ? r.status : 'success';
    if (status === ActionStatus.SUCCESS) {
      const outgoing = await this.getOutgoing();
      const detail = r ? r.detail : {};
      params.next({
        status: ActionStatus.SUCCESS,
        detail,
        executionId: params.executionId,
        actionId: params.actionId,
        nodeId: this.nodeId,
        nodeType: this.type,
        properties: this.properties,
        outgoing,
      });
    }
    return {
      status,
      detail: r && r.detail,
      executionId: params.executionId,
      actionId: params.actionId,
      nodeId: this.nodeId,
      nodeType: this.type,
      properties: this.properties,
      outgoing: [],
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
      actionId: params.actionId,
      data: params.data,
    });
    params.next({
      executionId: params.executionId,
      actionId: params.actionId,
      nodeId: this.nodeId,
      nodeType: this.type,
      properties: this.properties,
      outgoing,
      status: ActionStatus.SUCCESS,
    });
    return undefined;
  }
  private async getOutgoing(): Promise<OutgoingConfig[]> {
    const outgoing: OutgoingConfig[] = [];
    const expressions = [];
    for (const item of this.outgoing) {
      const { properties } = item;
      expressions.push(this.isPass(properties));
    }
    const result = await Promise.all(expressions);
    result.forEach((item, index) => {
      const out = this.outgoing[index];
      out.result = item;
      outgoing.push(out);
    });
    return outgoing;
  }
  private async isPass(properties) {
    if (!properties) return true;
    const { conditionExpression } = properties;
    if (!conditionExpression) return true;
    try {
      // bug：uuid 创建的 NodeId 为 xxxx-xxxx-xxxx-zzzz 格式，eval 执行时会将 - 识别为数学减号，导致执行报错
      // 解决方案： 赋值变量直接命名为 isPassResult, 因为每次执行 getExpressionResult 时，都会重新射程一个 context
      const result = await getExpressionResult(`isPassResult = (${conditionExpression})`, {
        ...this.globalData,
      });
      return result.isPassResult;
    } catch (e) {
      return false;
    }
  }
  /**
   * 节点的执行逻辑
   * @overridable 可以自定义节点重写此方法。
   * @param params.executionId 流程执行记录ID
   * @param params.actionId 此节点执行记录ID
   * @param params.nodeId 节点ID
   * @returns 返回下一步的执行参数
   * 当不返回时，表示此节点执行成功，流程会继续执行下一步。
   * 当返回时，返回格式
   */
  public async action(params: {
    executionId: string;
    actionId: string;
    nodeId: string;
  }): Promise<ActionResult> {
    return null;
  }
  /**
   * 节点的重新恢复执行逻辑
   * @overridable 可以自定义节点重写此方法。
   * @param params.executionId 流程执行记录ID
   * @param params.actionId 此节点执行记录ID
   * @param params.nodeId 节点ID
   */
  public async onResume(params: {
    executionId: string,
    actionId: string,
    nodeId: string,
    data?: Record<string, any>,
  }): Promise<void> {
    return undefined;
  }
}
