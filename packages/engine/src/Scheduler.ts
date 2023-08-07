import EventEmitter from './EventEmitter';
import {
  EVENT_INSTANCE_COMPLETE,
  EVENT_INSTANCE_INTERRUPTED,
  FlowStatus,
} from './constant/constant';
import { createActionId } from './util/ID';
import type {
  ActionParam,
  NodeParam,
  ResumeParam,
  NodeExecResult,
} from './types.d';
import type FlowModel from './FlowModel';
import type { NextActionParam } from './nodes/BaseNode';
import type Recorder from './recorder';

type ActionParamMap = Map<string, ActionParam>;

type ActionResult = {
  extraInfo?: Record<string, any>;
} & NextActionParam;

type ExecutionId = string;

/**
 * 调度器
 * 通过一个队列维护需要执行的节点，一个集合维护正在执行的节点
 */
export default class Scheduler extends EventEmitter {
  /**
   * 当前需要执行的节点队列
   */
  nodeQueueMap: Map<ExecutionId, NodeParam[]>;
  /**
   * 当前正在执行的节点集合
   * 在每个节点执行完成后，会从集合中删除。
   * 同时会判断此集合中是否还存在和此节点相同的executionId，如果不存在，说明此流程已经执行完成。
   */
  actionRunningMap: Map<ExecutionId, ActionParamMap>;
  /**
   * 流程模型，用于创建节点模型。
   */
  flowModel: FlowModel;
  /**
   * 执行记录存储器
   * 用于存储节点执行的结果。
   */
  recorder: Recorder;
  constructor(config) {
    super();
    this.nodeQueueMap = new Map();
    this.actionRunningMap = new Map();
    this.flowModel = config.flowModel;
    this.recorder = config.recorder;
  }
  /**
   * 添加一个任务到队列中。
   * 1. 由流程模型将所有的开始节点添加到队列中。
   * 2. 当一个节点执行完成后，将后续的节点添加到队列中。
   */
  public addAction(nodeParam: NodeParam) {
    const { executionId } = nodeParam;
    if (!this.nodeQueueMap.has(executionId)) {
      this.nodeQueueMap.set(executionId, []);
    }
    const currentActionQueue = this.nodeQueueMap.get(executionId);
    currentActionQueue.push(nodeParam);
  }
  /**
   * 调度器执行下一个任务
   * 1. 提供给流程模型，用户开始执行第一个任务。
   * 2. 内部任务执行完成后，调用此方法继续执行下一个任务。
   * 3. 当判断没有可以继续执行的任务后，触发流程结束事件。
   */
  public run(runParams: {
    executionId: string;
    nodeId?: string;
    actionId?: string;
  }) {
    const nodeQueue = this.nodeQueueMap.get(runParams.executionId);
    if (nodeQueue.length > 0) {
      this.nodeQueueMap.set(runParams.executionId, []);
      // TODO: 并发执行，考虑用对列来实现一样的效果，可能会更好理解。
      for (let i = 0; i < nodeQueue.length; i++) {
        const currentNode = nodeQueue[i];
        const actionId = createActionId();
        const actionParam = {
          ...currentNode,
          actionId,
        };
        this.pushActionToRunningMap(actionParam);
        this.exec(actionParam);
      }
    } else if (!this.hasRunningAction(runParams.executionId)) {
      // 当一个流程在nodeQueueMap和actionRunningMap中都不存在执行的节点时，说明这个流程已经执行完成。
      this.emit(EVENT_INSTANCE_COMPLETE, {
        executionId: runParams.executionId,
        nodeId: runParams.nodeId,
        actionId: runParams.actionId,
        status: FlowStatus.COMPLETED,
      });
    }
  }
  /**
   * 恢复某个任务的执行。
   * 可以自定义节点手动实现流程中断，然后通过此方法恢复流程的执行。
   */
  public async resume(resumeParam: ResumeParam) {
    this.pushActionToRunningMap({
      executionId: resumeParam.executionId,
      nodeId: resumeParam.nodeId,
      actionId: resumeParam.actionId,
    });
    const model = this.flowModel.createAction(resumeParam.nodeId);
    await model.resume({
      ...resumeParam,
      next: this.next.bind(this),
    });
  }
  private pushActionToRunningMap(actionParam) {
    const { executionId, actionId } = actionParam;
    if (!this.actionRunningMap.has(executionId)) {
      const runningMap = new Map<string, ActionParam>();
      this.actionRunningMap.set(executionId, runningMap);
    }
    this.actionRunningMap.get(executionId).set(actionId, actionParam);
  }
  private removeActionFromRunningMap(actionParam: ActionParam) {
    const { executionId, actionId } = actionParam;
    if (!actionId) return;
    const runningMap = this.actionRunningMap.get(executionId);
    if (!runningMap) return;
    runningMap.delete(actionId);
  }
  private hasRunningAction(executionId) {
    const runningMap = this.actionRunningMap.get(executionId);
    if (!runningMap) return false;
    if (runningMap.size === 0) {
      this.actionRunningMap.delete(executionId);
      return false;
    }
    return true;
  }
  private async exec(actionParam: ActionParam) {
    const model = this.flowModel.createAction(actionParam.nodeId);
    const execResult = await model.execute({
      executionId: actionParam.executionId,
      actionId: actionParam.actionId,
      nodeId: actionParam.nodeId,
      next: this.next.bind(this),
    });
    if (execResult && execResult.status === FlowStatus.INTERRUPTED) {
      this.interrupted({
        execResult,
        actionParam,
      });
      this.saveActionResult({
        executionId: actionParam.executionId,
        nodeId: actionParam.nodeId,
        actionId: actionParam.actionId,
        nodeType: execResult.nodeType,
        properties: execResult.properties,
        outgoing: [],
        extraInfo: {
          status: execResult.status,
          detail: execResult.detail,
        },
      });
      this.removeActionFromRunningMap(actionParam);
    }
    // TODO: 考虑停下所有的任务
  }
  private interrupted({
    execResult,
    actionParam,
  } : { execResult: NodeExecResult, actionParam: ActionParam}) {
    this.emit(EVENT_INSTANCE_INTERRUPTED, {
      executionId: actionParam.executionId,
      status: FlowStatus.INTERRUPTED,
      nodeId: actionParam.nodeId,
      actionId: actionParam.actionId,
      detail: execResult.detail,
    });
  }
  private next(data: NextActionParam) {
    if (data.outgoing && data.outgoing.length > 0) {
      data.outgoing.forEach((item) => {
        this.addAction({
          executionId: data.executionId,
          nodeId: item.target,
        });
      });
    }
    this.saveActionResult(data);
    this.removeActionFromRunningMap(data);
    this.run({
      executionId: data.executionId,
      nodeId: data.nodeId,
      actionId: data.actionId,
    });
  }
  private saveActionResult(data: ActionResult) {
    this.recorder.addActionRecord({
      executionId: data.executionId,
      actionId: data.actionId,
      nodeId: data.nodeId,
      nodeType: data.nodeType,
      timestamp: Date.now(),
      properties: data.properties,
    });
  }
}
