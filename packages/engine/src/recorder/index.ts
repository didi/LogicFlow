import type {
  RecorderData,
  RecorderInterface,
} from '../types.d';
import storage from '../util/storage';

const LOGICFLOW_ENGINE_INSTANCES = 'LOGICFLOW_ENGINE_INSTANCES';
const MAX_RECORDER = 100;
const MAX_INSTANCE = 100;
export default class Recorder implements RecorderInterface {
  maxRecorder: number;
  instanceId: number;
  constructor({ instanceId }) {
    this.maxRecorder = MAX_RECORDER;
    this.instanceId = instanceId;
    const instances = this.getItem(LOGICFLOW_ENGINE_INSTANCES) || [];
    if (instances.indexOf(instanceId) === -1) {
      instances.push(instanceId);
    }
    if (instances.length > MAX_INSTANCE) {
      const clearInstance = instances.shift();
      this.clearInstance(clearInstance);
    }
    this.setItem(LOGICFLOW_ENGINE_INSTANCES, instances);
  }
  setMaxRecorderNumber(maxRecorder: number) {
    this.maxRecorder = maxRecorder;
  }

  // 将存储 storage 的方法收敛到此处，并在此处做异常处理 - setItem
  setItem(key: string | number, value: unknown) {
    try {
      storage.setItem(key, value);
    } catch (error) {
      console.log('Ops, something wrong with storage.setItem');
      storage.clear();
      storage.setItem(key, value);
    }
  }
  // getItem 方法
  getItem(key: string | number) {
    return storage.getItem(key);
  }
  /*
  * @param {Object} action
  * {
  *   actionId: '',
  *   nodeId: '',
  *   executionId: '',
  *   nodeType: '',
  *   timestamp: '',
  *   properties: {},
  * }
  */
  async addActionRecord(action: RecorderData) {
    const { executionId, actionId } = action;
    const instanceData = await this.getExecutionActions(executionId);
    if (!instanceData) {
      this.pushExecution(executionId);
    }
    this.pushActionToExecution(executionId, actionId);
    this.setItem(actionId, action);
  }
  async getActionRecord(actionId: string): Promise<RecorderData> {
    return this.getItem(actionId);
  }
  async getExecutionActions(executionId) {
    return this.getItem(executionId);
  }
  async getExecutionList() {
    const instances = this.getItem(this.instanceId) || [];
    return instances;
  }
  clear() {
    this.clearInstance(this.instanceId);
  }
  clearInstance(instanceId) {
    const instanceExecutions = this.getItem(instanceId) || [];
    instanceExecutions.forEach((executionId) => {
      storage.removeItem(executionId);
      const instanceData = this.getItem(executionId) || [];
      instanceData.forEach((actionId) => {
        storage.removeItem(actionId);
      });
    });
    storage.removeItem(instanceId);
  }
  private pushExecution(executionId) {
    const instanceExecutions = this.getItem(this.instanceId) || [];
    if (instanceExecutions.length >= this.maxRecorder) {
      const removeItem = instanceExecutions.shift();
      this.popExecution(removeItem);
    }
    instanceExecutions.push(executionId);
    this.setItem(this.instanceId, instanceExecutions);
  }
  private popExecution(executionId) {
    const instanceData = this.getItem(executionId) || [];
    instanceData.forEach((actionId) => {
      storage.removeItem(actionId);
    });
    storage.removeItem(executionId);
  }
  private pushActionToExecution(executionId, actionId) {
    const actions = this.getItem(executionId) || [];
    actions.push(actionId);
    this.setItem(executionId, actions);
  }
}
