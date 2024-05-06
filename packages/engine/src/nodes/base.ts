import { Engine } from '..'
import { ActionStatus } from '../constant'
import { getExpressionResult } from '../platform'

export interface IBaseNodeProps {
  nodeConfig: BaseNode.NodeConfig
  context: Record<string, any>
  globalData: Record<string, unknown>
}

export class BaseNode implements BaseNode.Base {
  readonly baseType: string
  static nodeTypeName = 'BaseNode'

  /**
   * 节点的入边
   */
  incoming: BaseNode.IncomingConfig[]
  /**
   * 节点的出边
   */
  outgoing: BaseNode.OutgoingConfig[]
  /**
   * 节点的属性
   */
  properties?: Record<string, unknown>
  nodeId: Engine.Key
  type: string
  /**
   * 节点的上下文，是调用流程时传入的上下文
   */
  context: Record<string, any>
  /**
   * 节点的全局数据，是调用流程时传入的全局数据
   * 在计算表达式时，即基于全局数据进行计算
   */
  globalData: Record<string, unknown>

  constructor({ nodeConfig, context, globalData }: IBaseNodeProps) {
    const { outgoing, incoming, id, type, properties } = nodeConfig
    this.baseType = 'base'
    this.outgoing = outgoing
    this.incoming = incoming
    this.nodeId = id
    this.type = type
    this.properties = properties

    this.context = context
    this.globalData = globalData
  }

  /**
   * 节点的执行逻辑
   * @overridable 可以自定义节点重写此方法
   * @param param.executionId 流程执行记录 ID
   * @param param.actionId 此节点执行记录 ID
   * @param param.nodeId 节点 ID
   * @return 返回下一步的执行参数
   * 当不返回时，表示此节点执行成功，流程会继续执行下一步。
   * 当返回时，返回格式为
   */
  public async action(
    param?: Engine.ActionParam,
  ): Promise<BaseNode.ActionResult | undefined> {
    console.log('action param --->>>', param)
    return undefined
  }

  /**
   * 节点重新恢复执行的逻辑
   * @overridable 可以自定义节点重写此方法
   * @param params.executionId 流程执行记录 ID
   * @param params.actionId 此节点执行记录 ID
   * @param params.nodeId 节点 ID
   */
  public async onResume(params: Engine.ResumeParam): Promise<void> {
    console.log('onResume params --->>>', params)
    return undefined
  }

  /**
   * 判断该节点是否满足条件
   */
  private async isPass(properties?: Record<string, unknown>): Promise<boolean> {
    if (!properties) return true

    const { conditionExpression } = properties
    if (!conditionExpression) return true

    try {
      // bug：uuid 创建的 NodeId 为 xxxx-xxxx-xxxx-zzzz 格式，eval 执行时会将 - 识别为数学减号，导致执行报错
      // 解决方案： 赋值变量直接命名为 isPassResult, 因为每次执行 getExpressionResult 时，都会重新射程一个 context
      return await getExpressionResult(
        `
          const isPassResult = (${conditionExpression})
          return isPassResult
        `,
        {
          ...this.globalData,
        },
      )
    } catch (error) {
      return false
    }
  }

  /**
   * 获取当前节点执行的下一个节点
   */
  private async getOutgoing(): Promise<BaseNode.OutgoingConfig[]> {
    const outgoing: BaseNode.OutgoingConfig[] = []
    const expressions: any = []
    for (const item of this.outgoing) {
      const { properties } = item
      expressions.push(this.isPass(properties))
    }

    const result = await Promise.all(expressions)
    result.forEach((item, index) => {
      const out = this.outgoing[index]
      out.result = item
      outgoing.push(out)
    })
    return outgoing
  }

  /**
   * 节点的每一次执行都会生成一个唯一的 actionId
   */
  public async execute(
    params: Engine.ExecParam,
  ): Promise<Engine.NextActionParam> {
    const { executionId, actionId } = params
    const res = await this.action({
      nodeId: this.nodeId,
      executionId,
      actionId,
    })
    const status = res ? res.status : 'success'

    if (status === ActionStatus.SUCCESS) {
      const outgoing = await this.getOutgoing()
      const detail = res ? res.detail : {}
      params.next({
        status: ActionStatus.SUCCESS,
        detail,
        nodeId: this.nodeId,
        nodeType: this.type,
        properties: this.properties,
        executionId,
        actionId,
        outgoing,
      })
    }

    return {
      status,
      detail: res?.detail,
      executionId,
      actionId,
      nodeId: this.nodeId,
      nodeType: this.type,
      properties: this.properties,
      outgoing: [],
    }
  }

  public async resume(params: Engine.ExecResumeParam): Promise<undefined> {
    const outgoing = await this.getOutgoing()
    await this.onResume({
      executionId: params.executionId,
      actionId: params.actionId,
      nodeId: params.nodeId,
      data: params.data,
    })

    params.next({
      executionId: params.executionId,
      actionId: params.actionId,
      nodeId: this.nodeId,
      nodeType: this.type,
      properties: this.properties,
      outgoing,
      status: ActionStatus.SUCCESS,
    })
    return undefined
  }
}

export namespace BaseNode {
  export interface Base {
    incoming: IncomingConfig[]
    outgoing: OutgoingConfig[]
    properties?: Record<string, unknown>
    nodeId: Engine.Key
    type: string
    readonly baseType: string
    execute(actionParam: Engine.ActionParam): Promise<Engine.NextActionParam>
  }

  export type IncomingConfig = {
    id: Engine.Key
    source: string
    properties?: Record<string, unknown>
  }

  export type OutgoingConfig = {
    id: Engine.Key
    target: string
    properties?: Record<string, unknown>
    result?: string | boolean
  }

  export type NodeConfig = {
    id: Engine.Key
    type: string
    properties?: Record<string, unknown>
    incoming: IncomingConfig[]
    outgoing: OutgoingConfig[]
  }

  export type NodeConstructor = {
    new (config: {
      nodeConfig: NodeConfig
      context: Record<string, any>
      globalData: Record<string, unknown>
    }): BaseNode
  }

  export type ActionResult = {
    status: ActionStatus
    detail?: Record<string, unknown>
  }
}

export default BaseNode
