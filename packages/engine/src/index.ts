import type { ResumeParams, GraphConfigData, EngineConstructorOptions } from './types.d';
import FlowModel, { ActionParams } from './FlowModel';
import StartNode from './nodes/StartNode';
import TaskNode from './nodes/TaskNode';
import Recorder from './recorder';
import { createEngineId } from './util/ID';
import { NodeConstructor } from './nodes/BaseNode';

export default class Engine {
  id: string;
  global: Record<string, any>;
  graphData: GraphConfigData;
  nodeModelMap: Map<string, NodeConstructor>;
  flowModel: FlowModel;
  recorder: Recorder;
  context: Record<string, any>;
  constructor(options?: EngineConstructorOptions) {
    this.nodeModelMap = new Map();
    this.id = createEngineId();
    this.recorder = new Recorder();
    this.register({
      type: StartNode.nodeTypeName,
      model: StartNode,
    });
    this.register({
      type: TaskNode.nodeTypeName,
      model: TaskNode,
    });
    this.context = options?.context || {};
  }
  /**
   * 注册节点
   * @param nodeConfig { type: 'custom-node', model: NodeClass }
   */
  register(nodeConfig) {
    this.nodeModelMap.set(nodeConfig.type, nodeConfig.model);
  }
  /**
   * 自定义执行记录的存储，默认浏览器使用 sessionStorage，nodejs 使用内存存储。
   * 注意：由于执行记录不会主动删除，所以需要自行清理。
   * nodejs环境建议自定义为持久化存储。
   * engine.setCustomRecorder({
   *   async addActionRecord(task) {}
   *   async getTask(actionId) {}
   *   async getExecutionTasks(executionId) {}
   *   clear() {}
   * });
   */
  setCustomRecorder(recorder: Recorder) {
    this.recorder = recorder;
  }
  /**
   * 加载流程图数据
   */
  load({
    graphData,
    startNodeType = 'StartNode',
    globalData = {},
  }) {
    this.flowModel = new FlowModel({
      nodeModelMap: this.nodeModelMap,
      recorder: this.recorder,
      context: this.context,
      globalData,
      startNodeType,
    });
    this.flowModel.load(graphData);
    return this.flowModel;
  }
  /**
   * 执行流程，允许多次调用。
   */
  async execute(execParam?: ActionParams) {
    return new Promise((resolve, reject) => {
      if (!execParam) {
        execParam = {};
      }
      this.flowModel.execute({
        ...execParam,
        callback: (result) => {
          resolve(result);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  }
  /**
   * 恢复执行
   * 注意此方法只能恢复节点后面的执行，不能恢复流程其他分支的执行。
   * 同理，中断执行也只能中断节点后面的执行，不会中断其他分支的执行。
   * 在实际项目中，如果存在中断节点，建议流程所有的节点都是排他网关，这样可以保证执行的过程不存在分支。
   */
  async resume(resumeParam: ResumeParams) {
    return new Promise((resolve, reject) => {
      this.flowModel.resume({
        ...resumeParam,
        callback: (result) => {
          resolve(result);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  }
  async getExecutionList() {
    const executionIds = await this.recorder.getExecutionList();
    return executionIds;
  }
  async getExecutionRecord(executionId) {
    const tasks = await this.recorder.getExecutionActions(executionId);
    if (!tasks) {
      return null;
    }
    const records = [];
    for (let i = 0; i < tasks.length; i++) {
      records.push(this.recorder.getActionRecord(tasks[i]));
    }
    return Promise.all(records);
  }
  getGlobalData() {
    return this.flowModel?.globalData;
  }
  setGlobalData(data) {
    if (this.flowModel) {
      this.flowModel.globalData = data;
    }
  }
  updateGlobalData(data) {
    if (this.flowModel) {
      Object.assign(this.flowModel.globalData, data);
    }
  }
}

export {
  Engine,
  TaskNode,
  StartNode,
};

export type {
  ActionParams,
};
