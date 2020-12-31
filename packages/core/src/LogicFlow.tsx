import { render, h } from 'preact';
import { observer, Provider } from 'mobx-react';
import * as mobx from 'mobx';
import { IReactComponent } from 'mobx-react/dist/types/IReactComponent';
import GraphModel from './model/GraphModel';
import Graph from './view/Graph';
import BaseNodeModel from './model/node/BaseNodeModel';
import BaseNode from './view/node/BaseNode';
import RectNodeModel from './model/node/RectNodeModel';
import RectNode from './view/node/RectNode';
import CircleNodeModel from './model/node/CircleNodeModel';
import CircleNode from './view/node/CircleNode';
import PolygonNodeModel from './model/node/PolygonNodeModel';
import PolygonNode from './view/node/PolygonNode';
import TextNodeModel from './model/node/TextNodeModel';
import TextNode from './view/node/TextNode';
import BaseEdgeModel from './model/edge/BaseEdgeModel';
import BaseEdge from './view/edge/BaseEdge';
import LineEdgeModel from './model/edge/LineEdgeModel';
import LineEdge from './view/edge/LineEdge';
import DiamondNode from './view/node/DiamondNode';
import DiamondNodeModel from './model/node/DiamondNodeModel';
import PolylineEdgeModel from './model/edge/PolylineEdgeModel';
import PolylineEdge from './view/edge/PolylineEdge';
import BezierEdgeModel from './model/edge/BezierEdgeModel';
import BezierEdge from './view/edge/BezierEdge';
import Dnd from './view/behavior/DnD';
import EllipseNode from './view/node/EllipseNode';
import EllipseNodeModel from './model/node/EllipseNodeModel';
import * as Options from './options';

import History from './history/History';
import Tool from './tool';
import EventEmitter, { CallbackType } from './event/eventEmitter';
import Keyboard from './keyboard';

import {
  EdgeConfig,
  EdgeFilter,
  NodeConfig,
  NodeAttribute,
  ExtensionLike,
  FocusOnArgs,
  RegisterElementFn,
  RegisterParam,
  EdgeAttribute,
  EdgeData,
} from './type';
import { initShortcut } from './keyboard/shortcut';
import SnaplineModel from './model/SnaplineModel';
import { snaplineTool } from './tool/SnaplineTool';

if (process.env.NODE_ENV === 'development') {
  require('preact/debug');// eslint-disable-line global-require
}

type GraphConfigData = {
  nodes: NodeConfig[],
  edges: EdgeConfig[],
};

export default class LogicFlow {
  container: HTMLElement;
  width: number;
  height: number;
  graphModel: GraphModel;
  history: History = new History();
  viewMap = new Map();
  tool: Tool;
  keyboard: Keyboard;
  dnd: Dnd;
  options: Options.Definition;
  getSnapshot: () => void;
  eventCenter: EventEmitter;
  snaplineModel: SnaplineModel;
  static extensions: ExtensionLike[] = [];
  adapterIn: (data: unknown) => GraphConfigData;
  adapterOut: (data: GraphConfigData) => unknown;
  constructor(options: Options.Definition) {
    const {
      container,
      width,
      height,
      tool = {},
      dndOptions,
      keyboard,
      isSilentMode,
      snapline,
    } = options;
    this.options = Options.get(options);
    this.container = container;
    this.width = width;
    this.height = height;
    if (!this.width) {
      this.width = container.getBoundingClientRect().width;
    }
    if (!this.height) {
      this.height = container.getBoundingClientRect().height;
    }
    this.tool = new Tool(tool, this);
    this.eventCenter = new EventEmitter();
    this.dnd = new Dnd({ options: dndOptions, lf: this });
    this.keyboard = new Keyboard({ lf: this, keyboard });
    // model 初始化
    this.graphModel = new GraphModel({
      ...this.options,
      eventCenter: this.eventCenter,
      rootEl: this.container,
      width: this.width,
      height: this.height,
    });
    // 不可编辑模式没有开启，且没有关闭对齐线
    if (!isSilentMode && snapline !== false) {
      this.snaplineModel = new SnaplineModel(this.graphModel);
      snaplineTool(this.eventCenter, this.snaplineModel);
    }
    // init 放到最后
    this.defaultRegister();
    this.installPlugins();
    initShortcut(this, this.graphModel);
  }
  on(evt: string, callback: CallbackType) {
    this.eventCenter.on(evt, callback);
  }
  off(evt: string, callback: CallbackType) {
    this.eventCenter.off(evt, callback);
  }
  getEvents() {
    this.eventCenter.getEvents();
  }
  /**
   * 添加扩展, 待讨论，这里是不是静态方法好一些？
   * @param plugin 插件
   */
  static use(extension: ExtensionLike) {
    this.extensions.push(extension);
  }
  installPlugins() {
    LogicFlow.extensions.forEach((extension) => {
      extension.install(this);
    });
  }

  register(type: string, fn: RegisterElementFn) {
    const registerParam: RegisterParam = {
      BaseEdge,
      BaseEdgeModel,
      BaseNode,
      BaseNodeModel,
      RectNode,
      RectNodeModel,
      CircleNode,
      CircleNodeModel,
      PolygonNode,
      PolygonNodeModel,
      TextNode,
      TextNodeModel,
      LineEdge,
      LineEdgeModel,
      DiamondNode,
      DiamondNodeModel,
      PolylineEdge,
      PolylineEdgeModel,
      BezierEdge,
      BezierEdgeModel,
      EllipseNode,
      EllipseNodeModel,
      mobx,
      h,
      type,
    };
    // 为了能让后来注册的可以继承前面注册的
    // 例如我注册一个”开始节点“
    // 然后我再想注册一个”立即开始节点“
    // 注册传递参数改为动态。
    this.viewMap.forEach(component => {
      const key = component.extendKey;
      if (key) {
        registerParam[key] = component;
      }
    });
    this.graphModel.modelMap.forEach(component => {
      const key = component.extendKey;
      if (key) {
        registerParam[key] = component;
      }
    });
    const {
      view: ViewClass,
      model: ModelClass,
    } = fn(registerParam);

    this.setView(type, observer(ViewClass));
    this.graphModel.setModel(type, ModelClass);
  }

  defaultRegister() {
    // register default shape
    this.register('rect', () => ({ view: RectNode, model: RectNodeModel }));
    this.register('circle', () => ({ view: CircleNode, model: CircleNodeModel }));
    this.register('polygon', () => ({ view: PolygonNode, model: PolygonNodeModel }));
    this.register('line', () => ({ view: LineEdge, model: LineEdgeModel }));
    this.register('polyline', () => ({ view: PolylineEdge, model: PolylineEdgeModel }));
    this.register('bezier', () => ({ view: BezierEdge, model: BezierEdgeModel }));
    this.register('text', () => ({ view: TextNode, model: TextNodeModel }));
    this.register('ellipse', () => ({ view: EllipseNode, model: EllipseNodeModel }));
    this.register('diamond', () => ({ view: DiamondNode, model: DiamondNodeModel }));
  }

  undo() {
    if (!this.history.undoAble()) return;
    const graphData = this.history.undo();
    this.graphModel.graphDataToModel(graphData);
  }
  redo() {
    if (!this.history.redoAble()) return;
    const graphData = this.history.redo();
    this.graphModel.graphDataToModel(graphData);
  }

  /**
   * 放大缩小图形
   * isZoomIn 是否放大，默认false, 表示缩小。
   * @returns {string} -放大缩小的比例
   */
  zoom(isZoomIn = false): string {
    const { transformMatrix } = this.graphModel;
    transformMatrix.zoom(isZoomIn);
    return `${transformMatrix.SCALE_X * 100}%`;
  }
  /**
   * 还原图形
   */
  resetZoom(): void {
    const { transformMatrix } = this.graphModel;
    transformMatrix.resetZoom();
  }
  /**
   * 设置图形缩小时，能缩放到的最小倍数。参数为0-1自己。默认0.2
   * @param size 图形缩小的最小值
   */
  setZoomMiniSize(size: number): void {
    const { transformMatrix } = this.graphModel;
    transformMatrix.setZoomMiniSize(size);
  }
  /**
   * 设置图形放大时，能放大到的最大倍数，默认16
   * @param size 图形放大的最大值
   */
  setZoomMaxSize(size: number): void {
    const { transformMatrix } = this.graphModel;
    transformMatrix.setZoomMaxSize(size);
  }
  /**
   * 平移图形
   * @param x 向x轴移动距离
   * @param y 向y轴移动距离
   */
  translate(x: number, y: number): void {
    const { transformMatrix } = this.graphModel;
    transformMatrix.translate(x, y);
  }
  /**
   * 将图形定位到画布中心
   * @param focusOnArgs 支持用户传入图形当前的坐标或id，可以通过type来区分是节点还是连线的id，也可以不传（兜底）
   */
  focusOn(focusOnArgs: FocusOnArgs): void {
    const { transformMatrix } = this.graphModel;
    const { coordinate, id, type } = focusOnArgs;
    if (coordinate) {
      const { x, y } = coordinate;
      transformMatrix.focusOn(x, y, this.width, this.height);
    } else if (id) {
      if (type === 'node') {
        const model = this.getNodeModel(id);
        const { x, y } = model.getData();
        transformMatrix.focusOn(x, y, this.width, this.height);
      } else if (type === 'edge') {
        const model = this.getEdgeModelById(id);
        const { x, y } = model.textPosition;
        transformMatrix.focusOn(x, y, this.width, this.height);
      } else {
        const nodeModel = this.getNodeModel(id);
        if (!nodeModel) {
          const edgeModel = this.getEdgeModelById(id);
          const { x, y } = edgeModel.textPosition;
          transformMatrix.focusOn(x, y, this.width, this.height);
          return;
        }
        const { x, y } = nodeModel.getData();
        transformMatrix.focusOn(x, y, this.width, this.height);
      }
    }
  }
  /**
   * 删除节点
   * @param {string} nodeId 节点Id
   */
  deleteNode(nodeId: string): void {
    // todo: 1) before after钩子； 2) 删除后的回调
    this.graphModel.deleteNode(nodeId);
  }
  /**
   * 添加节点
   * @param nodeConfig 节点配置
   */
  addNode(nodeConfig: NodeConfig): BaseNodeModel {
    return this.graphModel.addNode(nodeConfig);
  }
  /**
   * 显示节点文本编辑框
   * @param nodeId 节点id
   */
  editNodeText(nodeId: string): void {
    this.graphModel.setTextEditable(nodeId);
  }
  /**
   * 克隆节点
   * @param nodeId 节点Id
   */
  cloneNode(nodeId: string): BaseNodeModel {
    return this.graphModel.cloneNode(nodeId);
  }
  /**
   * 获取节点对象
   * @param nodeId 节点Id
   */
  // todo: 不做外api输出，有例子在使用，后续删除
  getNodeModel(nodeId: string): BaseNodeModel {
    return this.graphModel.getNodeModel(nodeId);
  }
  /**
   * 获取节点数据
   * @param nodeId 节点Id
   */
  getNodeData(nodeId: string): NodeAttribute {
    return this.graphModel.getNodeModel(nodeId).getData();
  }
  setNodeData(nodeAttribute: NodeAttribute): void {
    const { id } = nodeAttribute;
    this.graphModel.getNodeModel(id).updateData(nodeAttribute);
  }
  setView(type: string, component: IReactComponent) {
    this.viewMap.set(type, component);
  }
  getView = (type: string) => this.viewMap.get(type);

  // getModel = this.graphModel.getModel;

  /* 创建边 */
  createEdge(edgeConfig: EdgeConfig): void {
    this.graphModel.createEdge(edgeConfig);
  }
  /* 删除边 */
  removeEdge(config: EdgeFilter): void {
    const {
      id, sourceNodeId, targetNodeId,
    } = config;
    if (id) {
      this.graphModel.removeEdgeById(id);
    }
    if (sourceNodeId && targetNodeId) {
      this.graphModel.removeEdge(sourceNodeId, targetNodeId);
    } else if (sourceNodeId) {
      this.graphModel.removeEdgeBySource(sourceNodeId);
    } else if (targetNodeId) {
      this.graphModel.removeEdgeByTarget(targetNodeId);
    }
  }
  /* 更新文案 */
  // updateEdgeText(id: string, text: string) {
  //   const { edgesMap } = this.graphModel;
  //   const { model } = edgesMap[id];
  //   model.updateText(text);
  // }
  /* 获取边，返回的是model */
  // TODO 移到 model
  getEdge(config: EdgeFilter): BaseEdgeModel[] {
    const { edges, edgesMap } = this.graphModel;
    const {
      id, sourceNodeId, targetNodeId,
    } = config;
    if (id) {
      return [edgesMap[id].model];
    }
    if (sourceNodeId && targetNodeId) {
      const result = [];
      edges.forEach(edge => {
        if (edge.sourceNodeId === sourceNodeId && edge.targetNodeId === targetNodeId) {
          result.push(edge);
        }
      });
      return result;
    }
    if (sourceNodeId) {
      const result = [];
      edges.forEach(edge => {
        if (edge.sourceNodeId === sourceNodeId) {
          result.push(edge);
        }
      });
      return result;
    }
    if (targetNodeId) {
      const result = [];
      edges.forEach(edge => {
        if (edge.targetNodeId === targetNodeId) {
          result.push(edge);
        }
      });
      return result;
    }
    return [];
  }
  /**
   * 获取边的model
   * @param edgeId 边的Id
   */
  // todo: 不做外api输出，有例子在使用，后续删除
  getEdgeModelById(edgeId: string): BaseEdgeModel {
    const { edgesMap } = this.graphModel;
    return edgesMap[edgeId].model;
  }
  getEdgeData(edgeId: string): EdgeData {
    return this.getEdgeModelById(edgeId).getData();
  }
  setEdgeData(edgeAttribute: EdgeAttribute): void {
    const { id } = edgeAttribute;
    return this.getEdgeModelById(id).updateData(edgeAttribute);
  }
  setDefaultEdgeType(type: string): void {
    this.options.edgeType = type;
    this.graphModel.changeEdgeType(type);
  }
  /**
   * 获取流程绘图数据
   */
  getGraphData(): GraphConfigData | any {
    const data = this.graphModel.modelToGraphData();
    if (this.adapterOut) {
      return this.adapterOut(data as GraphConfigData);
    }
    return data;
  }
  /**
   * 获取流程绘图原始数据
   * 在存在adapter时，可以使用getGraphRawData获取图原始数据
   */
  getGraphRawData() {
    const data = this.graphModel.modelToGraphData();
    return data;
  }

  /*
  * 设置主题样式
  */
  setTheme(style): void {
    this.graphModel.setTheme(style);
  }

  createFakerNode(nodeConfig) {
    const Model = this.graphModel.modelMap.get(nodeConfig.type);
    const fakerNodeModel = new Model(nodeConfig, this.graphModel);
    this.graphModel.setFakerNode(fakerNodeModel);
    return fakerNodeModel;
  }

  removeFakerNode() {
    this.graphModel.removeFakerNode();
  }

  setNodeSnapLine(data) {
    if (this.snaplineModel) {
      this.snaplineModel.setNodeSnapLine(data);
    }
  }

  removeNodeSnapLine() {
    if (this.snaplineModel) {
      this.snaplineModel.clearSnapline();
    }
  }

  // TODO 定义 graphData
  render(graphData = {}) {
    if (this.adapterIn) {
      graphData = this.adapterIn(graphData);
    }
    this.graphModel.graphDataToModel(graphData);
    if (!this.options.isSilentMode && this.options.history !== false) {
      this.history.watch(this.graphModel);
    }
    render((
      <Provider
        graphModel={this.graphModel}
      >
        <Graph
          eventCenter={this.eventCenter}
          getView={this.getView}
          tool={this.tool}
          options={this.options}
          dnd={this.dnd}
          snaplineModel={this.snaplineModel}
        />
      </Provider>
    ), this.container);
  }
}

export {
  BaseEdge,
  BaseEdgeModel,
  BaseNode,
  BaseNodeModel,
  RectNode,
  RectNodeModel,
  CircleNode,
  CircleNodeModel,
  PolygonNode,
  PolygonNodeModel,
  TextNode,
  TextNodeModel,
  LineEdge,
  LineEdgeModel,
  PolylineEdge,
  PolylineEdgeModel,
  EllipseNode,
  EllipseNodeModel,
  mobx,
  h,
};
