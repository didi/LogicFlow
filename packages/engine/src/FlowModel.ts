// import type { GraphConfigData } from '@logicflow/core';
import type { BaseNodeInterface } from './nodes/BaseNode';
import {
  ErrorCode,
  getErrorMsg,
  getWarningMsg,
  WarningCode,
} from './constant/LogCode';
import { createExecId } from './util/ID';
import Scheduler from './Scheduler';
import NodeManager from './NodeManager';

export type TaskUnit = {
  executionId: string;
  taskId: string;
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
  nodeModelMap: Map<string, any>;
  executionId: string;
  scheduler: Scheduler;
  NodeManager: NodeManager;
  executeQueue: ExecParams[];
  executingMap: Map<string, ExecParams>;
  isRunning: boolean;
  constructor(nodeModelMap) {
    // 流程包含的节点类型
    this.nodeModelMap = nodeModelMap;
    // 需要执行的队列
    this.executeQueue = [];
    // 执行中的任务
    this.executingMap = new Map();
    this.isRunning = false;
    this.NodeManager = new NodeManager();
    this.scheduler = new Scheduler({
      NodeManager: this.NodeManager,
    });
    this.scheduler.on('taskFinished', (result) => {
      this.onTaskFinished(result);
    });

  }
  onTaskFinished(result) {
    const { executionId, taskId, nodeId } = result;
    const execParams = this.executingMap.get(executionId);
    if (!execParams) {
      return;
    }
    const { callback } = execParams;
    if (callback) {
      callback(result);
    }
    this.executingMap.delete(executionId);
  }
  load(graphData) {
    const { nodes = [], edges = [] } = graphData;
    nodes.forEach((node) => {
      const Task = this.getNodeModel(node.type);
      if (Task) {
        const task = new Task(node);
        this.NodeManager.addTask(task);
      } else {
        console.warn(`未识别的节点类型: ${node.type}`);
      }
    });
    edges.forEach((edge) => {
      const sourceTask = this.NodeManager.getTask(edge.sourceNodeId);
      const targetTask = this.NodeManager.getTask(edge.targetNodeId);
      if (sourceTask) {
        sourceTask.outgoing.push({
          id: edge.id,
          condition: edge.properties,
          target: edge.targetNodeId,
        });
      }
      if (targetTask && targetTask.baseType !== 'start') {
        targetTask.incoming.push({
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
    console.log('createExecuteInstance', execParams);
    const startNodes = this.NodeManager.getStartTasks();
    startNodes.forEach((startNode) => {
      this.scheduler.addTask({
        executionId: this.executionId,
        taskId: startNode.taskId,
        nodeId: startNode.nodeId,
      });
      this.scheduler.run({
        executionId: this.executionId,
        taskId: startNode.taskId,
        nodeId: startNode.nodeId,
      });
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
  getNodeModel(type) {
    return this.nodeModelMap.get(type);
  }
}
