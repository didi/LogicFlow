import { render, h } from 'preact';
import { observer } from 'mobx-react';
// import { IReactComponent } from 'mobx-react/dist/types/IReactComponent';
import GraphModel from './model/GraphModel';
import Graph from './view/Graph';
import Dnd from './view/behavior/DnD';
import * as Options from './options';
import * as _Model from './model';
import * as _View from './view';

import History from './history/History';
import Tool from './tool';
import { CallbackType } from './event/eventEmitter';
import Keyboard from './keyboard';
import { formatData } from './util/compatible';

import {
  EdgeConfig,
  EdgeFilter,
  NodeConfig,
  Extension,
  ComponentRender,
  FocusOnArgs,
  EdgeData,
  GraphConfigData,
  RegisterElementFn,
  RegisterParam,
  RegisterConfig,
  ExtensionConstructor,
  ZoomParam,
  PointTuple,
} from './type';
import { initDefaultShortcut } from './keyboard/shortcut';
import SnaplineModel from './model/SnaplineModel';
import { snaplineTool } from './tool/SnaplineTool';
import { EditConfigInterface } from './model/EditConfigModel';
import { Theme } from './constant/DefaultTheme';
import { ElementType, EventType } from './constant/constant';

if (process.env.NODE_ENV === 'development') {
  require('preact/debug');// eslint-disable-line global-require
}

const pluginFlag = Symbol('plugin register by Logicflow.use');
type ExtensionMapValueType = { extension: Extension, props?: any, [pluginFlag]: symbol};

type GraphConfigModel = {
  nodes: _Model.BaseNodeModel[];
  edges: _Model.BaseEdgeModel[];
};

type InnerView = ClassDecorator & {
  isObervered: boolean;
};

export default class LogicFlow {
  /**
   * 只读：logicflow实例挂载的容器。
   */
  container: HTMLElement;
  /**
   * 只读：画布宽度
   */
  width: number;
  /**
   * 只读：画布高度
   */
  height: number;
  /**
   * 只读：控制整个logicflow画布的model
   */
  graphModel: GraphModel;
  /**
   * 只读：控制上一步、下一步相关
   */
  history: History;
  viewMap = new Map();
  tool: Tool;
  keyboard: Keyboard;
  dnd: Dnd;
  options: Options.Definition;
  snaplineModel: SnaplineModel;
  components: ComponentRender[] = [];
  /**
   * 个性配置的插件，覆盖全局配置的插件
   */
  plugins: Extension[];
  /**
   * 全局配置的插件，所有的LogicFlow示例都会使用
   */
  static extensions: Map<string, ExtensionMapValueType> = new Map();
  /**
   * 插件扩展方法
   * @example
   */
  extension: Record<string, any> = {};
  /**
   * 自定义数据格式转换方法
   * 当接入系统格式和logicflow格式不一直的时候，可以自定义此方法来转换数据格式
   * 详情请参考adapter
   * @see todo
   */
  adapterIn: (data: unknown) => GraphConfigData;
  /**
   * 自定义数据格式转换方法
   * 把logicflow输入的格式转换也接入系统需要的格式
   * 详情请参考adapter
   * @see todo
   */
  adapterOut: (data: GraphConfigData, ...rest: any) => unknown;
  /**
   * 支持插件在logicflow实例上增加自定义方法
   */
  [propName: string]: any;
  constructor(options: Options.Definition) {
    options = Options.get(options);
    this.options = options;
    this.container = this.initContainer(options.container);
    this.plugins = options.plugins;
    // model 初始化
    this.graphModel = new GraphModel({
      ...options,
    });
    // 附加功能初始化
    this.tool = new Tool(this);
    this.history = new History(this.graphModel.eventCenter);
    this.dnd = new Dnd({ lf: this });
    this.keyboard = new Keyboard({ lf: this, keyboard: options.keyboard });
    // 不可编辑模式没有开启，且没有关闭对齐线
    if (options.snapline !== false) {
      this.snaplineModel = new SnaplineModel(this.graphModel);
      snaplineTool(this.graphModel.eventCenter, this.snaplineModel);
    }
    if (!this.options.isSilentMode) {
      // 先初始化默认内置快捷键
      initDefaultShortcut(this, this.graphModel);
      // 然后再初始化自定义快捷键，自定义快捷键可以覆盖默认快捷键.
      // 插件最后初始化。方便插件强制覆盖内置快捷键
      this.keyboard.initShortcuts();
    }
    // init 放到最后
    this.defaultRegister();
    this.installPlugins(options.disabledPlugins);
  }
  /**
   * 注册自定义节点和边
   * 支持两种方式
   * 方式一（推荐）
   * 详情见 todo: docs link
   * @example
   * import { RectNode, RectModel } from '@logicflow/core'
   * class CustomView extends RectNode {
   * }
   * class CustomModel extends RectModel {
   * }
   * lf.register({
   *   type: 'custom',
   *   view: CustomView,
   *   model: CustomModel
   * })
   * 方式二
   * 不推荐，极个别在自定义的时候需要用到lf的情况下可以用这种方式。
   * 大多数情况下，我们可以直接在view中从this.props中获取graphModel
   * 或者model中直接this.graphModel获取model的方法。
   * @example
   * lf.register('custom', ({ RectNode, RectModel }) => {
   *    class CustomView extends RectNode {}
   *    class CustomModel extends RectModel {}
   *    return {
   *      view: CustomView,
   *      model: CustomModel
   *    }
   * })
   */
  register(type: string | RegisterConfig, fn?: RegisterElementFn, isObserverView = true) {
    // 方式1
    if (typeof type !== 'string') {
      this.registerElement(type);
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
      HtmlNode: _View.HtmlNode,
      HtmlNodeModel: _Model.HtmlNodeModel,
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
  private registerElement(config) {
    let vClass = config.view;
    if (config.isObserverView !== false && !vClass.isObervered) {
      vClass.isObervered = true;
      // @ts-ignore
      vClass = observer(vClass);
    }
    this.setView(config.type, vClass);
    this.graphModel.setModel(config.type, config.model);
  }
  /**
   * 批量注册
   * @param elements 注册的元素
   */
  batchRegister(elements = []) {
    elements.forEach((element) => {
      this.registerElement(element);
    });
  }
  private defaultRegister() {
    // register default shape
    this.registerElement({
      view: _View.RectNode,
      model: _Model.RectNodeModel,
      type: 'rect',
    });
    this.registerElement({
      type: 'circle',
      view: _View.CircleNode,
      model: _Model.CircleNodeModel,
    });
    this.registerElement({
      type: 'polygon',
      view: _View.PolygonNode,
      model: _Model.PolygonNodeModel,
    });
    this.registerElement({
      type: 'line',
      view: _View.LineEdge,
      model: _Model.LineEdgeModel,
    });
    this.registerElement({
      type: 'polyline',
      view: _View.PolylineEdge,
      model: _Model.PolylineEdgeModel,
    });
    this.registerElement({
      type: 'bezier',
      view: _View.BezierEdge,
      model: _Model.BezierEdgeModel,
    });
    this.registerElement({
      type: 'text',
      view: _View.TextNode,
      model: _Model.TextNodeModel,
    });
    this.registerElement({
      type: 'ellipse',
      view: _View.EllipseNode,
      model: _Model.EllipseNodeModel,
    });
    this.registerElement({
      type: 'diamond',
      view: _View.DiamondNode,
      model: _Model.DiamondNodeModel,
    });
    this.registerElement({
      type: 'html',
      view: _View.HtmlNode,
      model: _Model.HtmlNodeModel,
    });
  }
  /**
   * 将图形选中
   * @param id 选择元素ID
   * @param multiple 是否允许多选，如果为true，不会将上一个选中的元素重置
   * @param toFront 是否将选中的元素置顶，默认为true
   */
  selectElementById(id: string, multiple = false, toFront = true) {
    this.graphModel.selectElementById(id, multiple);
    if (!multiple && toFront) {
      this.graphModel.toFront(id);
    }
  }
  /**
   * 定位到画布视口中心
   * 支持用户传入图形当前的坐标或id，可以通过type来区分是节点还是边的id，也可以不传（兜底）
   * @param focusOnArgs.id 如果传入的是id, 则画布视口中心移动到此id的元素中心点。
   * @param focusOnArgs.coordinate 如果传入的是坐标，则画布视口中心移动到此坐标。
   */
  focusOn(focusOnArgs: FocusOnArgs): void {
    const { transformModel } = this.graphModel;
    let { coordinate } = focusOnArgs;
    const { id } = focusOnArgs;
    if (!coordinate) {
      const model = this.getNodeModelById(id);
      if (model) {
        coordinate = model.getData();
      }
      const edgeModel = this.getEdgeModelById(id);
      if (edgeModel) {
        coordinate = edgeModel.textPosition;
      }
    }
    const { x, y } = coordinate;
    transformModel.focusOn(x, y, this.graphModel.width, this.graphModel.height);
  }
  /**
   * 设置主题样式
   * @param { object } style 自定义主题样式
   * todo docs link
   */
  setTheme(style: Theme): void {
    this.graphModel.setTheme(style);
  }
  /**
   * 重新设置画布的宽高
   * 不传会自动计算画布宽高
   */
  resize(width?: number, height?: number): void {
    this.graphModel.resize(width, height);
    this.options.width = this.graphModel.width;
    this.options.height = this.graphModel.height;
  }
  /**
   * 设置默认的边类型。
   * 也就是设置在节点直接有用户手动绘制的连线类型。
   * @param type Options.EdgeType
   */
  setDefaultEdgeType(type: Options.EdgeType): void {
    this.graphModel.setDefaultEdgeType(type);
  }
  /**
   * 更新节点或边的文案
   * @param id 节点或者边id
   * @param value 文案内容
   */
  updateText(id: string, value: string) {
    this.graphModel.updateText(id, value);
  }
  /**
   * 删除元素，在不确定当前id是节点还是边时使用
   * @param id 元素id
   */
  deleteElement(id): boolean {
    const model = this.getModelById(id);
    if (!model) return false;
    const callback = {
      [ElementType.NODE]: this.deleteNode,
      [ElementType.EDGE]: this.deleteEdge,
    };

    const { BaseType } = model;
    return callback[BaseType]?.call(this, id) ?? false;
  }
  /**
   * 获取节点或边对象
   * @param id id
   */
  getModelById(id: string): _Model.BaseNodeModel | _Model.BaseEdgeModel {
    return this.graphModel.getElement(id);
  }
  /**
   * 获取节点或边的数据
   * @param id id
   */
  getDataById(id: string): NodeConfig | EdgeConfig {
    return this.graphModel.getElement(id)?.getData();
  }
  /**
   * 修改指定节点类型
   * @param id 节点id
   * @param type 节点类型
   */
  changeNodeType(id: string, type: string): void {
    this.graphModel.changeNodeType(id, type);
  }
  /**
   * 切换边的类型
   * @param id 边Id
   * @param type 边类型
   */
  changeEdgeType(id: string, type: string): void {
    this.graphModel.changeEdgeType(id, type);
  }
  /**
   * 获取节点连接的所有边的model
   * @param nodeId 节点ID
   * @returns model数组
   */
  getNodeEdges(nodeId): _Model.BaseEdgeModel[] {
    return this.graphModel.getNodeEdges(nodeId);
  }
  /**
   * 添加节点
   * @param nodeConfig 节点配置
   * @param eventType 新增节点事件类型，默认EventType.NODE_ADD
   */
  addNode(
    nodeConfig: NodeConfig, eventType: EventType = EventType.NODE_ADD, e?: MouseEvent,
  ): _Model.BaseNodeModel {
    return this.graphModel.addNode(nodeConfig, eventType, e);
  }
  /**
   * 删除节点
   * @param {string} nodeId 节点Id
   */
  deleteNode(nodeId: string): boolean {
    const Model = this.graphModel.getNodeModelById(nodeId);
    if (!Model) {
      return false;
    }
    const data = Model.getData();
    const { guards } = this.options;
    const enabledDelete = guards && guards.beforeDelete ? guards.beforeDelete(data) : true;
    if (enabledDelete) {
      this.graphModel.deleteNode(nodeId);
    }
    return enabledDelete;
  }
  /**
   * 克隆节点
   * @param nodeId 节点Id
   */
  cloneNode(nodeId: string): _Model.BaseNodeModel {
    const Model = this.graphModel.getNodeModelById(nodeId);
    const data = Model.getData();
    const { guards } = this.options;
    const enabledClone = guards && guards.beforeClone ? guards.beforeClone(data) : true;
    if (enabledClone) {
      return this.graphModel.cloneNode(nodeId);
    }
  }
  /**
   * 修改节点的id， 如果不传新的id，会内部自动创建一个。
   * @param { string } oldId 将要被修改的id
   * @param { string } newId 可选，修改后的id
   * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
   */
  changeNodeId<T extends string>(oldId: string, newId?: T): T | string {
    return this.graphModel.changeNodeId(oldId, newId);
  }
  /**
   * 获取节点对象
   * @param nodeId 节点Id
   */
  getNodeModelById(nodeId: string): _Model.BaseNodeModel {
    return this.graphModel.getNodeModelById(nodeId);
  }
  /**
   * 获取节点数据
   * @param nodeId 节点
   */
  getNodeDataById(nodeId: string): NodeConfig {
    return this.graphModel.getNodeModelById(nodeId)?.getData();
  }
  /**
   * 给两个节点之间添加一条边
   * @example
   * lf.addEdge({
   *   type: 'polygon'
   *   sourceNodeId: 'node_id_1',
   *   targetNodeId: 'node_id_2',
   * })
   * @param {object} edgeConfig
   */
  addEdge(edgeConfig: EdgeConfig): _Model.BaseEdgeModel {
    return this.graphModel.addEdge(edgeConfig);
  }
  /**
   * 删除边
   * @param {string} edgeId 边Id
   */
  deleteEdge(edgeId: string): boolean {
    const { guards } = this.options;
    const edge = this.graphModel.edgesMap[edgeId];
    if (!edge) {
      return false;
    }
    const edgeData = edge.model.getData();
    const enabledDelete = guards && guards.beforeDelete
      ? guards.beforeDelete(edgeData) : true;
    if (enabledDelete) {
      this.graphModel.deleteEdgeById(edgeId);
    }
    return enabledDelete;
  }
  /**
   * 删除指定类型的边, 基于边起点和终点，可以只传其一。
   * @param config.sourceNodeId 边的起点节点ID
   * @param config.targetNodeId 边的终点节点ID
   */
  deleteEdgeByNodeId(config: { sourceNodeId?: string, targetNodeId?: string }): void {
    const {
      sourceNodeId, targetNodeId,
    } = config;
    if (sourceNodeId && targetNodeId) {
      this.graphModel.deleteEdgeBySourceAndTarget(sourceNodeId, targetNodeId);
    } else if (sourceNodeId) {
      this.graphModel.deleteEdgeBySource(sourceNodeId);
    } else if (targetNodeId) {
      this.graphModel.deleteEdgeByTarget(targetNodeId);
    }
  }
  /**
   * 修改边的id， 如果不传新的id，会内部自动创建一个。
   * @param { string } oldId 将要被修改的id
   * @param { string } newId 可选，修改后的id
   * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
   */
  changeEdgeId<T extends string>(oldId: string, newId?: T): T | string {
    return this.graphModel.changeEdgeId(oldId, newId);
  }
  /**
   * 基于边Id获取边的model
   * @param edgeId 边的Id
   * @return model
   */
  getEdgeModelById(edgeId: string): _Model.BaseEdgeModel {
    const { edgesMap } = this.graphModel;
    return edgesMap[edgeId]?.model;
  }
  /**
   * 获取满足条件边的model
   * @param edgeFilter 过滤条件
   * @example
   * 获取所有起点为节点A的边的model
   * lf.getEdgeModels({
   *   sourceNodeId: 'nodeA_id'
   * })
   * 获取所有终点为节点B的边的model
   * lf.getEdgeModels({
   *   targetNodeId: 'nodeB_id'
   * })
   * 获取起点为节点A，终点为节点B的边
   * lf.getEdgeModels({
   *   sourceNodeId: 'nodeA_id',
   *   targetNodeId: 'nodeB_id'
   * })
   * @return model数组
   */
  getEdgeModels(edgeFilter: EdgeFilter): _Model.BaseEdgeModel[] {
    const { edges } = this.graphModel;
    const {
      sourceNodeId, targetNodeId,
    } = edgeFilter;
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
   * 基于id获取边数据
   * @param edgeId 边Id
   * @returns EdgeData
   */
  getEdgeDataById(edgeId: string): EdgeData {
    return this.getEdgeModelById(edgeId)?.getData();
  }
  /**
   * 获取所有以此节点为终点的边
   */
  getNodeIncomingEdge(nodeId) {
    return this.graphModel.getNodeIncomingEdge(nodeId);
  }
  /**
   * 获取所有以此节点为起点的边
   */
  getNodeOutgoingEdge(nodeId) {
    return this.graphModel.getNodeOutgoingEdge(nodeId);
  }
  /**
   * 获取节点连接到的所有起始节点
   */
  getNodeIncomingNode(nodeId) {
    return this.graphModel.getNodeIncomingNode(nodeId);
  }
  /**
   * 获取节点连接到的所有目标节点
   */
  getNodeOutgoingNode(nodeId) {
    return this.graphModel.getNodeOutgoingNode(nodeId);
  }
  /**
   * 显示节点、连线文本编辑框
   * @param id 元素id
   */
  editText(id: string): void {
    this.graphModel.editText(id);
  }
  /**
   * 设置元素的自定义属性
   * @see todo docs link
   * @param id 元素的id
   * @param properties 自定义属性
   */
  setProperties(id: string, properties: Object): void {
    this.graphModel.getElement(id)?.setProperties(formatData(properties));
  }
  deleteProperty(id: string, key: string): void {
    this.graphModel.getElement(id)?.deleteProperty(key);
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
   * 将某个元素放置到顶部。
   * 如果堆叠模式为默认模式，则将原置顶元素重新恢复原有层级。
   * 如果堆叠模式为递增模式，则将需指定元素zIndex设置为当前最大zIndex + 1。
   * @see todo link 堆叠模式
   * @param id 元素Id
   */
  toFront(id) {
    this.graphModel.toFront(id);
  }
  /**
   * 设置元素的zIndex.
   * 注意：默认堆叠模式下，不建议使用此方法。
   * @see todo link 堆叠模式
   * @param id 元素id
   * @param zIndex zIndex的值，可以传数字，也支持传入'top' 和 'bottom'
   */
  setElementZIndex(id: string, zIndex: number | 'top' | 'bottom') {
    return this.graphModel.setElementZIndex(id, zIndex);
  }
  /**
   * 添加多个元素, 包括边和节点。
   */
  addElements({ nodes, edges }: GraphConfigData, distance = 40): GraphConfigModel {
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
      let sourceId = edge.sourceNodeId;
      let targetId = edge.targetNodeId;
      if (nodeIdMap[sourceId]) sourceId = nodeIdMap[sourceId];
      if (nodeIdMap[targetId]) targetId = nodeIdMap[targetId];
      const edgeModel = this.graphModel.addEdge({
        ...edge,
        sourceNodeId: sourceId,
        targetNodeId: targetId,
      });
      elements.edges.push(edgeModel);
    });
    return elements;
  }
  /**
   * 获取指定区域内的所有元素，此区域必须是DOM层。
   * 例如鼠标绘制选区后，获取选区内的所有元素。
   * @see todo 分层
   * @param leftTopPoint 区域左上角坐标, dom层坐标
   * @param rightBottomPoint 区域右下角坐标，dom层坐标
   */
  getAreaElement(
    leftTopPoint: PointTuple,
    rightBottomPoint: PointTuple,
    wholeEdge = true,
    wholeNode = true,
    ignoreHideElement = false,
  ) {
    return this.graphModel.getAreaElement(
      leftTopPoint,
      rightBottomPoint,
      wholeEdge,
      wholeNode,
      ignoreHideElement,
    ).map(element => element.getData());
  }
  /**
   * 获取选中的元素数据
   * @param isIgnoreCheck 是否包括sourceNode和targetNode没有被选中的边,默认包括。
   * 注意：复制的时候不能包括此类边, 因为复制的时候不允许悬空的边。
   */
  getSelectElements(isIgnoreCheck = true): GraphConfigData {
    return this.graphModel.getSelectElements(isIgnoreCheck);
  }
  /**
   * 将所有选中的元素设置为非选中
   */
  clearSelectElements() {
    this.graphModel.clearSelectElements();
  }
  /**
   * 获取流程绘图数据
   * 注意: getGraphData返回的数据受到adapter影响，所以其数据格式不一定是logicflow内部图数据格式。
   * 如果实现通用插件，请使用getGraphRawData
   */
  getGraphData(...params: any): GraphConfigData | any {
    const data = this.graphModel.modelToGraphData();
    if (this.adapterOut) {
      return this.adapterOut(data as GraphConfigData, ...params);
    }
    return data;
  }
  /**
   * 获取流程绘图原始数据
   * 在存在adapter时，可以使用getGraphRawData获取图原始数据
   */
  getGraphRawData(): GraphConfigData {
    return this.graphModel.modelToGraphData();
  }
  /**
   * 清空画布
   */
  clearData() {
    this.graphModel.clearData();
  }
  /**
   * 更新流程图编辑相关设置
   * @param {object} config 编辑配置
   * @see todo docs link
   */
  updateEditConfig(config: EditConfigInterface) {
    this.graphModel.editConfigModel.updateEditConfig(config);
    this.graphModel.transformModel.updateTranslateLimits();
  }
  /**
   * 获取流程图当前编辑相关设置
   * @see todo docs link
   */
  getEditConfig() {
    return this.graphModel.editConfigModel.getConfig();
  }
  /**
   * 获取事件位置相对于画布左上角的坐标
   * 画布所在的位置可以是页面任何地方，原生事件返回的坐标是相对于页面左上角的，该方法可以提供以画布左上角为原点的准确位置。
   * @see todo link
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
   * 历史记录操作
   * 返回上一步
   */
  undo() {
    if (!this.history.undoAble()) return;
    // formatData兼容vue数据
    const graphData = formatData(this.history.undo());
    this.clearSelectElements();
    this.graphModel.graphDataToModel(graphData);
  }
  /**
   * 历史记录操作
   * 恢复下一步
   */
  redo() {
    if (!this.history.redoAble()) return;
    // formatData兼容vue数据
    const graphData = formatData(this.history.redo());
    this.clearSelectElements();
    this.graphModel.graphDataToModel(graphData);
  }
  /**
   * 放大缩小图形
   * @param zoomSize 放大缩小的值，支持传入0-n之间的数字。小于1表示缩小，大于1表示放大。也支持传入true和false按照内置的刻度放大缩小
   * @param point 缩放的原点
   * @returns {string} -放大缩小的比例
   */
  zoom(zoomSize?: ZoomParam, point?: PointTuple): string {
    const { transformModel } = this.graphModel;
    return transformModel.zoom(zoomSize, point);
  }
  /**
   * 重置图形的放大缩写比例为默认
   */
  resetZoom(): void {
    const { transformModel } = this.graphModel;
    transformModel.resetZoom();
  }
  /**
   * 设置图形缩小时，能缩放到的最小倍数。参数为0-1自己。默认0.2
   * @param size 图形缩小的最小值
   */
  setZoomMiniSize(size: number): void {
    const { transformModel } = this.graphModel;
    transformModel.setZoomMiniSize(size);
  }
  /**
   * 设置图形放大时，能放大到的最大倍数，默认16
   * @param size 图形放大的最大值
   */
  setZoomMaxSize(size: number): void {
    const { transformModel } = this.graphModel;
    transformModel.setZoomMaxSize(size);
  }
  /**
   * 获取缩放的值和平移的值。
   */
  getTransform() {
    const {
      transformModel: {
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
   * 平移图
   * @param x 向x轴移动距离
   * @param y 向y轴移动距离
   */
  translate(x: number, y: number): void {
    const { transformModel } = this.graphModel;
    transformModel.translate(x, y);
  }
  /**
   * 还原图形为初始位置
   */
  resetTranslate(): void {
    const { transformModel } = this.graphModel;
    const { TRANSLATE_X, TRANSLATE_Y } = transformModel;
    this.translate(-TRANSLATE_X, -TRANSLATE_Y);
  }

  /**
   * 图形画布居中显示
   */
  translateCenter(): void {
    this.graphModel.translateCenter();
  }

  /**
   * 图形适应屏幕大小
   * @param verticalOffset number 距离盒子上下的距离， 默认为20
   * @param horizontalOffset number 距离盒子左右的距离， 默认为20
   */
  fitView(verticalOffset?: number, horizontalOffset?: number): void {
    if (horizontalOffset === undefined) {
      horizontalOffset = verticalOffset; // 兼容以前的只传一个参数的情况
    }
    this.graphModel.fitView(verticalOffset, horizontalOffset);
  }
  /**
   * 开启边的动画
   * @param edgeId any
   */
  openEdgeAnimation(edgeId: any): void {
    this.graphModel.openEdgeAnimation(edgeId);
  }
  /**
   * 关闭边的动画
   * @param edgeId any
   */
  closeEdgeAnimation(edgeId: any): void {
    this.graphModel.closeEdgeAnimation(edgeId);
  }

  // 事件系统----------------------------------------------
  /**
   * 监听事件
   * 事件详情见 @see todo
   * 支持同时监听多个事件
   * @example
   * lf.on('node:click,node:contextmenu', (data) => {
   * });
   */
  on(evt: string, callback: CallbackType) {
    this.graphModel.eventCenter.on(evt, callback);
  }
  /**
   * 撤销监听事件
   */
  off(evt: string, callback: CallbackType) {
    this.graphModel.eventCenter.off(evt, callback);
  }
  /**
   * 监听事件，只监听一次
   */
  once(evt: string, callback: CallbackType) {
    this.graphModel.eventCenter.once(evt, callback);
  }
  /**
   * 触发监听事件
   */
  emit(evt: string, arg: any) {
    this.graphModel.eventCenter.emit(evt, arg);
  }

  // 插件系统----------------------------------------------

  /**
   * 添加扩展, 待讨论，这里是不是静态方法好一些？
   * 重复添加插件的时候，把上一次添加的插件的销毁。
   * @param plugin 插件
   */
  static use(extension: Extension, props?: any): void {
    let { pluginName } = extension;
    if (!pluginName) {
      console.warn(`请给插件${extension.name || extension.constructor.name}指定pluginName!`);
      pluginName = extension.name; // 兼容以前name的情况，1.0版本去掉。
    }
    const preExtension = this.extensions.get(pluginName)?.extension;
    preExtension && preExtension.destroy && preExtension.destroy();
    this.extensions.set(pluginName,
      {
        [pluginFlag]: pluginFlag,
        extension,
        props,
      });
  }
  private initContainer(container) {
    const lfContainer = document.createElement('div');
    lfContainer.style.position = 'relative';
    lfContainer.style.width = '100%';
    lfContainer.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(lfContainer);
    return lfContainer;
  }
  private installPlugins(disabledPlugins = []) {
    // 安装插件，优先使用个性插件
    const extensions = this.plugins ?? LogicFlow.extensions;
    extensions.forEach((ext: any) => {
      let extension = null;
      let props = null;
      if (ext[pluginFlag]) {
        extension = ext.extension;
        props = ext.props;
      } else {
        extension = ext;
      }
      const pluginName = extension.pluginName || extension.name;
      if (disabledPlugins.indexOf(pluginName) === -1) {
        this.installPlugin(extension, props);
      }
    });
  }
  /**
   * 加载插件-内部方法
   */
  private installPlugin(extension: Extension, props: any) {
    if (typeof extension === 'object') {
      const { install, render: renderComponent } = extension;
      install && install.call(extension, this, LogicFlow);
      renderComponent && this.components.push(renderComponent.bind(extension));
      this.extension[extension.pluginName] = extension;
      return;
    }
    const ExtensionCls = extension as ExtensionConstructor;
    const extensionInstance = new ExtensionCls({
      lf: this,
      LogicFlow,
      options: this.options.pluginsOptions,
      props,
    });
    extensionInstance.render && this.components.push(
      extensionInstance.render.bind(extensionInstance),
    );
    this.extension[ExtensionCls.pluginName] = extensionInstance;
  }
  /**
   * 修改对应元素 model 中的属性
   * 注意：此方法慎用，除非您对logicflow内部有足够的了解。
   * 大多数情况下，请使用setProperties、updateText、changeNodeId等方法。
   * 例如直接使用此方法修改节点的id,那么就是会导致连接到此节点的边的sourceNodeId出现找不到的情况。
   * @param {string} id 元素id
   * @param {object} attributes 需要更新的属性
   */
  updateAttributes(id: string, attributes: object) {
    this.graphModel.updateAttributes(id, attributes);
  }
  /**
   * 内部保留方法
   * 创建一个fakerNode，用于dnd插件拖动节点进画布的时候使用。
   */
  createFakerNode(nodeConfig) {
    const Model = this.graphModel.modelMap.get(nodeConfig.type);
    if (!Model) {
      console.warn(`不存在为${nodeConfig.type}类型的节点`);
      return;
    }
    // * initNodeData区分是否为虚拟节点
    const fakerNodeModel = new Model({ ...nodeConfig, virtual: true }, this.graphModel);
    this.graphModel.setFakerNode(fakerNodeModel);
    return fakerNodeModel;
  }
  /**
   * 内部保留方法
   * 移除fakerNode
   */
  removeFakerNode() {
    this.graphModel.removeFakerNode();
  }
  /**
   * 内部保留方法
   * 用于fakerNode显示对齐线
   */
  setNodeSnapLine(data) {
    if (this.snaplineModel) {
      this.snaplineModel.setNodeSnapLine(data);
    }
  }
  /**
   * 内部保留方法
   * 用于fakerNode移除对齐线
   */
  removeNodeSnapLine() {
    if (this.snaplineModel) {
      this.snaplineModel.clearSnapline();
    }
  }
  /**
   * 内部保留方法
   * 用于fakerNode移除对齐线
   */
  setView(type: string, component) {
    this.viewMap.set(type, component);
  }
  renderRawData(graphRawData) {
    this.graphModel.graphDataToModel(formatData(graphRawData));
    if (this.options.history !== false) {
      this.history.watch(this.graphModel);
    }
    render((
      <Graph
        getView={this.getView}
        tool={this.tool}
        options={this.options}
        dnd={this.dnd}
        snaplineModel={this.snaplineModel}
        graphModel={this.graphModel}
      />
    ), this.container);
    this.emit(EventType.GRAPH_RENDERED, this.graphModel.modelToGraphData());
  }
  /**
   * 渲染图
   * @example
   * lf.render({
   *   nodes: [
   *     {
   *       id: 'node_1',
   *       type: 'rect',
   *       x: 100,
   *       y: 100
   *     },
   *     {
   *       id: 'node_2',
   *       type: 'circle',
   *       x: 300,
   *       y: 200
   *     }
   *   ],
   *   edges: [
   *     {
   *       sourceNodeId: 'node_1',
   *       targetNodeId: 'node_2',
   *       type: 'polyline'
   *     }
   *   ]
   * })
   * @param graphData 图数据
   */
  render(graphData = {}) {
    if (this.adapterIn) {
      graphData = this.adapterIn(graphData);
    }
    this.renderRawData(graphData);
  }
  /**
   * 内部保留方法
   * 获取指定类型的view
   */
  getView = (type: string) => this.viewMap.get(type);
}
