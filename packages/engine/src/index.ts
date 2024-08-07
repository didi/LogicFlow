// import { LogicFlow } from '@logicflow/core';
import { BaseNode, StartNode, TaskNode } from './nodes'
import { FlowModel } from './FlowModel'
import { Recorder } from './recorder'
import { createEngineId } from './utils'

export class Engine {
  readonly instanceId: string
  graphData?: Engine.GraphConfigData

  flowModel?: FlowModel
  recorder?: Recorder
  context?: Record<string, unknown>
  nodeModelMap: Map<string, BaseNode.NodeConstructor>

  constructor(options?: Engine.Options) {
    this.nodeModelMap = new Map()
    this.instanceId = createEngineId()
    if (options?.debug) {
      this.recorder = new Recorder({
        instanceId: this.instanceId,
      })
    }
    // 默认注册节点 register default nodes
    this.register({
      type: StartNode.nodeTypeName,
      model: StartNode,
    })
    this.register({
      type: TaskNode.nodeTypeName,
      model: TaskNode,
    })
    this.context = options?.context || {}
  }

  /**
   * 注册节点
   * @param nodeConfig { type: 'custom-node', model: NodeClass }
   */
  register(nodeConfig: Engine.NodeConfig) {
    this.nodeModelMap.set(nodeConfig.type, nodeConfig.model)
  }

  /**
   * 自定义执行记录的存储，默认浏览器使用 sessionStorage, nodejs 使用内存存储
   * 注意：由于执行记录不全会主动删除，所以需要自行清理。
   * nodejs 环境建议自定义为持久化存储。
   * engine.setCustomRecorder({{
   *   async addActionRecord(task) {}
   *   async getTask(actionId) {}
   *   async getExecutionTasks(executionId) {}
   *   clear(instanceId) {}
   * }}
   * @param recorder
   */
  setCustomRecorder(recorder: Recorder) {
    this.recorder = recorder
  }

  /**
   * 加载流程图数据
   */
  load({
    graphData,
    startNodeType = 'StartNode',
    globalData = {},
  }: Engine.LoadGraphParam): FlowModel {
    this.graphData = graphData
    const flowModel = new FlowModel({
      nodeModelMap: this.nodeModelMap,
      recorder: this.recorder,
      context: this.context,
      globalData,
      startNodeType,
    })

    flowModel.load(graphData)
    this.flowModel = flowModel
    return flowModel
  }

  /**
   * 执行流程，允许多次调用
   */
  async execute(
    param?: Partial<Engine.ActionParam>,
  ): Promise<Engine.NextActionParam> {
    return new Promise((resolve, reject) => {
      let execParam = param
      if (!param) {
        execParam = {}
      }

      this.flowModel?.execute({
        ...execParam,
        callback: (result) => {
          resolve(result)
        },
        onError: (error) => {
          reject(error)
        },
      })
    })
  }

  /**
   * 中断流程恢复
   * @param resumeParam
   * @returns
   */
  async resume(
    resumeParam: Engine.ResumeParam,
  ): Promise<Engine.NextActionParam | undefined> {
    return new Promise((resolve, reject) => {
      this.flowModel?.resume({
        ...resumeParam,
        callback: (result) => {
          resolve(result)
        },
        onError: (error) => {
          reject(error)
        },
      })
    })
  }

  async getExecutionList() {
    return await this.recorder?.getExecutionList()
  }

  /**
   * 获取执行任务记录
   * @param executionId
   * @returns
   */
  async getExecutionRecord(
    executionId: Engine.Key,
  ): Promise<Recorder.Info[] | null> {
    const actions = await this.recorder?.getExecutionActions(executionId)

    if (!actions) {
      return null
    }

    // DONE: 确认 records 的类型
    const records: Promise<Recorder.Info>[] = []
    for (let i = 0; i < actions?.length; i++) {
      const action = actions[i]
      if (this.recorder) {
        records.push(this.recorder?.getActionRecord(action))
      }
    }

    return Promise.all(records)
  }

  destroy() {
    this.recorder?.clear()
  }

  getGlobalData() {
    return this.flowModel?.globalData
  }

  setGlobalData(data: Record<string, unknown>) {
    if (this.flowModel) {
      this.flowModel.globalData = data
    }
  }

  updateGlobalData(data: Record<string, unknown>) {
    if (this.flowModel) {
      Object.assign(this.flowModel.globalData, data)
    }
  }
}

export namespace Engine {
  export type Point = {
    id?: string
    x: number
    y: number
    [key: string]: unknown
  }

  export type TextConfig = {
    value: string
  } & Point

  export type NodeData = {
    id: string
    type: string
    x?: number
    y?: number
    text?: TextConfig | string
    zIndex?: number
    properties?: Record<string, unknown>
  }

  export type EdgeData = {
    id: string
    /**
     * 边的类型，不传默认为lf.setDefaultEdgeType(type)传入的类型。
     * LogicFlow内部默认为polyline
     */
    type?: string
    sourceNodeId: string
    sourceAnchorId?: string
    targetNodeId: string
    targetAnchorId?: string
    startPoint?: {
      x: number
      y: number
    }
    endPoint?: {
      x: number
      y: number
    }
    text?:
      | {
          x: number
          y: number
          value: string
        }
      | string
    pointsList?: Point[]
    zIndex?: number
    properties?: Record<string, unknown>
  }

  export type GraphConfigData = {
    nodes: NodeData[]
    edges: EdgeData[]
  }

  export type LoadGraphParam = {
    graphData: GraphConfigData
    startNodeType?: string
    globalData?: Record<string, unknown>
  }

  export type Options = {
    context?: Record<string, unknown>
    debug?: boolean
  }
  export type Key = string | number
  export type NodeConfig = {
    type: string
    model: any // TODO: NodeModel 可能有多个，类型该如何定义呢？？？
  }

  export type NodeParam = {
    executionId: Key
    nodeId: Key
  }

  export type CommonActionInfo = {
    actionId: Key
  } & NodeParam

  export type ActionParam = CommonActionInfo

  export type ResumeParam = {
    data?: Record<string, unknown>
  } & CommonActionInfo

  export type ExecParam = {
    next: (data: NextActionParam) => void
  } & ActionParam

  export type ExecResumeParam = {
    next: (data: NextActionParam) => void
  } & ResumeParam

  export type ActionStatus = 'success' | 'error' | 'interrupted' | '' // ??? Question: '' 状态是什么状态

  export type NextActionParam = {
    executionId: Key
    nodeId: Key
    actionId: Key
    nodeType: string
    outgoing: BaseNode.OutgoingConfig[]
    properties?: Record<string, unknown>
    detail?: Record<string, unknown>
    status?: ActionStatus
  }

  export type ActionResult = NextActionParam

  export type NodeExecResult = {
    nodeType: string
    properties?: Record<string, unknown>
  } & CommonActionInfo &
    ActionResult
}

export * from './constant'
export { BaseNode, StartNode, TaskNode, Recorder }

export default Engine
