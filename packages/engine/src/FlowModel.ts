// import type { GraphConfigData } from '@logicflow/core';
import type BaseNode from './nodes/BaseNode';
import type { NodeConfig, NodeConstructor } from './nodes/BaseNode';
import {
  ErrorCode,
  getErrorMsg,
  getWarningMsg,
  WarningCode,
} from './constant/LogCode';
import {
  EVENT_INSTANCE_COMPLETE,
} from './constant/constant';
import { createExecId } from './util/ID';
import Scheduler from './Scheduler';
import NodeManager from './NodeManager';

export type TaskUnit = {
  executionId: string;
  taskId?: string;
  nodeId: string;
};

export type FlowResult = {
  result?: Record<string, any>;
} & TaskUnit;

export type TaskParams = {
  executionId?: string;
  taskId?: string;
  nodeId?: string;
};

export type ExecParams = {
  callback?: (result: FlowResult) => void;
} & TaskParams;

export default class FlowModel {
  /**
   * 流程支持的节点类型
   */
  nodeModelMap: Map<string, NodeConstructor>;
  /**
   * 每一次执行流程都会生成一个唯一的executionId。
   */
  executionId: string;
  /**
   * 调度器，用于调度节点的执行。
   */
  scheduler: Scheduler;
  NodeManager: NodeManager;
  /**
   * 待执行的队列，当流程正在执行时，如果再次触发执行。那么会将执行参数放入到队列中，等待上一次执行完成后再执行。
   */
  executeQueue: ExecParams[];
  /**
   * 当前正在执行。当监听到调度器执行完成时，出触发执行参数中的回调，告知外部执行完成。
   */
  executingInstance: ExecParams;
  /**
   * 当前流程模型中的所有节点，边会被转换成节点的incoming和outgoing属性。
   */
  nodeMap: Map<string, NodeConfig>;
  /**
   * 当流程正在执行时，如果再次触发执行。那么会将执行参数放入到队列中，等待上一次执行完成后再执行。
   */
  isRunning: boolean;
  /**
   * 开始节点类型，在执行流程时，会从这些节点开始执行。
   */
  startNodeType: string;
  /**
   * 当前流程中开始节点组成的数组。
   */
  startNodes: NodeConfig[] = [];
  constructor(nodeModelMap: Map<string, NodeConstructor>) {
    // 流程包含的节点类型
    this.nodeModelMap = nodeModelMap;
    // 需要执行的队列
    this.executeQueue = [];
    // 执行中的任务
    this.executingInstance = null;
    this.nodeMap = new Map();
    this.isRunning = false;
    this.NodeManager = new NodeManager();
    this.scheduler = new Scheduler({
      flowModel: this,
    });
    this.scheduler.on(EVENT_INSTANCE_COMPLETE, (result) => {
      this.onTaskFinished(result);
    });
  }
  onTaskFinished(result) {
    const { executionId } = result;
    if (executionId !== this.executionId) {
      return;
    }
    const { callback } = this.executingInstance;
    if (callback) {
      callback(result);
    }
    this.executingInstance = null;
    if (this.executeQueue.length) {
      this.createExecuteInstance();
    } else {
      this.isRunning = false;
    }
  }
  setStartNodeType(startNodeType) {
    this.startNodeType = startNodeType;
  }
  load(graphData) {
    const { nodes = [], edges = [] } = graphData;
    nodes.forEach((node) => {
      if (this.nodeModelMap.has(node.type)) {
        const nodeConfig = {
          id: node.id,
          type: node.type,
          properties: node.properties,
          incoming: [],
          outgoing: [],
        };
        this.nodeMap.set(node.id, nodeConfig);
        if (node.type === this.startNodeType) {
          this.startNodes.push(nodeConfig);
        }
      } else {
        console.warn(`未识别的节点类型: ${node.type}`);
      }
    });
    edges.forEach((edge) => {
      const sourceNode = this.nodeMap.get(edge.sourceNodeId);
      const targetNode = this.nodeMap.get(edge.targetNodeId);
      if (sourceNode) {
        sourceNode.outgoing.push({
          id: edge.id,
          condition: edge.properties,
          target: edge.targetNodeId,
        });
      }
      if (targetNode && targetNode.type !== this.startNodeType) {
        targetNode.incoming.push({
          id: edge.id,
          condition: edge.properties,
          source: edge.sourceNodeId,
        });
      }
    });
  }
  /**
   * 执行流程
   * 同一次执行，这次执行内部的节点执行顺序为并行。
   * 多次执行，多次执行之间为串行。
   * 允许一个流程多次执行，效率更高。
   * 例如：
   * 一个流程存在着两个开始节点，A和B，A和B的下一个节点都是C，C的下两个节点是D和E。
   * 外部分别触发了A和B的执行，那么A和B的执行是串行的（也就是需要A执行完成后再执行B），但是D和E的执行是并行的。
   * 如果希望A和B的执行是并行的，就不能使用同一个流程模型执行，应该初始化两个。
   */
  async execute(params ?: ExecParams) {
    this.executeQueue.push(params);
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.createExecuteInstance();
  }
  async createExecuteInstance() {
    const execParams = this.executeQueue.shift();
    this.executionId = createExecId();
    this.executingInstance = execParams;
    this.startNodes.forEach((startNode) => {
      this.scheduler.addTask({
        executionId: this.executionId,
        nodeId: startNode.id,
      });
      // 所有的开始节点都执行
      this.scheduler.run(this.executionId);
    });
  }
  /**
   * 在没有指定开始节点的情况下，创建一个新的流程实例，从流程的所有开始节点开始执行。
   */
  // async createInstance() {
  //   this.executionId = createExecId();
  //   const startNodes = this.NodeManager.getStartTasks();
  //   startNodes.forEach((startNode) => {
  //     this.scheduler.addTask({
  //       executionId: this.executionId,
  //       taskId: startNode.nodeId,
  //       nodeId: startNode.nodeId,
  //     });
  //   });
  //   const result = await this.scheduler.run({
  //     executionId: this.executionId,
  //   });
  //   return result;
  // }

  createTask(nodeId: string) {
    const nodeConfig = this.nodeMap.get(nodeId);
    const NodeModel = this.nodeModelMap.get(nodeConfig.type);
    const model = new NodeModel(nodeConfig);
    return model;
  }
}
