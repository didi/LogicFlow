import { Engine } from '.'
import { Recorder } from './recorder'
import { Scheduler } from './Scheduler'
import { BaseNode } from './nodes'
import { createExecId } from './utils'
import {
  EVENT_INSTANCE_COMPLETE,
  EVENT_INSTANCE_INTERRUPTED,
  EVENT_INSTANCE_ERROR,
  ErrorCode,
  getErrorMsg,
} from './constant'

export class FlowModel {
  /**
   * 流程支持的节点类型.
   */
  nodeModelMap: Map<string, BaseNode.NodeConstructor>
  /**
   * 调度器，用于调度节点执行
   */
  scheduler: Scheduler
  /**
   * 待执行的队列，当流程正在执行时，如果再次触发执行。那么会将执行参数放到队列中，等待上一次执行完成后再执行。
   */
  executeList: Partial<FlowModel.ExecParam>[]
  /**
   * 当前正在执行的任务。当监听到调度器执行完成时，触发执行参数中的回调，告知外部执行完成。
   */
  executingInstance?: FlowModel.ExecParam | null
  /**
   * 当前流程模型中的所有节点，边会被转换成节点的 incoming 和 outgoing 属性
   */
  nodeConfigMap: Map<Engine.Key, BaseNode.NodeConfig> = new Map()
  /**
   * 当流程正在执行时，如果再次触发执行。那么会将执行参数放入到队列中，等待上一次执行完成后再执行。
   */
  isRunning: boolean
  /**
   * 开始接地那类型，在执行流程时，会从这些节点开始执行
   */
  startNodeType: string
  /**
   * 当前流程中开始节点组成的数组
   */
  startNodes: BaseNode.NodeConfig[] = []
  /**
   * 用于存储全局数据，最终会传递给每个节点
   */
  globalData: Record<string, unknown> = {}

  /**
   * 外部传入的上下文，最终会传递给每个节点
   * 例如：
   * const context = {
   *   request: {
   *     get: (url) => {
   *       return fetch(url);
   *     },
   *   },
   * }
   * 在节点内可以通过 this.context.request.get(url) 来调用。
   */
  context: Record<string, unknown>

  constructor({
    nodeModelMap,
    recorder,
    context = {},
    globalData = {},
    startNodeType = 'StartNode',
  }: FlowModel.IFlowModelProps) {
    // 流程包含的节点类型 ??? 在 load 代码中又初始化了一遍，为什么要传进来
    this.nodeModelMap = nodeModelMap
    // 需要执行的队列
    this.executeList = []
    // 执行中的任务
    this.executingInstance = null
    // 外部传入的上下文，最终会传递给每个节点
    this.context = context
    // 用于存储全局数据，可以在流程中共享
    this.globalData = globalData
    // 开始节点类型，在执行流程时，会从这些节点开始执行
    this.startNodeType = startNodeType
    this.isRunning = false
    this.scheduler = new Scheduler({
      flowModel: this,
      recorder,
    })

    this.scheduler.on(EVENT_INSTANCE_COMPLETE, (result) => {
      this.onExecuteFinished(result)
    })

    this.scheduler.on(EVENT_INSTANCE_INTERRUPTED, (result) => {
      this.onExecuteFinished(result)
    })

    this.scheduler.on(EVENT_INSTANCE_ERROR, (result) => {
      this.onExecuteFinished(result)
    })
  }

  /**
   * 解析LogicFlow图数据，将nodes和edges转换成节点格式。
   * 例如：
   * graphData: {
   *  nodes: [
   *   { id: 'node1', type: 'StartNode', properties: {} },
   *   { id: 'node2', type: 'TaskNode', properties: {} },
   *  ],
   *  edges: [
   *    { id: 'edge1', sourceNodeId: 'node1', targetNodeId: 'node2', properties: {} },
   *  ]
   * }
   * 转换成：
   * nodeConfigMap: {
   *  node1: {
   *    id: 'node1',
   *    type: 'StartNode',
   *    properties: {},
   *    incoming: [],
   *    outgoing: [{ id: 'edge1', properties: {}, target: 'node2' }]
   *  },
   *  node2: {
   *   id: 'node2',
   *   type: 'TaskNode',
   *   properties: {},
   *   incoming: [{ id: 'edge1', properties: {}, source: 'node1' }],
   *   outgoing: [],
   *  }
   * }
   * 此格式方便后续执行时，根据节点id快速找到节点和执行初始化节点模型。
   * 同时此方法还会找到所有的开始节点，方便后续执行时，从开始节点开始执行。
   * @param graphData 流程图数据
   */
  public load(graphData: Engine.GraphConfigData) {
    const { nodes = [], edges = [] } = graphData
    nodes.forEach((node) => {
      if (this.nodeModelMap.has(node.type)) {
        const nodeConfig: BaseNode.NodeConfig = {
          id: node.id,
          type: node.type,
          properties: node.properties,
          incoming: [],
          outgoing: [],
        }
        this.nodeConfigMap.set(node.id, nodeConfig)
        if (node.type === this.startNodeType) {
          this.startNodes.push(nodeConfig)
        }
      } else {
        console.warn(`未识别的节点类型：${node.type}`)
      }
    })

    edges.forEach((edge) => {
      const sourceNode = this.nodeConfigMap.get(edge.sourceNodeId)
      const targetNode = this.nodeConfigMap.get(edge.targetNodeId)
      if (sourceNode) {
        sourceNode.outgoing.push({
          id: edge.id,
          properties: edge.properties,
          target: edge.targetNodeId,
        })
      }
      if (targetNode && targetNode.type !== this.startNodeType) {
        targetNode.incoming.push({
          id: edge.id,
          properties: edge.properties,
          source: edge.sourceNodeId,
        })
      }
    })
  }

  /**
   * 从待执行队列中取出需要执行的内容。
   * 会依次判断是否有 actionId、nodeId、executionId。
   * 若存在 actionId，那么表示恢复执行
   * 若存在 nodeId，那么表示从指定节点开始执行
   * 若都不存在，那么新建一个 executionId，从开始节点开始执行
   * @private
   */
  private createExecution(execParam: Partial<FlowModel.ExecParam>) {
    this.executeList.push(execParam)

    // 如果有 actionId，则表示恢复执行
    // TODO: 待测试，确认该流程
    if (execParam.actionId && execParam.nodeId && execParam.executionId) {
      this.scheduler.resume({
        executionId: execParam.executionId,
        actionId: execParam.actionId,
        nodeId: execParam.nodeId,
        data: execParam.data,
      })
      return
    }

    // 否则，判断 executionId 是否存在，使用 executionId 或创建新的 execution，从开始节点开始执行
    // const executionId = execParam?.executionId || createExecId()
    const executionId = createExecId()
    execParam.executionId = executionId

    // 当指定了具体需要执行的节点时，执行下面方法
    if (execParam?.nodeId) {
      const nodeConfig = this.nodeConfigMap.get(execParam.nodeId)
      if (!nodeConfig) {
        execParam?.onError?.(
          new Error(
            `${getErrorMsg(ErrorCode.NONE_NODE_ID)}(${execParam.nodeId})`,
          ),
        )
        return
      }
      // 当指定了开始节点，且该节点存在，则直接以这个节点开始执行
      this.startNodes = [nodeConfig]
    }

    this.startNodes.forEach((startNode) => {
      this.scheduler.addAction({
        executionId,
        nodeId: startNode.id,
      })
    })
    // 所有的开始节点都执行
    this.scheduler.run({
      executionId,
    })
  }

  /**
   * 执行流程，每次执行都会生成一个唯一的 executionId，用于区分不同的执行。
   * 同一次执行，这次执行内部的节点执行顺序为并行。内部并行是为了避免异步节点阻塞其他节点的执行
   * 多次执行，多次执行之间为串行，这里选择串行的原因是避免多次执行之间的数据冲突。
   * 例如：
   * 一个流程存在两个开始节点，A 和 B，A 和 B 的下一个节点都是 C，C 的下两个节点是 D 和 E
   * 外部分别触发了 A 和 B 的执行，那么 A 和 B 的执行是串行（即 A 执行完再执行 B），但是 D 和 E 的执行是并行的。
   * 如果希望 A 和 B 的执行时并行的，就不能使用同一个流程模型执行，应该初始化两个。
   * 下面直接使用调度器的队列
   * @param params
   */
  public async execute(params: Partial<FlowModel.ExecParam>) {
    this.createExecution(params)
  }

  public async resume(params: Partial<FlowModel.ExecParam>) {
    this.createExecution(params)
  }

  /**
   * 创建节点实例，每个节点实例都会有一个唯一的 actionId
   * 通过 executionId, nodeId, actionId 可以唯一确定一个节点的某一次执行
   * @param nodeId
   * @returns 节点实例
   */
  // TODO: 确认下面这种场景，类型如何定义
  public createAction(nodeId: Engine.Key) {
    const nodeConfig = this.nodeConfigMap.get(nodeId)
    if (nodeConfig) {
      const NodeModel = this.nodeModelMap.get(nodeConfig.type)
      if (!NodeModel) {
        throw new Error('该 NodeModel 不存在，抛出异常')
      }
      return new NodeModel({
        nodeConfig,
        globalData: this.globalData,
        context: this.context,
      })
    }
  }

  public setStartNodeType(type: string) {
    this.startNodeType = type
  }

  public updateGlobalData(data: Record<string, unknown>) {
    // TODO: 数据的合并，是否考虑子项的合并（默认值的替换）
    this.globalData = {
      ...this.globalData,
      ...data,
    }
    return this.globalData
  }

  /**
   * 在执行完成后，通知外部此次之行完成
   * 如果还存在待执行的任务，那么继续执行
   * @param result
   * @private
   */
  private onExecuteFinished(result) {
    const index = this.executeList.findIndex(
      (i) => i.executionId === result.executionId,
    )
    if (index > -1) {
      const { callback } = this.executeList[index]
      this.executeList.splice(index, 1)
      callback?.(result)
    }
  }
}

export namespace FlowModel {
  export type FlowResult =
    | ({
        result?: Record<string, unknown>
      } & Engine.ActionParam)
    | Engine.NextActionParam

  export type ActionParam = Scheduler.ActionParam

  export type ExecParam = {
    callback?: (result: Engine.NextActionParam) => void
    onError?: (error: Error) => void
  } & ActionParam

  export interface IFlowModelProps {
    nodeModelMap: Map<string, BaseNode.NodeConstructor>
    recorder?: Recorder
    context?: Record<string, unknown>
    globalData?: Record<string, unknown>
    startNodeType?: string
  }
}

export default FlowModel
