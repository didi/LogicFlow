import EventEmitter from './EventEmitter';
import { TaskUnit } from './FlowModel';
import type FlowModel from './FlowModel';
import { EVENT_INSTANCE_COMPLETE, FlowStatus } from './constant/constant';
import type { NextTaskUnit } from './nodes/BaseNode';
import { createTaskId } from './util/ID';
import type Recorder from './recorder';

type TaskUnitMap = Map<string, TaskUnit>;

/**
 * 调度器
 * 通过一个队列维护需要执行的节点，一个集合维护正在执行的节点
 */
export default class Scheduler extends EventEmitter {
  taskQueueMap: Map<string, TaskUnit[]>;
  taskRunningMap: Map<string, TaskUnitMap>;
  flowModel: FlowModel;
  recorder: Recorder;
  currentTask: TaskUnit | null;
  constructor(config) {
    super();
    this.taskQueueMap = new Map();
    this.taskRunningMap = new Map();
    this.flowModel = config.flowModel;
    this.recorder = config.recorder;
    this.currentTask = null;
  }
  run(executionId) {
    const currentTask = this.getNextTask(executionId);
    if (currentTask) {
      const task = this.addRunningTask(currentTask);
      this.exec(task);
    } else if (!this.hasRunningTask(executionId)) {
      // 当一个流程在taskQueueMap和taskRunningMap中都不存在执行的节点时，说明这个流程已经执行完成。
      this.emit(EVENT_INSTANCE_COMPLETE, {
        executionId,
        status: FlowStatus.COMPLETED,
      });
    }
  }
  addRunningTask(taskUnit: TaskUnit) {
    const { executionId } = taskUnit;
    const taskId = createTaskId();
    taskUnit.taskId = taskId;
    if (!this.taskRunningMap.has(executionId)) {
      const runningMap = new Map<string, TaskUnit>();
      this.taskRunningMap.set(executionId, runningMap);
    }
    this.taskRunningMap.get(executionId).set(taskId, taskUnit);
    return taskUnit;
  }
  removeRunningTask(taskUnit: TaskUnit) {
    const { executionId, taskId } = taskUnit;
    if (!taskId) return;
    const runningMap = this.taskRunningMap.get(executionId);
    if (!runningMap) return;
    runningMap.delete(taskId);
  }
  hasRunningTask(executionId) {
    const runningMap = this.taskRunningMap.get(executionId);
    if (!runningMap) return false;
    if (runningMap.size === 0) {
      this.taskRunningMap.delete(executionId);
      return false;
    }
    return true;
  }
  async exec(taskUnit: TaskUnit) {
    const model = this.flowModel.createTask(taskUnit.nodeId);
    const r = await model.execute({
      executionId: taskUnit.executionId,
      taskId: taskUnit.taskId,
      nodeId: taskUnit.nodeId,
      next: this.next.bind(this),
    });
    if (!r) this.cancel(taskUnit);
  }
  cancel(taskUnit: TaskUnit) {
    // TODO: 流程执行异常中断
  }
  async next(data: NextTaskUnit) {
    if (data.outgoing && data.outgoing.length > 0) {
      data.outgoing.forEach((item) => {
        this.addTask({
          executionId: data.executionId,
          nodeId: item.target,
        });
      });
    }
    this.saveTaskResult(data);
    this.removeRunningTask(data);
    this.run(data.executionId);
  }
  saveTaskResult(data: NextTaskUnit) {
    this.recorder.addTask({
      executionId: data.executionId,
      taskId: data.taskId,
      nodeId: data.nodeId,
      nodeType: data.nodeType,
      timestamp: Date.now(),
      properties: data.properties,
    });
  }
  getNextTask(executionId) {
    const currentTaskQueue = this.taskQueueMap.get(executionId);
    if (!currentTaskQueue || currentTaskQueue.length === 0) {
      return null;
    }
    const currentTask = currentTaskQueue.shift();
    return currentTask;
  }
  // 流程执行过程中出错，停止执行
  async stop(data) {
    console.log('stop', data);
  }
  addTask(taskUnit: TaskUnit) {
    const { executionId } = taskUnit;
    if (!this.taskQueueMap.has(executionId)) {
      this.taskQueueMap.set(executionId, []);
    }
    const currentTaskQueue = this.taskQueueMap.get(executionId);
    currentTaskQueue.push(taskUnit);
  }
}
