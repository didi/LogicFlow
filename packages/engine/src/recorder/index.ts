import type {
  RecorderData,
  RecorderInterface,
} from '../types.d';
import storage from '../util/storage';

const LOGICFLOW_ENGINE_INSTANCES = 'LOGICFLOW_ENGINE_INSTANCES';

export default class Recorder implements RecorderInterface {
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
    const instanceData = this.getExecutionActions(executionId);
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
  clear() {
    const instance = storage.getItem(LOGICFLOW_ENGINE_INSTANCES) || [];
    instance.forEach((executionId) => {
      storage.removeItem(executionId);
      const instanceData = storage.getItem(executionId) || [];
      instanceData.forEach((actionId) => {
        storage.removeItem(actionId);
      });
    });
    storage.removeItem(LOGICFLOW_ENGINE_INSTANCES);
  }
  private pushExecution(executionId) {
    const instance = storage.getItem(LOGICFLOW_ENGINE_INSTANCES) || [];
    instance.push(executionId);
    storage.setItem(LOGICFLOW_ENGINE_INSTANCES, instance);
  }
  private pushActionToExecution(executionId, actionId) {
    const actions = storage.getItem(executionId) || [];
    actions.push(actionId);
    storage.setItem(executionId, actions);
  }
}
