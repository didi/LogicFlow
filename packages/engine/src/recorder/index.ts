import { Engine } from '..'
import { storage } from '../utils'

export const MAX_RECORDER = 100
export const MAX_INSTANCE = 100
export const LOGICFLOW_ENGINE_INSTANCES = 'LOGICFLOW_ENGINE_INSTANCES'

export class Recorder implements Recorder.Base {
  instanceId: Engine.Key
  maxRecorder: number

  constructor({ instanceId }) {
    this.instanceId = instanceId
    this.maxRecorder = MAX_RECORDER

    const instances = this.getItem(LOGICFLOW_ENGINE_INSTANCES) || []
    if (instances.indexOf(instanceId) === -1) {
      instances.push(instanceId)
    }
    if (instances.length > MAX_INSTANCE) {
      const clearInstance = instances.shift()
      this.clearInstance(clearInstance)
    }
    this.setItem(LOGICFLOW_ENGINE_INSTANCES, instances)
  }

  setMaxRecorderNumber(max: number) {
    this.maxRecorder = max
  }

  // 将存储 storage 的方法收敛到此处，并在此处做异常处理 - setItem
  setItem(key: string | number, value: unknown) {
    try {
      storage.setItem(key, value)
    } catch (error) {
      console.error('Ops, something wrong with storage.setItem !!!')
      storage.clear()
      storage.setItem(key, value)
    }
  }

  // getItem 方法
  getItem(key: string | number) {
    return storage.getItem(key)
  }

  async getExecutionActions(executionId: Engine.Key) {
    return this.getItem(executionId)
  }

  async getExecutionList() {
    return this.getItem(this.instanceId) || []
  }

  private addExecution(executionId: Engine.Key) {
    const instanceExecutions = this.getItem(this.instanceId) || []
    if (instanceExecutions.length >= this.maxRecorder) {
      const toBeRemovedItem = instanceExecutions.shift()
      this.popExecution(toBeRemovedItem)
    }
    instanceExecutions.push(executionId)
    this.setItem(this.instanceId, instanceExecutions)
  }

  private popExecution(executionId: Engine.Key) {
    const instanceData = this.getItem(executionId) || []
    instanceData.forEach((actionId) => {
      storage.removeItem(actionId)
    })
    storage.removeItem(executionId)
  }

  private pushActionToExecution(executionId: Engine.Key, actionId: Engine.Key) {
    const actions = this.getItem(executionId) || []
    actions.push(actionId)
    this.setItem(executionId, actions)
  }

  /**
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
  async addActionRecord(action: Recorder.Info) {
    const { executionId, actionId } = action
    const instanceData = await this.getExecutionActions(executionId)

    if (!instanceData) {
      this.addExecution(executionId)
    }
    this.pushActionToExecution(executionId, actionId)
    this.setItem(actionId, action)
  }

  async getActionRecord(actionId: Engine.Key): Promise<Recorder.Info> {
    return this.getItem(actionId)
  }

  clear() {
    this.clearInstance(this.instanceId)
  }

  clearInstance(instanceId: Engine.Key) {
    const instanceExecutions = this.getItem(instanceId) || []
    // TODO: 完善类型定义
    instanceExecutions.forEach((executionId) => {
      storage.removeItem(executionId)
      const instanceData = this.getItem(executionId) || []
      instanceData.forEach((actionId) => {
        storage.removeItem(actionId)
      })
    })

    storage.removeItem(instanceId)
  }
}

export namespace Recorder {
  export interface Base {
    addActionRecord: (action: Info) => Promise<void>
    getActionRecord: (actionId: Engine.Key) => Promise<Info>
    getExecutionActions: (executionId: Engine.Key) => Promise<string[]>
    clear: () => void
  }

  export type Info = {
    timestamp: number
  } & Engine.NextActionParam
}

export default Recorder
