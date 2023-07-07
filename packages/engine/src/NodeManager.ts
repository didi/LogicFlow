import type { BaseNodeInterface } from './nodes/BaseNode';
import { BASE_START_NODE } from './constant/constant';

export default class NodeManager {
  taskMap: Map<string, BaseNodeInterface>;
  tasks: BaseNodeInterface[];
  startTasks: BaseNodeInterface[];
  constructor() {
    this.taskMap = new Map();
    this.tasks = [];
    this.startTasks = [];
  }
  addTask(task: BaseNodeInterface) {
    this.tasks.push(task);
    this.taskMap.set(task.nodeId, task);
    if (task.baseType === BASE_START_NODE) {
      this.startTasks.push(task);
    }
  }
  getTask(taskId: string) {
    return this.taskMap.get(taskId);
  }
  getStartTasks() {
    return this.startTasks;
  }
}
