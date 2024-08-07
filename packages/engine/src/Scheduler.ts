import { Engine } from '.'
import Recorder from './recorder'
import FlowModel from './FlowModel'
import EventEmitter from './EventEmitter'
import { createActionId } from './utils'
import {
  EVENT_INSTANCE_ERROR,
  EVENT_INSTANCE_COMPLETE,
  EVENT_INSTANCE_INTERRUPTED,
  FlowStatus,
} from './constant'

/**
 * 调度器
 * 通过一个队列维护需要执行的节点，一个集合维护正在执行的节点
 */
export class Scheduler extends EventEmitter {
  /**
   * 当前需要执行的节点队列
   */
  nodeQueueMap: Map<Engine.Key, Engine.NodeParam[]>
  /**
   * 当前正在执行的节点集合
   * 在每个节点执行完成后，会从集合中删除
   * 同时会判断次集合中是否还存在和此节点相同的 executionId，如果不存在，说明该流程已经执行完成
   */
  actionRunningMap: Map<Engine.Key, Scheduler.ActionParamMap>
  /**
   * 流程模型，用于创建节点模型
   */
  flowModel: FlowModel
  /**
   * 执行记录存储器
   * 用于存储节点执行的结果
   */
  recorder?: Recorder

  constructor(config: Scheduler.ISchedulerProps) {
    super()
    this.nodeQueueMap = new Map()
    this.actionRunningMap = new Map()
    this.flowModel = config.flowModel
    this.recorder = config.recorder
  }

  /**
   * 添加一个任务到队列中。
   * 1. 由流程模型将所有的开始及诶带你添加到队列中
   * 2. 当一个节点执行完成后，将后续的节点添加到队列中
   * @param nodeParam
   */
  public addAction(nodeParam: Engine.NodeParam) {
    const { executionId } = nodeParam
    if (!this.nodeQueueMap.has(executionId)) {
      this.nodeQueueMap.set(executionId, [])
    }

    const currentActionQueue: Engine.NodeParam[] | undefined =
      this.nodeQueueMap.get(executionId)
    if (currentActionQueue) {
      currentActionQueue.push(nodeParam)
    }
    console.log('this.nodeQueueMap--->>>', this.nodeQueueMap)
  }

  private pushActionToRunningMap(actionParam: Scheduler.ActionParam) {
    const { executionId, actionId } = actionParam
    if (!this.actionRunningMap.has(executionId)) {
      const runningMap: Scheduler.ActionParamMap = new Map()
      this.actionRunningMap.set(executionId, runningMap)
    }
    if (actionId) {
      this.actionRunningMap.get(executionId)?.set(actionId, actionParam)
    }
  }

  private removeActionFromRunningMap(actionParam: Engine.ActionParam) {
    const { executionId, actionId } = actionParam
    if (!actionId) return

    const runningMap = this.actionRunningMap.get(executionId)
    if (!runningMap) return

    runningMap.delete(actionId)
  }

  /**
   * 为了防止多次添加导致
   * @param actionParam
   */
  private saveActionResult(actionParam: Engine.NextActionParam) {
    this.recorder?.addActionRecord({
      timestamp: Date.now(),
      ...actionParam,
    })
  }

  private hasRunningAction(executionId: Engine.Key): boolean {
    const runningMap = this.actionRunningMap.get(executionId)
    if (!runningMap) return false
    if (runningMap.size === 0) {
      this.actionRunningMap.delete(executionId)
      return false
    }
    return true
  }

  /**
   * 调度器执行下一个任务
   * 1. 提供给流程模型，用户开始执行第一个任务
   * 2. 内部任务执行完成后，调用此方法继续执行下一个任务
   * 3. 当判断没有可以继续执行的任务后，触发流程结束事件
   * @param runParam
   */
  public run(runParam: Scheduler.ActionParam) {
    const nodeQueue: Engine.NodeParam[] | undefined = this.nodeQueueMap.get(
      runParam.executionId,
    )

    // 将同一个 executionId 当前待执行的节点一起执行
    // 避免出现某一个节点执行时间过长，导致其他节点等待时间过长
    while (nodeQueue?.length) {
      const currentNode = nodeQueue.pop()
      const actionId = createActionId()
      const actionParam: Engine.ActionParam = {
        ...(currentNode as Engine.NodeParam),
        actionId,
      }
      this.pushActionToRunningMap(actionParam)
      this.exec(actionParam)
    }

    if (!this.hasRunningAction(runParam.executionId)) {
      // 当一个流程在 nodeQueueMap 和 actionRunningMap 中都不存在执行的节点时，说明这个流程已经执行完成。
      this.emit(EVENT_INSTANCE_COMPLETE, {
        ...runParam,
        status: FlowStatus.COMPLETED,
      })
    }
  }

  private next(data: Engine.NextActionParam) {
    if (data.outgoing && data.outgoing.length > 0) {
      data.outgoing.forEach((item) => {
        if (item.result) {
          this.addAction({
            executionId: data.executionId,
            nodeId: item.target,
          })
        }
      })
    }

    this.saveActionResult(data)
    this.removeActionFromRunningMap(data)
    this.run(data)
  }

  /**
   * 恢复某个任务的执行
   * 可以自定义节点手动实现流程中断，然后通过此方法恢复流程的执行
   * @param resumeParam
   */
  public async resume(resumeParam: Engine.ResumeParam) {
    const { executionId, actionId, nodeId } = resumeParam
    this.pushActionToRunningMap({
      executionId,
      actionId,
      nodeId,
    })

    const model = this.flowModel.createAction(nodeId)
    await model?.resume({
      ...resumeParam,
      next: this.next.bind(this),
    })
  }

  // 中断时，触发事件
  private interrupted(execResult: Engine.NextActionParam) {
    this.emit(EVENT_INSTANCE_INTERRUPTED, execResult)
  }
  // 报错时，触发事件
  private error(execResult: Engine.NextActionParam) {
    this.emit(EVENT_INSTANCE_ERROR, execResult)
  }

  private async exec(actionParam: Engine.ActionParam) {
    const { executionId, actionId, nodeId } = actionParam
    const model = this.flowModel.createAction(nodeId)
    const execResult = await model?.execute({
      executionId,
      actionId,
      nodeId,
      next: this.next.bind(this),
    })

    if (execResult) {
      const { nodeType, properties, outgoing, status, detail } = execResult
      const actionResult: Engine.NextActionParam = {
        // actionParam
        executionId,
        actionId,
        nodeId,
        // execResult
        nodeType,
        properties,
        outgoing,
        status,
        detail,
      }
      if (execResult?.status === FlowStatus.INTERRUPTED) {
        this.interrupted(execResult)
        this.saveActionResult(actionResult)
        this.removeActionFromRunningMap(actionParam)
      }

      if (execResult?.status === FlowStatus.ERROR) {
        this.error(execResult)
        this.saveActionResult(actionResult)
        this.removeActionFromRunningMap(actionParam)
      }
    }
    // TODO: 考虑停下所有的任务
  }
}

export namespace Scheduler {
  export type ActionParam = {
    executionId: Engine.Key
    actionId?: Engine.Key
    nodeId?: Engine.Key
    data?: Record<string, unknown>
    [key: string]: unknown
  }
  export type ActionParamMap = Map<Engine.Key, ActionParam>

  export interface ISchedulerProps {
    flowModel: FlowModel
    recorder?: Recorder
  }
}

export default Scheduler
