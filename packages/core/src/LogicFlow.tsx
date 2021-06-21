import { render, h } from 'preact';
import { observer, Provider } from 'mobx-react';
// import * as mobx from 'mobx';
// import { IReactComponent } from 'mobx-react/dist/types/IReactComponent';
import GraphModel from './model/GraphModel';
import Graph from './view/Graph';
import Dnd from './view/behavior/DnD';
import * as Options from './options';
import * as _Model from './model';
import * as _View from './view';

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
  EdgeAttribute,
  EdgeData,
  GraphConfigData,
  RegisterElementFn,
  RegisterParam,
  RegisterConfig,
  ExtensionContractor,
} from './type';
import { initDefaultShortcut } from './keyboard/shortcut';
import SnaplineModel from './model/SnaplineModel';
import { snaplineTool } from './tool/SnaplineTool';
import { EditConfigInterface } from './model/EditConfigModel';

if (process.env.NODE_ENV === 'development') {
  require('preact/debug');// eslint-disable-line global-require
}

type GraphConfigModel = {
  nodes: _Model.BaseNodeModel[];
  edges: _Model.BaseEdgeModel[];
};

type InnerView = ClassDecorator & {
  isObervered: boolean;
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
    this.installPlugins(options.disabledPlugins);
    // 先初始化默认内置快捷键
    initDefaultShortcut(this, this.graphModel);
    // 然后再初始化自定义快捷键，自定义快捷键可以覆盖默认快捷键
    this.keyboard.initShortcuts();
  }

  // 事件系统----------------------------------------------

  on(evt: string, callback: CallbackType) {
    this.eventCenter.on(evt, callback);
  }
  off(evt: string, callback: CallbackType) {
    this.eventCenter.off(evt, callback);
  }
  emit(evt: string, arg: Record<string, string | number | object>) {
    this.eventCenter.emit(evt, arg);
  }

  // 插件系统----------------------------------------------

  /**
   * 添加扩展, 待讨论，这里是不是静态方法好一些？
   * 重复添加插件的时候，把上一次添加的插件的销毁。
   * @param plugin 插件
   */
  static use(extension: Extension) {
    let { pluginName } = extension;
    if (!pluginName) {
      console.warn('请给插件指定pluginName!');
      pluginName = extension.name; // 兼容以前name的情况，1.0版本去掉。
    }
    const preExtension = this.extensions.get(pluginName);
    preExtension && preExtension.destroy && preExtension.destroy();
    this.extensions.set(pluginName, extension);
  }
  installPlugins(disabledPlugins = []) {
    LogicFlow.extensions.forEach((extension) => {
      const pluginName = extension.pluginName || extension.name;
      if (disabledPlugins.indexOf(pluginName) === -1) {
        this.__installPlugin(extension);
      }
    });
  }
  __installPlugin(extension) {
    if (typeof extension === 'object') {
      const { install, render: renderComponent } = extension;
      install && install.call(extension, this, LogicFlow);
      renderComponent && this.components.push(renderComponent.bind(extension));
      return;
    }
    const ExtensionContructor = extension as ExtensionContractor;
    const extensionInstance = new ExtensionContructor({
      lf: this,
      LogicFlow,
    });
    extensionInstance.render && this.components.push(
      extensionInstance.render.bind(extensionInstance),
    );
  }
  register(type: string | RegisterConfig, fn?: RegisterElementFn, isObserverView = true) {
    if (typeof type !== 'string') {
      this._registerElement(type);
      return;
    }
    const registerParam: RegisterParam = {
      BaseEdge: _View.BaseEdge,
      BaseEdgeModel: _Model.BaseEdgeModel,
      BaseNode: _View.BaseNode,
      BaseNodeModel: _Model.BaseNodeModel,
      RectNode: _View.RectNode,
      RectNodeModel: _Model.RectNodeModel,
      CircleNode: _View.CircleNode,
      CircleNodeModel: _Model.CircleNodeModel,
      PolygonNode: _View.PolygonNode,
      PolygonNodeModel: _Model.PolygonNodeModel,
      TextNode: _View.TextNode,
      TextNodeModel: _Model.TextNodeModel,
      LineEdge: _View.LineEdge,
      LineEdgeModel: _Model.LineEdgeModel,
      DiamondNode: _View.DiamondNode,
      DiamondNodeModel: _Model.DiamondNodeModel,
      PolylineEdge: _View.PolylineEdge,
      PolylineEdgeModel: _Model.PolylineEdgeModel,
      BezierEdge: _View.BezierEdge,
      BezierEdgeModel: _Model.BezierEdgeModel,
      EllipseNode: _View.EllipseNode,
      EllipseNodeModel: _Model.EllipseNodeModel,
      // mobx,
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
    let vClass = ViewClass as InnerView;
    if (isObserverView && !vClass.isObervered) {
      vClass.isObervered = true;
      // @ts-ignore
      vClass = observer(vClass);
    }
    this.setView(type, vClass);
    this.graphModel.setModel(type, ModelClass);
  }
  _registerElement(config) {
    let vClass = config.view;
    if (config.isObserverView !== false && !vClass.isObervered) {
      vClass.isObervered = true;
      // @ts-ignore
      vClass = observer(vClass);
    }
    this.setView(config.type, vClass);
    this.graphModel.setModel(config.type, config.model);
  }
  defaultRegister() {
    // register default shape
    this._registerElement({
      view: _View.RectNode,
      model: _Model.RectNodeModel,
      type: 'rect',
    });
    this._registerElement({
      type: 'circle',
      view: _View.CircleNode,
      model: _Model.CircleNodeModel,
    });
    this._registerElement({
      type: 'polygon',
      view: _View.PolygonNode,
      model: _Model.PolygonNodeModel,
    });
    this._registerElement({
      type: 'line',
      view: _View.LineEdge,
      model: _Model.LineEdgeModel,
    });
    this._registerElement({
      type: 'polyline',
      view: _View.PolylineEdge,
      model: _Model.PolylineEdgeModel,
    });
    this._registerElement({
      type: 'bezier',
      view: _View.BezierEdge,
      model: _Model.BezierEdgeModel,
    });
    this._registerElement({
      type: 'text',
      view: _View.TextNode,
      model: _Model.TextNodeModel,
    });
    this._registerElement({
      type: 'ellipse',
      view: _View.EllipseNode,
      model: _Model.EllipseNodeModel,
    });
    this._registerElement({
      type: 'diamond',
      view: _View.DiamondNode,
      model: _Model.DiamondNodeModel,
    });
    this._registerElement({
      type: 'html',
      view: _View.HtmlNode,
      model: _Model.HtmlNodeModel,
    });
  }

  // 全局操作----------------------------------------------

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
    let { coordinate } = focusOnArgs;
    const { id } = focusOnArgs;
    if (!coordinate) {
      const model = this.getNodeModel(id);
      if (model) {
        coordinate = model.getData();
      }
      const edgeModel = this.getEdgeModelById(id);
      if (edgeModel) {
        coordinate = edgeModel.textPosition;
      }
    }
    const { x, y } = coordinate;
    transformMatrix.focusOn(x, y, this.width, this.height);
  }
  /*
  * 设置主题样式
  */
  setTheme(style): void {
    this.graphModel.setTheme(style);
  }
  /**
   * 设置默认的连线类型
   * @param type Options.EdgeType
   */
  setDefaultEdgeType(type: Options.EdgeType): void {
    this.options.edgeType = type;
    this.graphModel.changeEdgeType(type);
  }
  /**
   * 更新节点或连线文案
   * @param id 节点或者连线id
   * @param value 文案内容
   */
  updateText(id: string, value: string) {
    this.graphModel.setElementTextById(id, value);
  }

  // 节点操作----------------------------------------------
  /**
   * 修改指定节点类型
   * @param id 节点id
   * @param type 节点类型
   */
  changeNodeType(id: string, type: string): void {
    this.graphModel.changeNodeType(id, type);
  }
  /**
   * 获取节点所有连线的model
   * @param nodeId 节点ID
   * @returns model数组
   */
  getNodeEdges(nodeId): _Model.BaseEdgeModel[] {
    return this.graphModel.getNodeEdges(nodeId);
  }
  /**
   * 添加节点
   * @param nodeConfig 节点配置
   */
  addNode(nodeConfig: NodeConfig): _Model.BaseNodeModel {
    return this.graphModel.addNode(nodeConfig);
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
  cloneNode(nodeId: string): _Model.BaseNodeModel {
    const Model = this.graphModel.getNodeModel(nodeId);
    const data = Model.getData();
    const { guards } = this.options;
    const enabledClone = guards && guards.beforeClone ? guards.beforeClone(data) : true;
    if (enabledClone) {
      return this.graphModel.cloneNode(nodeId);
    }
  }

  // 连线操作----------------------------------------------

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
    const edge = this.graphModel.edgesMap[edgeId];
    if (!edge) {
      console.warn(`不存在id为${edgeId}的边`);
      return;
    }
    const edgeData = edge.model.getData();
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

  // 数据操作----------------------------------------------

  /* 获取边，返回的是model */
  // TODO 移到 model
  getEdge(config: EdgeFilter): _Model.BaseEdgeModel[] {
    const { edges, edgesMap } = this.graphModel;
    const {
      id, sourceNodeId, targetNodeId,
    } = config;
    if (id) {
      const edge = edgesMap[id];
      if (!edge) {
        console.warn(`不存在id为${id}的边`);
        return;
      }
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
   * 获取节点对象
   * @param nodeId 节点Id
   */
  // todo: 不做外api输出，有例子在使用，后续删除
  getNodeModel(nodeId: string): _Model.BaseNodeModel {
    return this.graphModel.getNodeModel(nodeId);
  }
  getNodeData(nodeId: string): NodeAttribute {
    return this.graphModel.getNodeModel(nodeId).getData();
  }
  setNodeData(nodeAttribute: NodeAttribute): void {
    const { id } = nodeAttribute;
    this.graphModel.getNodeModel(id).updateData(nodeAttribute);
  }
  getEdgeData(edgeId: string): EdgeData {
    return this.getEdgeModelById(edgeId)?.getData();
  }
  setEdgeData(edgeAttribute: EdgeAttribute): void {
    const { id } = edgeAttribute;
    return this.getEdgeModelById(id)?.updateData(edgeAttribute);
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
  /**
   * 设置元素的自定义属性
   * @param id 元素的id
   * @param properties 自定义属性
   */
  setProperties(id: string, properties: Object): void {
    this.graphModel.getElement(id)?.setProperties(formatData(properties));
  }
  /**
   * 获取元素的自定义属性
   * @param id 元素的id
   * @returns 自定义属性
   */
  getProperties(id: string): Object {
    return this.graphModel.getElement(id)?.getProperties();
  }
  /**
   * 更新流程图编辑相关设置
   */
  updateEditConfig(config: EditConfigInterface) {
    this.graphModel.editConfig.updateEditConfig(config);
  }
  /**
   * 获取流程图编辑相关设置
   */
  getEditConfig() {
    return this.graphModel.editConfig.getConfig();
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
  /**
   * 获取选中的元素数据
   * @param isIgnoreCheck 是否包括sourceNode和targetNode没有被选中的连线,默认包括。
   * 复制的时候不能包括此类连线, 因为复制的时候不允许悬空的连线。
   */
  getSelectElements(isIgnoreCheck = true) {
    this.graphModel.getSelectElements(isIgnoreCheck);
  }
  /**
   * 动态修改 id 对应元素 model 中的属性
   * @param {string} id 元素id
   * @param {object} attributes 需要更新的属性
   */
  updateAttributes(id: string, attributes: object) {
    this.graphModel.updateAttributes(id, attributes);
  }

  // 内部方法----------------------------------------------

  /**
   * 添加多个元素, 包括连线和节点。
   */
  addElements({ nodes, edges }: GraphConfigData): GraphConfigModel {
    const nodeIdMap = {};
    const elements = {
      nodes: [],
      edges: [],
    };
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const preId = node.id;
      const nodeModel = this.addNode(node);
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
  createFakerNode(nodeConfig) {
    const Model = this.graphModel.modelMap.get(nodeConfig.type);
    if (!Model) {
      console.warn(`不存在为${nodeConfig.type}类型的节点`);
      return;
    }
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
  // 清空数据
  clearData() {
    this.graphModel.clearData();
  }
  /**
   * 获取边的model
   * @param edgeId 边的Id
   */
  // todo: 不做外api输出，有例子在使用，后续删除
  getEdgeModelById(edgeId: string): _Model.BaseEdgeModel {
    const { edgesMap } = this.graphModel;
    return edgesMap[edgeId]?.model;
  }
  setView(type: string, component) {
    this.viewMap.set(type, component);
  }
  getView = (type: string) => this.viewMap.get(type);
  // TODO 定义 graphData
  render(graphData = {}) {
    if (this.adapterIn) {
      graphData = this.adapterIn(graphData);
    }
    this.graphModel.graphDataToModel(formatData(graphData));
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
