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
import { formatData } from './util/compatible';

import {
  EdgeConfig,
  EdgeFilter,
  NodeConfig,
  NodeAttribute,
  Extension,
  ComponentRender,
  FocusOnArgs,
  RegisterElementFn,
  RegisterParam,
  EdgeAttribute,
  EdgeData,
} from './type';
import { initDefaultShortcut } from './keyboard/shortcut';
import SnaplineModel from './model/SnaplineModel';
import { snaplineTool } from './tool/SnaplineTool';
import { EditConfigInterface } from './model/EditConfigModel';

if (process.env.NODE_ENV === 'development') {
  require('preact/debug');// eslint-disable-line global-require
}

type GraphConfigData = {
  nodes: NodeConfig[],
  edges: EdgeConfig[],
};

type GraphConfigModel = {
  nodes: BaseNodeModel[];
  edges: BaseEdgeModel[];
};

export default class LogicFlow {
  container: HTMLElement;
  width: number;
  height: number;
  graphModel: GraphModel;
  history: History;
  viewMap = new Map();
  tool: Tool;
  keyboard: Keyboard;
  dnd: Dnd;
  options: Options.Definition;
  getSnapshot: () => void;
  eventCenter: EventEmitter;
  snaplineModel: SnaplineModel;
  static extensions: Map<string, Extension> = new Map();
  components: ComponentRender[] = [];
  adapterIn: (data: unknown) => GraphConfigData;
  adapterOut: (data: GraphConfigData) => unknown;
  [propName: string]: any;
  constructor(options: Options.Definition) {
    const {
      container,
      width,
      height,
      dndOptions,
      keyboard,
      isSilentMode,
      snapline,
    } = options;
    this.options = Options.get(options);
    this.container = container;
    this.width = width || container.getBoundingClientRect().width;
    this.height = height || container.getBoundingClientRect().height;
    this.tool = new Tool(this);
    this.eventCenter = new EventEmitter();
    this.history = new History(this.eventCenter);
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
    this.installPlugins(options.activePlugins);
    // 先初始化默认内置快捷键
    initDefaultShortcut(this, this.graphModel);
    // 然后再初始化自定义快捷键，自定义快捷键可以覆盖默认快捷键
    this.keyboard.initShortcuts();
  }
  on(evt: string, callback: CallbackType) {
    this.eventCenter.on(evt, callback);
  }
  off(evt: string, callback: CallbackType) {
    this.eventCenter.off(evt, callback);
  }
  emit(evt: string, arg: Record<string, string | number | object>) {
    this.eventCenter.emit(evt, arg);
  }
  getEvents() {
    this.eventCenter.getEvents();
  }
  /**
   * 添加扩展, 待讨论，这里是不是静态方法好一些？
   * 重复添加插件的时候，把上一次添加的插件的销毁。
   * @param plugin 插件
   */
  static use(extension: Extension) {
    const preExtension = this.extensions.get(extension.name);
    preExtension && preExtension.destroy && preExtension.destroy();
    this.extensions.set(extension.name, extension);
  }
  installPlugins(activePlugins) {
    if (activePlugins) {
      for (let i = 0; i < activePlugins.length; i++) {
        const name = activePlugins[i];
        const extension = LogicFlow.extensions.get(name);
        if (!extension) {
          console.warn(`cannot find extension ${name}`);
          break;
        }
        this.__installPlugin(extension);
      }
      return;
    }
    LogicFlow.extensions.forEach((extension) => this.__installPlugin(extension));
  }
  __installPlugin(extension) {
    const { install, render: renderComponent } = extension;
    install && install.call(extension, this, LogicFlow);
    renderComponent && this.components.push(renderComponent.bind(extension));
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

    this.setView(type, observer(ViewClass as IReactComponent));
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
    // formatData兼容vue数据
    const graphData = formatData(this.history.undo());
    this.clearSelectElements();
    this.graphModel.graphDataToModel(graphData);
  }
  redo() {
    if (!this.history.redoAble()) return;
    // formatData兼容vue数据
    const graphData = formatData(this.history.redo());
    this.clearSelectElements();
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
   * 获取缩放的值和平移的值。
   */
  getTransform() {
    const {
      transformMatrix: {
        SCALE_X,
        SCALE_Y,
        TRANSLATE_X,
        TRANSLATE_Y,
      },
    } = this.graphModel;
    return {
      SCALE_X,
      SCALE_Y,
      TRANSLATE_X,
      TRANSLATE_Y,
    };
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
   * 还原图形为初始位置
   */
  resetTranslate(): void {
    const { transformMatrix } = this.graphModel;
    const { TRANSLATE_X, TRANSLATE_Y } = transformMatrix;
    this.translate(-TRANSLATE_X, -TRANSLATE_Y);
  }
  /**
   * 将图形选中
   * @param id 选择元素ID
   * @param multiple 是否允许多选，如果为true，不会将上一个选中的元素重置
   */
  select(id: string, multiple = false) {
    this.graphModel.selectElementById(id, multiple);
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
    const Model = this.graphModel.getNodeModel(nodeId);
    const data = Model.getData();
    const { guards } = this.options;
    const enabledDelete = guards && guards.beforeDelete ? guards.beforeDelete(data) : true;
    if (enabledDelete) {
      this.graphModel.deleteNode(nodeId);
    }
  }
  /**
   * 添加节点
   * @param nodeConfig 节点配置
   */
  addNode(nodeConfig: NodeConfig): BaseNodeModel {
    return this.graphModel.addNode(nodeConfig);
  }
  /**
   * 添加多个元素, 包括连线和节点。
   */
  cloneElements({ nodes, edges }: GraphConfigData): GraphConfigModel {
    const nodeIdMap = {};
    const elements = {
      nodes: [],
      edges: [],
    };
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const preId = node.id;
      const nodeModel = this.cloneNode(node.id);
      if (!nodeModel) return;
      if (preId) nodeIdMap[preId] = nodeModel.id;
      elements.nodes.push(nodeModel);
    }
    edges.forEach(edge => {
      const sourceId = edge.sourceNodeId;
      const targetId = edge.targetNodeId;
      if (nodeIdMap[sourceId]) edge.sourceNodeId = nodeIdMap[sourceId];
      if (nodeIdMap[targetId]) edge.targetNodeId = nodeIdMap[targetId];
      const edgeModel = this.graphModel.createEdge(edge);
      elements.edges.push(edgeModel);
    });
    return elements;
  }

  clearSelectElements() {
    this.graphModel.clearSelectElements();
  }

  setProperties(id: string, properties: Object): void {
    this.graphModel.getElement(id)?.setProperties(formatData(properties));
  }

  getProperties(id: string): Object {
    return this.graphModel.getElement(id)?.getProperties();
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
    const Model = this.graphModel.getNodeModel(nodeId);
    const data = Model.getData();
    const { guards } = this.options;
    const enabledClone = guards && guards.beforeClone ? guards.beforeClone(data) : true;
    if (enabledClone) {
      return this.graphModel.cloneNode(nodeId);
    }
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
  /**
   * 删除边
   * @param {string} edgeId 边Id
   */
  deleteEdge(edgeId: string): void {
    // 待讨论，这种钩子在这里覆盖不到removeEdge, 是否需要在graphModel中实现
    const { guards } = this.options;
    const edgeData = this.graphModel.edgesMap[edgeId].model.getData();
    const enabledDelete = guards && guards.beforeDelete
      ? guards.beforeDelete(edgeData) : true;
    if (enabledDelete) {
      this.graphModel.removeEdgeById(edgeId);
    }
  }
  /* 删除指定类型的边 */
  removeEdge(config: { sourceNodeId: string, targetNodeId: string }): void {
    const {
      sourceNodeId, targetNodeId,
    } = config;
    if (sourceNodeId && targetNodeId) {
      this.graphModel.removeEdge(sourceNodeId, targetNodeId);
    } else if (sourceNodeId) {
      this.graphModel.removeEdgeBySource(sourceNodeId);
    } else if (targetNodeId) {
      this.graphModel.removeEdgeByTarget(targetNodeId);
    }
  }
  /**
   * 更新节点或连线文案
   * @param id 节点或者连线id
   * @param value 文案内容
   */
  updateText(id: string, value: string) {
    this.graphModel.setElementTextById(id, value);
  }
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
  setDefaultEdgeType(type: Options.EdgeType): void {
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
  /**
   * 更新流程图编辑相关设置
   */
  updateEditConfig(config: EditConfigInterface) {
    this.graphModel.editConfig.updateEditConfig(config);
  }

  /**
   * 获取
   */
  getEditConfig() {
    return this.graphModel.editConfig.getConfig();
  }

  /**
   * 获取指定区域坐标，此区域必须是DOM层，也就是可视区域。
   * @param leftTopPoint 区域左上角坐标, dom层坐标
   * @param rightBottomPoint 区域右下角坐标，dom层坐标
   */
  getAreaElement(leftTopPoint, rightBottomPoint) {
    return this.graphModel.getAreaElement(leftTopPoint, rightBottomPoint)
      .map(element => element.getData());
  }

  removeNodeSnapLine() {
    if (this.snaplineModel) {
      this.snaplineModel.clearSnapline();
    }
  }

  /**
   * 获取事件位置相对于画布左上角的坐标
   * @param {number} x 事件x坐标
   * @param {number} y 事件y坐标
   * @returns {object} Point 事件位置的坐标
   * @returns {object} Point.domOverlayPosition HTML层上的坐标
   * @returns {object} Point.canvasOverlayPosition SVG层上的坐标
   */
  getPointByClient(x: number, y: number) {
    return this.graphModel.getPointByClient({ x, y });
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
          components={this.components}
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
