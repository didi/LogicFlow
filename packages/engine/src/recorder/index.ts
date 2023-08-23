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
    const instances = storage.getItem(LOGICFLOW_ENGINE_INSTANCES) || [];
    if (instances.indexOf(instanceId) === -1) {
      instances.push(instanceId);
    }
    if (instances.length > MAX_INSTANCE) {
      const clearInstance = instances.shift();
      this.clearInstance(clearInstance);
    }
    storage.setItem(LOGICFLOW_ENGINE_INSTANCES, instances);
  }
  setMaxRecorderNumber(maxRecorder: number) {
    this.maxRecorder = maxRecorder;
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
    storage.setItem(actionId, action);
  }
  async getActionRecord(actionId: string): Promise<RecorderData> {
    return storage.getItem(actionId);
  }
  async getExecutionActions(executionId) {
    return storage.getItem(executionId);
  }
  async getExecutionList() {
    const instances = storage.getItem(this.instanceId) || [];
    return instances;
  }
  clear() {
    this.clearInstance(this.instanceId);
  }
  clearInstance(instanceId) {
    const instanceExecutions = storage.getItem(instanceId) || [];
    instanceExecutions.forEach((executionId) => {
      storage.removeItem(executionId);
      const instanceData = storage.getItem(executionId) || [];
      instanceData.forEach((actionId) => {
        storage.removeItem(actionId);
      });
    });
    storage.removeItem(instanceId);
  }
  private pushExecution(executionId) {
    const instanceExecutions = storage.getItem(this.instanceId) || [];
    if (instanceExecutions.length >= this.maxRecorder) {
      const removeItem = instanceExecutions.shift();
      this.popExecution(removeItem);
    }
    instanceExecutions.push(executionId);
    storage.setItem(this.instanceId, instanceExecutions);
  }
  private popExecution(executionId) {
    const instanceData = storage.getItem(executionId) || [];
    instanceData.forEach((actionId) => {
      storage.removeItem(actionId);
    });
    storage.removeItem(executionId);
  }
  private pushActionToExecution(executionId, actionId) {
    const actions = storage.getItem(executionId) || [];
    actions.push(actionId);
    storage.setItem(executionId, actions);
  }
}
