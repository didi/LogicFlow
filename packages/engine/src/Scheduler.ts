import EventEmitter from './EventEmitter';
import {
  EVENT_INSTANCE_COMPLETE,
  EVENT_INSTANCE_INTERRUPTED,
  FlowStatus,
} from './constant/constant';
import { createTaskId } from './util/ID';
import type {
  ActionResult,
  TaskParam,
  NodeParam,
  ResumeParam,
  NodeExecResult,
} from './types.d';
import type FlowModel from './FlowModel';
import type { NextTaskParam } from './nodes/BaseNode';
import type Recorder from './recorder';

type TaskParamMap = Map<string, TaskParam>;

type TaskResult = {
  extraInfo?: Record<string, any>;
} & NextTaskParam;

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
  taskRunningMap: Map<ExecutionId, TaskParamMap>;
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
    this.taskRunningMap = new Map();
    this.flowModel = config.flowModel;
    this.recorder = config.recorder;
  }
  /**
   * 添加一个任务到队列中。
   * 1. 由流程模型将所有的开始节点添加到队列中。
   * 2. 当一个节点执行完成后，将后续的节点添加到队列中。
   */
  public addTask(nodeParam: NodeParam) {
    const { executionId } = nodeParam;
    if (!this.nodeQueueMap.has(executionId)) {
      this.nodeQueueMap.set(executionId, []);
    }
    const currentTaskQueue = this.nodeQueueMap.get(executionId);
    currentTaskQueue.push(nodeParam);
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
    taskId?: string;
  }) {
    const nodeQueue = this.nodeQueueMap.get(runParams.executionId);
    if (nodeQueue.length > 0) {
      this.nodeQueueMap.set(runParams.executionId, []);
      for (let i = 0; i < nodeQueue.length; i++) {
        const currentNode = nodeQueue[i];
        const taskId = createTaskId();
        const taskParam = {
          ...currentNode,
          taskId,
        };
        this.pushTaskToRunningMap(taskParam);
        this.exec(taskParam);
      }
    } else if (!this.hasRunningTask(runParams.executionId)) {
      // 当一个流程在nodeQueueMap和taskRunningMap中都不存在执行的节点时，说明这个流程已经执行完成。
      this.emit(EVENT_INSTANCE_COMPLETE, {
        executionId: runParams.executionId,
        nodeId: runParams.nodeId,
        taskId: runParams.taskId,
        status: FlowStatus.COMPLETED,
      });
    }
  }
  /**
   * 恢复某个任务的执行。
   * 可以自定义节点手动实现流程中断，然后通过此方法恢复流程的执行。
   */
  public async resume(resumeParam: ResumeParam) {
    this.pushTaskToRunningMap({
      executionId: resumeParam.executionId,
      nodeId: resumeParam.nodeId,
      taskId: resumeParam.taskId,
    });
    const model = this.flowModel.createTask(resumeParam.nodeId);
    await model.resume({
      ...resumeParam,
      next: this.next.bind(this),
    });
  }
  private pushTaskToRunningMap(taskParam) {
    const { executionId, taskId } = taskParam;
    if (!this.taskRunningMap.has(executionId)) {
      const runningMap = new Map<string, TaskParam>();
      this.taskRunningMap.set(executionId, runningMap);
    }
    this.taskRunningMap.get(executionId).set(taskId, taskParam);
  }
  private removeTaskFromRunningMap(taskParam: TaskParam) {
    const { executionId, taskId } = taskParam;
    if (!taskId) return;
    const runningMap = this.taskRunningMap.get(executionId);
    if (!runningMap) return;
    runningMap.delete(taskId);
  }
  private hasRunningTask(executionId) {
    const runningMap = this.taskRunningMap.get(executionId);
    if (!runningMap) return false;
    if (runningMap.size === 0) {
      this.taskRunningMap.delete(executionId);
      return false;
    }
    return true;
  }
  private async exec(taskParam: TaskParam) {
    const model = this.flowModel.createTask(taskParam.nodeId);
    const execResult = await model.execute({
      executionId: taskParam.executionId,
      taskId: taskParam.taskId,
      nodeId: taskParam.nodeId,
      next: this.next.bind(this),
    });
    if (execResult && execResult.status === FlowStatus.INTERRUPTED) {
      this.interrupted({
        execResult,
        taskParam,
      });
      this.saveTaskResult({
        executionId: taskParam.executionId,
        nodeId: taskParam.nodeId,
        taskId: taskParam.taskId,
        nodeType: execResult.nodeType,
        properties: execResult.properties,
        outgoing: [],
        extraInfo: {
          status: execResult.status,
          detail: execResult.detail,
        },
      });
      this.removeTaskFromRunningMap(taskParam);
    }
  }
  private interrupted({
    execResult,
    taskParam,
  } : { execResult: NodeExecResult, taskParam: TaskParam}) {
    this.emit(EVENT_INSTANCE_INTERRUPTED, {
      executionId: taskParam.executionId,
      status: FlowStatus.INTERRUPTED,
      nodeId: taskParam.nodeId,
      taskId: taskParam.taskId,
      detail: execResult.detail,
    });
  }
  private next(data: NextTaskParam) {
    if (data.outgoing && data.outgoing.length > 0) {
      data.outgoing.forEach((item) => {
        this.addTask({
          executionId: data.executionId,
          nodeId: item.target,
        });
      });
    }
    this.saveTaskResult(data);
    this.removeTaskFromRunningMap(data);
    this.run({
      executionId: data.executionId,
      nodeId: data.nodeId,
      taskId: data.taskId,
    });
  }
  private saveTaskResult(data: TaskResult) {
    this.recorder.addTask({
      executionId: data.executionId,
      taskId: data.taskId,
      nodeId: data.nodeId,
      nodeType: data.nodeType,
      timestamp: Date.now(),
      properties: data.properties,
    });
  }
}
