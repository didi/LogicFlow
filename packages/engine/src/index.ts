import type { GraphConfigData } from '@logicflow/core';
import FlowModel, { TaskParams } from './FlowModel';
import StartNode from './nodes/StartNode';
import TaskNode from './nodes/TaskNode';

export default class Engine {
  global: Record<string, any>;
  graphData: GraphConfigData;
  modelMap: Map<string, any>;
  flowModel: FlowModel;
  constructor() {
    this.modelMap = new Map();
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
    this.modelMap.set(nodeConfig.type, nodeConfig.model);
  }
  /**
   * 加载流程图数据
   */
  load({ graphData, startNodeType = 'StartNode' }) {
    this.flowModel = new FlowModel(this.modelMap);
    this.flowModel.setStartNodeType(startNodeType);
    this.flowModel.load(graphData);
    return this.flowModel;
  }
  /**
   * 执行流程，允许多次调用。
   */
  async execute(execParam?: TaskParams) {
    // const result = await this.flowModel.execute(flowResult);
    // return result;
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
}

export {
  StartNode,
};

export type {
  TaskParams,
};
