import EventEmitter from './EventEmitter';
import {
  EVENT_INSTANCE_COMPLETE,
  EVENT_INSTANCE_INTERRUPTED,
  EVENT_INSTANCE_ERROR,
  FlowStatus,
} from './constant/constant';
import { createActionId } from './util/ID';
import type {
  ActionParam,
  NodeParam,
  ResumeParam,
  NextActionParam,
} from './types.d';
import type FlowModel from './FlowModel';
import type Recorder from './recorder';

type ActionParamMap = Map<string, ActionParam>;

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
    [key: string]: any;
  }) {
    const nodeQueue = this.nodeQueueMap.get(runParams.executionId);
    // 将同一个executionId当前待执行的节点一起执行
    // 避免出现某一个节点执行时间过长，导致其他节点等待时间过长。
    while (nodeQueue.length) {
      const currentNode = nodeQueue.pop();
      const actionId = createActionId();
      const actionParam = {
        ...currentNode,
        actionId,
      };
      this.pushActionToRunningMap(actionParam);
      this.exec(actionParam);
    }
    if (!this.hasRunningAction(runParams.executionId)) {
      // 当一个流程在nodeQueueMap和actionRunningMap中都不存在执行的节点时，说明这个流程已经执行完成。
      this.emit(EVENT_INSTANCE_COMPLETE, {
        ...runParams,
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
      this.interrupted(execResult);
      this.saveActionResult({
        executionId: actionParam.executionId,
        nodeId: actionParam.nodeId,
        actionId: actionParam.actionId,
        nodeType: execResult.nodeType,
        properties: execResult.properties,
        outgoing: execResult.outgoing,
        status: execResult.status,
        detail: execResult.detail,
      });
      this.removeActionFromRunningMap(actionParam);
    }
    if (execResult && execResult.status === FlowStatus.ERROR) {
      this.error(execResult);
      this.saveActionResult({
        executionId: actionParam.executionId,
        nodeId: actionParam.nodeId,
        actionId: actionParam.actionId,
        nodeType: execResult.nodeType,
        properties: execResult.properties,
        outgoing: execResult.outgoing,
        status: execResult.status,
        detail: execResult.detail,
      });
      this.removeActionFromRunningMap(actionParam);
    }
    // TODO: 考虑停下所有的任务
  }
  private interrupted(execResult: NextActionParam) {
    this.emit(EVENT_INSTANCE_INTERRUPTED, execResult);
  }
  private error(execResult : NextActionParam) {
    this.emit(EVENT_INSTANCE_ERROR, execResult);
  }
  private next(data: NextActionParam) {
    if (data.outgoing && data.outgoing.length > 0) {
      data.outgoing.forEach((item) => {
        if (item.result) {
          this.addAction({
            executionId: data.executionId,
            nodeId: item.target,
          });
        }
      });
    }
    this.saveActionResult(data);
    this.removeActionFromRunningMap(data);
    this.run(data);
  }
  private saveActionResult(data: NextActionParam) {
    this.recorder.addActionRecord({
      executionId: data.executionId,
      actionId: data.actionId,
      nodeId: data.nodeId,
      nodeType: data.nodeType,
      timestamp: Date.now(),
      properties: data.properties,
      outgoing: data.outgoing,
      detail: data.detail,
      status: data.status,
    });
  }
}
