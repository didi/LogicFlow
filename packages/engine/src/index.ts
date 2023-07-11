import type { GraphConfigData } from '@logicflow/core';
import FlowModel, { TaskParams } from './FlowModel';
import StartNode from './nodes/StartNode';
import TaskNode from './nodes/TaskNode';
import Recorder from './recorder';

export default class Engine {
  global: Record<string, any>;
  graphData: GraphConfigData;
  nodeModelMap: Map<string, any>;
  flowModel: FlowModel;
  recorder: Recorder;
  constructor() {
    this.nodeModelMap = new Map();
    this.recorder = new Recorder();
    // register node
    this.register({
      type: StartNode.nodeTypeName,
      model: StartNode,
    });
    this.register({
      type: TaskNode.nodeTypeName,
      model: TaskNode,
    });
  }
  /**
   * 注册节点
   * @param nodeConfig { type: 'custom-node', model: Class }
   */
  register(nodeConfig) {
    this.nodeModelMap.set(nodeConfig.type, nodeConfig.model);
  }
  /**
   * 自定义执行记录的存储，默认浏览器使用 sessionStorage，nodejs 使用内存存储。
   * 注意：由于执行记录不会主动删除，所以需要自行清理。
   * nodejs环境建议自定义为持久化存储。
   * engine.setCustomRecorder({
   *   async addTask(task) {}
   *   async getTask(taskId) {}
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
  load({ graphData, startNodeType = 'StartNode' }) {
    this.flowModel = new FlowModel({
      nodeModelMap: this.nodeModelMap,
      recorder: this.recorder,
    });
    this.flowModel.setStartNodeType(startNodeType);
    this.flowModel.load(graphData);
    return this.flowModel;
  }
  /**
   * 执行流程，允许多次调用。
   */
  async execute(execParam?: TaskParams) {
    return new Promise((resolve) => {
      if (!execParam) {
        execParam = {};
      }
      this.flowModel.execute({
        ...execParam,
        callback: (result) => {
          resolve(result);
        },
      });
    });
  }
  async getExecutionRecord(executionId) {
    const tasks = await this.recorder.getExecutionTasks(executionId);
    const records = [];
    for (let i = 0; i < tasks.length; i++) {
      records.push(this.recorder.getTask(tasks[i]));
    }
    return Promise.all(records);
  }
}

export {
  StartNode,
};

export type {
  TaskParams,
};
