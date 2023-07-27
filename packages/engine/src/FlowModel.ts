import type {
  NodeConfig,
  NodeConstructor,
} from './nodes/BaseNode';
import type Recorder from './recorder';
import {
  EVENT_INSTANCE_COMPLETE, EVENT_INSTANCE_INTERRUPTED,
} from './constant/constant';
import { createExecId } from './util/ID';
import Scheduler from './Scheduler';
import { ErrorCode, getErrorMsg } from './constant/LogCode';
import type { TaskParam } from './types.d';

export type FlowResult = {
  result?: Record<string, any>;
} & TaskParam;

export type TaskParams = {
  executionId?: string;
  taskId?: string;
  nodeId?: string;
  data?: Record<string, any>;
};

export type ExecParams = {
  callback?: (result: FlowResult) => void;
  onError?: (error: Error) => void;
} & TaskParams;

export default class FlowModel {
  /**
   * 流程支持的节点类型
   */
  nodeModelMap: Map<string, NodeConstructor>;
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
    this.scheduler.on(EVENT_INSTANCE_INTERRUPTED, (result) => {
      this.onTaskFinished(result);
    });
  }
  public setStartNodeType(startNodeType) {
    this.startNodeType = startNodeType;
  }
  /**
   * 解析LogicFlow图数据，将nodes和edges转换成节点格式。
   * 例如：
   * graphData: {
   *  nodes: [
   *   { id: 'node1', type: 'StartNode', properties: {} },
   *   { id: 'node2', type: 'TaskNode', properties: {} },
   *  ],
   *  edges: [
   *    { id: 'edge1', sourceNodeId: 'node1', targetNodeId: 'node2', properties: {} },
   *  ]
   * }
   * 转换成：
   * nodeConfigMap: {
   *  node1: {
   *    id: 'node1',
   *    type: 'StartNode',
   *    properties: {},
   *    incoming: [],
   *    outgoing: [{ id: 'edge1', properties: {}, target: 'node2' }]
   *  },
   *  node2: {
   *   id: 'node2',
   *   type: 'TaskNode',
   *   properties: {},
   *   incoming: [{ id: 'edge1', properties: {}, source: 'node1' }],
   *   outgoing: [],
   *  }
   * }
   * 此格式方便后续执行时，根据节点id快速找到节点和执行初始化节点模型。
   * 同时此方法还会找到所有的开始节点，方便后续执行时，从开始节点开始执行。
   * @param graphData 流程图数据
   */
  public load(graphData) {
    const { nodes = [], edges = [] } = graphData;
    this.startNodes = [];
    this.nodeConfigMap = new Map();
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
   * 执行流程, 每次执行都会生成一个唯一的executionId，用于区分不同的执行。
   * 同一次执行，这次执行内部的节点执行顺序为并行。内部并行是为了避免异步节点阻塞其他节点的执行。
   * 多次执行，多次执行之间为串行，这里选择串行的原因是避免多次执行之间的数据冲突。
   * example：
   * 一个流程存在着两个开始节点，A和B，A和B的下一个节点都是C，C的下两个节点是D和E。
   * 外部分别触发了A和B的执行，那么A和B的执行是串行的（也就是需要A执行完成后再执行B），但是D和E的执行是并行的。
   * 如果希望A和B的执行是并行的，就不能使用同一个流程模型执行，应该初始化两个。
   */
  public async execute(params: ExecParams) {
    this.executeQueue.push(params);
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.createExecution();
  }
  public async resume(params: ExecParams) {
    this.executeQueue.push(params);
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.createExecution();
  }
  /**
   * 创建节点实例, 每个节点实例都会有一个唯一的taskId。
   * 通过executionId、nodeId、taskId可以唯一确定一个节点的某一次执行。
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
  /**
   * 在执行完成后，通知外部此次执行完成。
   * 如果还存在待执行的任务，那么继续执行。
   */
  private onTaskFinished(result) {
    const { callback } = this.executingInstance;
    if (callback) {
      callback(result);
    }
    this.executingInstance = null;
    if (this.executeQueue.length > 0) {
      this.createExecution();
    } else {
      this.isRunning = false;
    }
  }
  /**
   * 从待执行队列中取出需要执行的内容。
   * 会依次判断是否有taskId、nodeId、executionId。
   * 若存在taskId，那么表示恢复执行。
   * 若存在nodeId，那么表示从指定节点开始执行。
   * 若都不存在，那么新建一个executionId，从开始节点开始执行。
   */
  private createExecution() {
    const execParams = this.executeQueue.shift();
    this.executingInstance = execParams;
    // 如果有taskId，那么表示恢复执行
    if (execParams.taskId && execParams.executionId && execParams.nodeId) {
      this.scheduler.resume({
        executionId: execParams.executionId,
        taskId: execParams.taskId,
        nodeId: execParams.nodeId,
        data: execParams.data,
      });
      return;
    }
    const executionId = execParams.executionId || createExecId();
    if (execParams.nodeId) {
      const nodeConfig = this.nodeConfigMap.get(execParams.nodeId);
      if (!nodeConfig) {
        execParams.onError(new Error(`${getErrorMsg(ErrorCode.NONE_NODE_ID)}(${execParams.nodeId})`));
        return;
      }
      this.startNodes = [nodeConfig];
    }
    this.startNodes.forEach((startNode) => {
      this.scheduler.addTask({
        executionId,
        nodeId: startNode.id,
      });
    });
    this.scheduler.run({
      executionId,
    });
  }
}
