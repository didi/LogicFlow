import type { ResumeParams, GraphConfigData } from './types.d';
import FlowModel, { ActionParams } from './FlowModel';
import StartNode from './nodes/StartNode';
import TaskNode from './nodes/TaskNode';
import Recorder from './recorder';
import { createEngineId } from './util/ID';
import { NodeConstructor } from './nodes/BaseNode';

export default class Engine {
  global: Record<string, any>;
  graphData: GraphConfigData;
  nodeModelMap: Map<string, NodeConstructor>;
  flowModel: FlowModel;
  id: string;
  recorder: Recorder;
  constructor() {
    this.nodeModelMap = new Map();
    this.recorder = new Recorder();
    this.id = createEngineId();
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
    context = {},
  }) {
    this.flowModel = new FlowModel({
      nodeModelMap: this.nodeModelMap,
      recorder: this.recorder,
      context,
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
  async getExecutionRecord(executionId) {
    const tasks = await this.recorder.getExecutionActions(executionId);
    const records = [];
    for (let i = 0; i < tasks.length; i++) {
      records.push(this.recorder.getActionRecord(tasks[i]));
    }
    return Promise.all(records);
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
