import type {
  NodeConfig,
  NodeConstructor,
} from './nodes/BaseNode';
import type Recorder from './recorder';
import {
  EVENT_INSTANCE_COMPLETE,
} from './constant/constant';
import { createExecId } from './util/ID';
import Scheduler from './Scheduler';

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
  nodeConfigMap: Map<string, NodeConfig> = new Map();
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
  /**
   * 用于存储全局数据，可以在流程中共享。
   */
  globalData: Record<string, any> = {};
  /**
   * 外部传入的上下文，最终会传递给每个节点
   * 例如：
   * const context = {
   *  request: {
   *   get: (url) => {
   *    return fetch(url);
   *  }
   * }
   * 在节点内部可以通过 this.context.request.get(url) 来调用。
   */
  context: Record<string, any>;
  constructor({
    nodeModelMap,
    recorder,
    context = {},
    globalData = {},
    startNodeType = 'StartNode',
  }: {
    nodeModelMap: Map<string, NodeConstructor>;
    recorder: Recorder;
    context?: Record<string, any>;
    globalData?: Record<string, any>;
    startNodeType?: string;
  }) {
    // 流程包含的节点类型
    this.nodeModelMap = nodeModelMap;
    // 需要执行的队列
    this.executeQueue = [];
    // 执行中的任务
    this.executingInstance = null;
    // 外部传入的上下文，最终会传递给每个节点
    this.context = context;
    // 用于存储全局数据，可以在流程中共享。
    this.globalData = globalData;
    // 开始节点类型，在执行流程时，会从这些节点开始执行。
    this.startNodeType = startNodeType;
    this.isRunning = false;
    this.scheduler = new Scheduler({
      flowModel: this,
      recorder,
    });
    this.scheduler.on(EVENT_INSTANCE_COMPLETE, (result) => {
      this.onTaskFinished(result);
    });
  }
  public setStartNodeType(startNodeType) {
    this.startNodeType = startNodeType;
  }
  public load(graphData) {
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
        this.nodeConfigMap.set(node.id, nodeConfig);
        if (node.type === this.startNodeType) {
          this.startNodes.push(nodeConfig);
        }
      } else {
        console.warn(`未识别的节点类型: ${node.type}`);
      }
    });
    edges.forEach((edge) => {
      const sourceNode = this.nodeConfigMap.get(edge.sourceNodeId);
      const targetNode = this.nodeConfigMap.get(edge.targetNodeId);
      if (sourceNode) {
        sourceNode.outgoing.push({
          id: edge.id,
          properties: edge.properties,
          target: edge.targetNodeId,
        });
      }
      if (targetNode && targetNode.type !== this.startNodeType) {
        targetNode.incoming.push({
          id: edge.id,
          properties: edge.properties,
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
  public async execute(params ?: ExecParams) {
    this.executeQueue.push(params);
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.createExecuteInstance();
  }
  /**
   * 创建节点实例
   * @param nodeId 节点Id
   * @returns 节点示例
   */
  public createTask(nodeId: string) {
    const nodeConfig = this.nodeConfigMap.get(nodeId);
    const NodeModel = this.nodeModelMap.get(nodeConfig.type);
    const task = new NodeModel({
      nodeConfig,
      globalData: this.globalData,
      context: this.context,
    });
    return task;
  }
  /**
   * 更新流程全局数据
   */
  public updateGlobalData(data) {
    this.globalData = {
      ...this.globalData,
      ...data,
    };
  }
  private onTaskFinished(result) {
    const { executionId } = result;
    if (executionId !== this.executionId) {
      return;
    }
    const { callback } = this.executingInstance;
    if (callback) {
      callback(result);
    }
    this.executingInstance = null;
    if (this.executeQueue.length > 0) {
      this.createExecuteInstance();
    } else {
      this.isRunning = false;
    }
  }
  private async createExecuteInstance() {
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
}
