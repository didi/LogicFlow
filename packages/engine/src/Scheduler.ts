import EventEmitter from './EventEmitter';
import { TaskUnit } from './FlowModel';
import NodeManager from './NodeManager';

/**
 * 调度器
 * 通过一个队列维护需要执行的节点，一个集合维护正在执行的节点
 * 当一个executionId对于的
 */
export default class Scheduler extends EventEmitter {
  taskQueueMap: Map<string, TaskUnit[]>;
  taskRunningMap: Map<string, TaskUnit[]>;
  NodeManager: NodeManager;
  currentTask: TaskUnit | null;
  constructor(config) {
    super();
    this.taskQueueMap = new Map();
    this.taskRunningMap = new Map();
    this.NodeManager = config.NodeManager;
    this.currentTask = null;
  }
  run(data) {
    const { executionId } = data;
    let currentTaskQueue = this.taskQueueMap.get(executionId);
    if (!currentTaskQueue) {
      currentTaskQueue = [];
      this.taskQueueMap.set(executionId, currentTaskQueue);
    }
    const currentTask = currentTaskQueue.shift();
    if (currentTask) {
      this.addRunningTask(currentTask);
    }
  }
  addRunningTask(taskUnit: TaskUnit) {
    const { executionId } = taskUnit;
    if (!this.taskRunningMap.has(executionId)) {
      this.taskRunningMap.set(executionId, []);
    }
    this.taskRunningMap.get(executionId).push(taskUnit);
    this.exec(taskUnit);
  }
  async exec(taskUnit: TaskUnit) {
    const task = this.NodeManager.getTask(taskUnit.nodeId);
    if (!task) {
      throw new Error(`task ${taskUnit.nodeId} not found`);
    }
    const result = await task.execute({
      ...taskUnit,
      next: this.next.bind(this),
      stop: this.stop.bind(this),
    });
    return result;
  }

  async next(data) {
    console.log('next', data);
    if (data.outgoing) {
      data.outgoing.forEach((item) => {
        this.run({
          executionId: data.executionId,
          nodeId: item.target,
        });
      });
    } else {
      // this.emit('taskFinished')
    }
  }

  // 流程执行过程中出错，停止执行
  async stop(data) {
    console.log('stop', data);
  }
  addTask(taskUnit: TaskUnit) {
    console.log('addTask', taskUnit);
    const { executionId } = taskUnit;
    if (!this.taskQueueMap.has(executionId)) {
      this.taskQueueMap.set(executionId, []);
    }
    const currentTaskQueue = this.taskQueueMap.get(executionId);
    currentTaskQueue.push(taskUnit);
  }
}
