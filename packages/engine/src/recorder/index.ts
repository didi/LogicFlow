import storage from '../util/storage';

const LOGICFLOW_ENGINE_INSTANCES = 'LOGICFLOW_ENGINE_INSTANCES';

export type RecorderData = {
  taskId: string;
  nodeId: string;
  executionId: string;
  nodeType: string;
  timestamp: number;
  properties?: Record<string, any>;
};

export default class Recorder {
  /*
  * @param {Object} task
  * {
  *   taskId: '',
  *   nodeId: '',
  *   executionId: '',
  *   nodeType: '',
  *   timestamp: '',
  *   properties: {},
  * }
  */
  async addTask(task: RecorderData) {
    const { executionId, taskId } = task;
    let instanceData = await this.getExecutionTasks(executionId);
    if (!instanceData) {
      instanceData = [];
      const instance = storage.getItem(LOGICFLOW_ENGINE_INSTANCES) || [];
      instance.push(executionId);
      storage.setItem(LOGICFLOW_ENGINE_INSTANCES, instance);
    }
    instanceData.push(taskId);
    storage.setItem(executionId, instanceData);
    storage.setItem(taskId, task);
  }
  async getTask(taskId) {
    return storage.getItem(taskId);
  }
  async getExecutionTasks(executionId) {
    return storage.getItem(executionId);
  }
  clear() {
    const instance = storage.getItem(LOGICFLOW_ENGINE_INSTANCES) || [];
    instance.forEach((executionId) => {
      storage.removeItem(executionId);
      const instanceData = storage.getItem(executionId) || [];
      instanceData.forEach((taskId) => {
        storage.removeItem(taskId);
      });
    });
    storage.removeItem(LOGICFLOW_ENGINE_INSTANCES);
  }
}
