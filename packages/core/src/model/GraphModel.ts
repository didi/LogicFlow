import { action, observable, computed } from 'mobx';
import { map } from 'lodash-es';
import BaseNodeModel from './node/BaseNodeModel';
import BaseEdgeModel from './edge/BaseEdgeModel';
import EditConfigModel from './EditConfigModel';
import TransformModel from './TransformModel';
import { IBaseModel } from './BaseModel';
import {
  ElementState, ModelType, EventType, ElementMaxzIndex, ElementType, OverlapMode,
} from '../constant/constant';
import {
  AdditionData,
  Point,
  NodeConfig,
  EdgeConfig,
  PointTuple,
  NodeMoveRule,
  GraphConfigData,
  VirtualRectSize,
} from '../type';
import { updateTheme } from '../util/theme';
import EventEmitter from '../event/eventEmitter';
import { snapToGrid, getGridOffset } from '../util/geometry';
import { isPointInArea } from '../util/graph';
import { getClosestPointOfPolyline } from '../util/edge';
import { formatData } from '../util/compatible';
import { getNodeAnchorPosition, getNodeBBox } from '../util/node';
import { createUuid } from '../util';
import { getMinIndex, getZIndex } from '../util/zIndex';
import { Theme } from '../constant/DefaultTheme';
import { Definition } from '../options';
import { AnimationConfig } from '../constant/DefaultAnimation';
import { updateAnimation } from '../util/animation';

type BaseNodeModelId = string; // 节点ID
type BaseEdgeModelId = string; // 边ID
type ElementModeId = string;
type BaseElementModel = BaseNodeModel | BaseEdgeModel;
const VisibleMoreSpace = 200;

class GraphModel {
  /**
   * LogicFlow画布挂载元素
   * 也就是初始化LogicFlow实例时传入的container
   */
  rootEl: HTMLElement;
  /**
   * LogicFlow画布宽度
   */
  @observable width: number;
  /**
   * LogicFlow画布高度
   */
  @observable height: number;
  /**
   * 主题配置
   * @see todo docs link
   */
  theme: Theme;
  /**
   * 事件中心
   * @see todo docs link
   */
  eventCenter: EventEmitter;
  /**
   * 维护所有节点和边类型对应的model
   */
  modelMap = new Map();
  /**
   * 位于当前画布顶部的元素。
   * 此元素只在堆叠模式为默认模式下存在。
   * 用于在默认模式下将之前的顶部元素恢复初始高度。
   */
  topElement: BaseNodeModel | BaseEdgeModel;
  /**
   * 控制是否开启动画
   */
  animation: AnimationConfig;
  /**
   * 自定义全局id生成器
   * @see todo docs link
   */
  idGenerator: (type?: string) => string;
  /**
   * 节点移动规则判断
   * 在节点移动的时候，会出发此数组中的所有规则判断
   */
  nodeMoveRules: NodeMoveRule[] = [];
  /**
   * 在图上操作创建边时，默认使用的边类型.
   */
  @observable edgeType: string;
  /**
   * 当前图上所有节点的model
   */
  @observable nodes: BaseNodeModel[] = [];
  /**
   * 当前图上所有边的model
   */
  @observable edges: BaseEdgeModel[] = [];
  /**
   * 元素重合时堆叠模式
   * 默认模式，节点和边被选中，会被显示在最上面。当取消选中后，元素会恢复之前的层级。
   * 递增模式，节点和边被选中，会被显示在最上面。当取消选中后，元素会保持层级。
   * @see todo link
   */
  @observable overlapMode = OverlapMode.DEFAULT;
  /**
   * 背景配置
   * @see todo link
   */
  @observable background;
  /**
   * 控制画布的缩放、平移
   * @see todo link
   */
  @observable transformModel: TransformModel;
  /**
   * 控制流程图编辑相关配置
   * @see todo link
   */
  @observable editConfigModel: EditConfigModel;
  /**
   * 网格大小
   * @see todo link
   */
  @observable gridSize = 1;
  /**
   * 局部渲染
   * @see todo logicflow性能
   */
  @observable partial = false;
  /**
   * 外部拖动节点进入画布的过程中，用fakerNode来和画布上正是的节点区分开
   */
  @observable fakerNode: BaseNodeModel;
  [key: string]: any; // 允许在groupModel上扩展属性
  constructor(options: Definition) {
    const {
      container,
      background = {},
      grid,
      idGenerator,
      animation,
    } = options;
    this.background = background;
    if (typeof grid === 'object') {
      this.gridSize = grid.size;
    }
    this.rootEl = container;
    this.editConfigModel = new EditConfigModel(options);
    this.eventCenter = new EventEmitter();
    this.transformModel = new TransformModel(this.eventCenter);
    this.theme = updateTheme(options.style);
    this.edgeType = options.edgeType || 'polyline';
    if (!options.width) {
      options.width = container.getBoundingClientRect().width;
    }
    if (!options.height) {
      options.height = container.getBoundingClientRect().height;
    }
    this.width = options.width;
    this.height = options.height;
    this.animation = updateAnimation(animation);
    this.partial = options.partial;
    this.overlapMode = options.overlapMode || 0;
    this.idGenerator = idGenerator;
  }
  @computed get nodesMap(): { [key: string]: { index: number, model: BaseNodeModel } } {
    return this.nodes.reduce((nMap, model, index) => {
      nMap[model.id] = { index, model };
      return nMap;
    }, {});
  }
  @computed get edgesMap(): { [key: string]: { index: number, model: BaseEdgeModel } } {
    return this.edges.reduce((eMap, model, index) => {
      eMap[model.id] = { index, model };
      return eMap;
    }, {});
  }
  @computed get modelsMap(): { [key: string]: BaseNodeModel | BaseEdgeModel } {
    return [...this.nodes, ...this.edges].reduce((eMap, model) => {
      eMap[model.id] = model;
      return eMap;
    }, {});
  }
  /**
   * 基于zIndex对元素进行排序。
   * todo: 性能优化
   */
  @computed get sortElements() {
    let elements: IBaseModel[] = [];
    this.nodes.forEach(node => elements.push(node));
    this.edges.forEach(edge => elements.push(edge));
    elements = elements.sort((a, b) => a.zIndex - b.zIndex);
    // 只显示可见区域的节点和边
    const showElements = [];
    let topElementIdx = -1;
    // todo: 缓存, 优化计算效率
    const visibleLt: PointTuple = [-VisibleMoreSpace, -VisibleMoreSpace];
    const visibleRb: PointTuple = [this.width + VisibleMoreSpace, this.height + VisibleMoreSpace];
    for (let i = 0; i < elements.length; i++) {
      const currentItem = elements[i];
      // 如果节点不在可见区域，且不是全元素显示模式，则隐藏节点。
      if (currentItem.visible
        && (!this.partial
          || currentItem.isSelected
          || this.isElementInArea(currentItem, visibleLt, visibleRb, false, false)
        )
      ) {
        if (currentItem.zIndex === ElementMaxzIndex) {
          topElementIdx = showElements.length;
        }
        showElements.push(currentItem);
      }
    }
    if (topElementIdx !== -1) {
      const lastElement = showElements[showElements.length - 1];
      showElements[showElements.length - 1] = showElements[topElementIdx];
      showElements[topElementIdx] = lastElement;
    }
    return showElements;
  }
  /**
   * 当前编辑的元素，低频操作，先循环找。
   */
  @computed get textEditElement() {
    const textEditNode = this.nodes.find(node => node.state === ElementState.TEXT_EDIT);
    const textEditEdge = this.edges.find(edge => edge.state === ElementState.TEXT_EDIT);
    return textEditNode || textEditEdge;
  }
  /**
   * 当前画布所有被选中的元素
   */
  @computed get selectElements() {
    const elements = new Map();
    this.nodes.forEach(node => {
      if (node.isSelected) {
        elements.set(node.id, node);
      }
    });
    this.edges.forEach(edge => {
      if (edge.isSelected) {
        elements.set(edge.id, edge);
      }
    });
    return elements;
  }
  /**
   * 获取指定区域内的所有元素
   * @param leftTopPoint 表示区域左上角的点
   * @param rightBottomPoint 表示区域右下角的点
   * @param wholeEdge 是否要整个边都在区域内部
   * @param wholeNode 是否要整个节点都在区域内部
   */
  getAreaElement(
    leftTopPoint: PointTuple,
    rightBottomPoint: PointTuple,
    wholeEdge = true,
    wholeNode = true,
  ) {
    const areaElements = [];
    const elements = [];
    this.nodes.forEach(node => elements.push(node));
    this.edges.forEach(edge => elements.push(edge));
    for (let i = 0; i < elements.length; i++) {
      const currentItem = elements[i];
      if (this.isElementInArea(currentItem, leftTopPoint, rightBottomPoint, wholeEdge, wholeNode)) {
        areaElements.push(currentItem);
      }
    }
    return areaElements;
  }
  /**
   * 获取指定类型元素对应的Model
   */
  getModel(type: string) {
    return this.modelMap.get(type);
  }
  /**
   * 基于Id获取节点的model
   */
  getNodeModelById(nodeId: BaseNodeModelId): BaseNodeModel {
    if (this.fakerNode && nodeId === this.fakerNode.id) {
      return this.fakerNode;
    }
    return this.nodesMap[nodeId]?.model;
  }
  /**
   * 因为流程图所在的位置可以是页面任何地方
   * 当内部事件需要获取触发事件时，其相对于画布左上角的位置
   * 需要事件触发位置减去画布相对于client的位置
   */
  getPointByClient({ x: x1, y: y1 }: Point) {
    const bbox = this.rootEl.getBoundingClientRect();
    const domOverlayPosition = {
      x: x1 - bbox.left,
      y: y1 - bbox.top,
    };
    const [x, y] = this.transformModel
      .HtmlPointToCanvasPoint([domOverlayPosition.x, domOverlayPosition.y]);
    return {
      domOverlayPosition,
      canvasOverlayPosition: {
        x,
        y,
      },
    };
  }

  /**
   * 判断一个元素是否在指定矩形区域内。
   * @param element 节点或者边
   * @param lt 左上角点
   * @param rb 右下角点
   * @param wholeEdge 边的起点和终点都在区域内才算
   * @param wholeNode 节点的box都在区域内才算
   */
  isElementInArea(element, lt: PointTuple, rb: PointTuple, wholeEdge = true, wholeNode = true) {
    if (element.BaseType === ElementType.NODE) {
      element = element as BaseNodeModel;
      // 节点是否在选区内，判断逻辑为如果节点的bbox的四个角上的点都在选区内，则判断节点在选区内
      const { minX, minY, maxX, maxY } = getNodeBBox(element);
      const bboxPointsList = [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY },
      ];
      let inArea = wholeNode;
      for (let i = 0; i < bboxPointsList.length; i++) {
        let { x, y } = bboxPointsList[i];
        [x, y] = this.transformModel.CanvasPointToHtmlPoint([x, y]);
        if (isPointInArea([x, y], lt, rb) !== wholeNode) {
          inArea = !wholeNode;
          break;
        }
      }
      return inArea;
    }
    if (element.BaseType === ElementType.EDGE) {
      element = element as BaseEdgeModel;
      const { startPoint, endPoint } = element;
      const startHtmlPoint = this.transformModel.CanvasPointToHtmlPoint(
        [startPoint.x, startPoint.y],
      );
      const endHtmlPoint = this.transformModel.CanvasPointToHtmlPoint([endPoint.x, endPoint.y]);
      const isStartInArea = isPointInArea(startHtmlPoint, lt, rb);
      const isEndInArea = isPointInArea(endHtmlPoint, lt, rb);
      return wholeEdge ? (isStartInArea && isEndInArea) : (isStartInArea || isEndInArea);
    }
    return false;
  }
  /**
   * 使用新的数据重新设置整个画布的元素
   * 注意：将会清除画布上所有已有的节点和边
   * @param { object } graphData 图数据
   */
  graphDataToModel(graphData: GraphConfigData) {
    this.nodes = map(graphData.nodes, node => {
      const Model = this.getModel(node.type);
      if (!Model) {
        throw new Error(`找不到${node.type}对应的节点。`);
      }
      const { x: nodeX, y: nodeY } = node;
      // 根据 grid 修正节点的 x, y
      if (nodeX && nodeY) {
        node.x = snapToGrid(nodeX, this.gridSize);
        node.y = snapToGrid(nodeY, this.gridSize);
        if (typeof node.text === 'object') {
          node.text.x -= getGridOffset(nodeX, this.gridSize);
          node.text.y -= getGridOffset(nodeY, this.gridSize);
        }
      }
      return new Model(node, this);
    });
    this.edges = map(graphData.edges, edge => {
      const Model = this.getModel(edge.type);
      if (!Model) {
        throw new Error(`找不到${edge.type}对应的边。`);
      }
      return new Model(edge, this);
    });
  }
  /**
   * 获取画布数据
   */
  modelToGraphData(): GraphConfigData {
    const edges = [];
    this.edges.forEach(edge => {
      const data = edge.getData();
      if (data) edges.push(data);
    });
    const nodes = [];
    this.nodes.forEach(node => {
      const data = node.getData();
      if (data) nodes.push(data);
    });
    return {
      nodes,
      edges,
    };
  }
  // 用户history记录的数据，忽略拖拽过程中的数据变更
  modelToHistoryData() {
    let nodeDraging = false;
    const nodes = [];
    // 如果有节点在拖拽中，不更新history
    for (let i = 0; i < this.nodes.length; i++) {
      const nodeMode = this.nodes[i];
      if (nodeMode.isDragging) {
        nodeDraging = true;
        break;
      } else {
        nodes.push(nodeMode.getHistoryData());
      }
    }
    if (nodeDraging) {
      return false;
    }
    // 如果有边在拖拽中，不更新history
    let edgeDraging = false;
    const edges = [];
    for (let j = 0; j < this.edges.length; j++) {
      const edgeMode = this.edges[j];
      if (edgeMode.isDragging) {
        edgeDraging = true;
        break;
      } else {
        edges.push(edgeMode.getHistoryData());
      }
    }
    if (edgeDraging) {
      return false;
    }
    return {
      nodes,
      edges,
    };
  }
  /**
   * 获取边的model
   */
  getEdgeModelById(edgeId: string): BaseEdgeModel | undefined {
    return this.edgesMap[edgeId]?.model;
  }
  /**
   * 获取节点或者边的model
   */
  getElement(id: string): BaseNodeModel | BaseEdgeModel | undefined {
    return this.modelsMap[id];
  }
  /**
   * 所有节点上所有边的model
   */
  getNodeEdges(nodeId): BaseEdgeModel[] {
    const edges = [];
    for (let i = 0; i < this.edges.length; i++) {
      const edgeModel = this.edges[i];
      const nodeAsSource = this.edges[i].sourceNodeId === nodeId;
      const nodeAsTarget = this.edges[i].targetNodeId === nodeId;
      if (nodeAsSource || nodeAsTarget) {
        edges.push(edgeModel);
      }
    }
    return edges;
  }

  /**
   * 获取选中的元素数据
   * @param isIgnoreCheck 是否包括sourceNode和targetNode没有被选中的边,默认包括。
   * 复制的时候不能包括此类边, 因为复制的时候不允许悬空的边
   */
  getSelectElements(isIgnoreCheck = true): GraphConfigData {
    const elements = this.selectElements;
    const graphData = {
      nodes: [],
      edges: [],
    };
    elements.forEach((element) => {
      if (element.BaseType === ElementType.NODE) {
        graphData.nodes.push(element.getData());
      }
      if (element.BaseType === ElementType.EDGE) {
        const edgeData = element.getData();
        const isNodeSelected = elements.get(edgeData.sourceNodeId)
          && elements.get(edgeData.targetNodeId);

        if (isIgnoreCheck || isNodeSelected) {
          graphData.edges.push(edgeData);
        }
      }
    });
    return graphData;
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
    const element = this.getElement(id);
    element.updateAttributes(attributes);
  }
  /**
   * 修改节点的id， 如果不传新的id，会内部自动创建一个。
   * @param { string } oldId 将要被修改的id
   * @param { string } newId 可选，修改后的id
   * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
   */
  changeNodeId<T extends string>(oldId, newId?: T | string): T | string {
    if (!newId) {
      newId = createUuid();
    }
    if (this.nodesMap[newId]) {
      console.warn(`当前流程图已存在节点${newId}, 修改失败`);
      return '';
    }
    if (!this.nodesMap[oldId]) {
      console.warn(`当前流程图找不到节点${newId}, 修改失败`);
      return '';
    }
    this.edges.forEach((edge) => {
      if (edge.sourceNodeId === oldId) {
        edge.sourceNodeId = newId;
      }
      if (edge.targetNodeId === oldId) {
        edge.targetNodeId = newId;
      }
    });
    this.nodesMap[oldId].model.id = newId;
    return newId;
  }
  /**
   * 修改边的id， 如果不传新的id，会内部自动创建一个。
   * @param { string } oldId 将要被修改的id
   * @param { string } newId 可选，修改后的id
   * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
   */
  changeEdgeId<T extends string>(oldId: string, newId?: string): T | string {
    if (!newId) {
      newId = createUuid();
    }
    if (this.edgesMap[newId]) {
      console.warn(`当前流程图已存在边: ${newId}, 修改失败`);
      return '';
    }
    if (!this.edgesMap[oldId]) {
      console.warn(`当前流程图找不到边: ${newId}, 修改失败`);
      return '';
    }
    this.edges.forEach((edge) => {
      if (edge.id === oldId) {
        edge.id = newId;
      }
    });
    return newId;
  }
  /**
   * 内部保留方法，请勿直接使用
   */
  @action
  setFakerNode(nodeModel: BaseNodeModel) {
    this.fakerNode = nodeModel;
  }
  /**
   * 内部保留方法，请勿直接使用
   */
  @action
  removeFakerNode() {
    this.fakerNode = null;
  }
  /**
   * 设置指定类型的Model,请勿直接使用
   */
  @action
  setModel(type: string, ModelClass) {
    return this.modelMap.set(type, ModelClass);
  }
  /**
   * 将某个元素放置到顶部。
   * 如果堆叠模式为默认模式，则将原置顶元素重新恢复原有层级。
   * 如果堆叠模式为递增模式，则将需指定元素zIndex设置为当前最大zIndex + 1。
   * @see todo link 堆叠模式
   * @param id 元素Id
   */
  @action
  toFront(id) {
    const element = this.nodesMap[id]?.model || this.edgesMap[id]?.model;
    if (element) {
      if (this.overlapMode === OverlapMode.DEFAULT) {
        this.topElement?.setZIndex();
        element.setZIndex(ElementMaxzIndex);
        this.topElement = element;
      }
      if (this.overlapMode === OverlapMode.INCREASE) {
        this.setElementZIndex(id, 'top');
      }
    }
  }
  /**
   * 设置元素的zIndex.
   * 注意：默认堆叠模式下，不建议使用此方法。
   * @see todo link 堆叠模式
   * @param id 元素id
   * @param zIndex zIndex的值，可以传数字，也支持传入'top' 和 'bottom'
   */
  @action
  setElementZIndex(id: string, zIndex: number | 'top' | 'bottom') {
    const element = this.nodesMap[id]?.model || this.edgesMap[id]?.model;
    if (element) {
      let index;
      if (typeof zIndex === 'number') {
        index = zIndex;
      }
      if (zIndex === 'top') {
        index = getZIndex();
      }
      if (zIndex === 'bottom') {
        index = getMinIndex();
      }
      element.setZIndex(index);
    }
  }
  /**
   * 删除节点
   * @param {string} nodeId 节点Id
   */
  @action
  deleteNode(id) {
    const nodeData = this.nodesMap[id].model.getData();
    this.deleteEdgeBySource(id);
    this.deleteEdgeByTarget(id);
    this.nodes.splice(this.nodesMap[id].index, 1);
    this.eventCenter.emit(EventType.NODE_DELETE, { data: nodeData });
  }
  /**
   * 添加节点
   * @param nodeConfig 节点配置
   */
  @action
  addNode(nodeConfig: NodeConfig) {
    const nodeOriginData = formatData(nodeConfig);
    // 添加节点的时候，如果这个节点Id已经存在，则采用新的id
    if (nodeOriginData.id && this.nodesMap[nodeConfig.id]) {
      delete nodeOriginData.id;
    }
    const Model = this.getModel(nodeOriginData.type);
    if (!Model) {
      throw new Error(`找不到${nodeOriginData.type}对应的节点，请确认是否已注册此类型节点。`);
    }
    // TODO 元素的 model 不应该直接可以操作 graphModel 的属性，但可以调方法
    const nodeModel = new Model(nodeOriginData, this);
    this.nodes.push(nodeModel);
    const nodeData = nodeModel.getData();
    this.eventCenter.emit(EventType.NODE_ADD, { data: nodeData });
    return nodeModel;
  }

  /**
  * 克隆节点
  * @param nodeId 节点Id
  */
  @action
  cloneNode(nodeId: string): BaseNodeModel {
    const Model = this.getNodeModelById(nodeId);
    const data = Model.getData();
    data.x += 30;
    data.y += 30;
    delete data.id;
    if (data.text) {
      data.text.x += 30;
      data.text.y += 30;
    }
    const nodeModel = this.addNode(data);
    nodeModel.setSelected(true);
    Model.setSelected(false);
    return nodeModel.getData();
  }
  /**
   * 移动节点-相对位置
   * @param nodeModel 节点Id
   * @param deltaX X轴移动距离
   * @param deltaY Y轴移动距离
   * @param isignoreRule 是否忽略移动规则限制
   */
  @action
  moveNode(nodeId: BaseNodeModelId, deltaX: number, deltaY: number, isignoreRule = false) {
    // 1) 移动节点
    const node = this.nodesMap[nodeId];
    if (!node) {
      console.warn(`不存在id为${nodeId}的节点`);
      return;
    }
    const nodeModel = node.model;
    const r = nodeModel.move(deltaX, deltaY, isignoreRule);
    // 2) 移动边
    r && this.moveEdge(nodeId, deltaX, deltaY);
  }

  /**
   * 移动节点-绝对位置
   * @param nodeModel 节点Id
   * @param x X轴目标位置
   * @param y Y轴目标位置
   */
  @action
  moveNode2Coordinate(nodeId: BaseNodeModelId, x: number, y: number, isignoreRule = false) {
    // 1) 移动节点
    const node = this.nodesMap[nodeId];
    if (!node) {
      console.warn(`不存在id为${nodeId}的节点`);
      return;
    }
    const nodeModel = node.model;
    const {
      x: originX,
      y: originY,
    } = nodeModel;
    const deltaX = x - originX;
    const deltaY = y - originY;
    this.moveNode(nodeId, deltaX, deltaY, isignoreRule);
  }
  /**
   * 显示节点、连线文本编辑框
   * @param elementId 节点id
   */
  @action
  editText(id: ElementModeId) {
    this.setElementStateById(id, ElementState.TEXT_EDIT);
  }
  /**
   * 给两个节点之间添加一条边
   * @param {object} edgeConfig
   */
  @action
  addEdge(edgeConfig: EdgeConfig): BaseEdgeModel {
    const edgeOriginData = formatData(edgeConfig);
    // 边的类型优先级：自定义>全局>默认
    let { type } = edgeOriginData;
    if (!type) {
      type = this.edgeType;
    }
    if (edgeOriginData.id && this.edgesMap[edgeOriginData.id]) {
      delete edgeOriginData.id;
    }
    const Model = this.getModel(type);
    if (!Model) {
      throw new Error(`找不到${type}对应的边，请确认是否已注册此类型边。`);
    }
    const edgeModel = new Model({ ...edgeOriginData, type }, this);
    const edgeData = edgeModel.getData();
    this.edges.push(edgeModel);
    this.eventCenter.emit(EventType.EDGE_ADD, { data: edgeData });
    return edgeModel;
  }
  /**
   * 移动边，内部方法，请勿直接使用
   */
  @action
  moveEdge(nodeId: BaseNodeModelId, deltaX: number, deltaY: number) {
    /* 更新相关边位置 */
    for (let i = 0; i < this.edges.length; i++) {
      const edgeModel = this.edges[i];
      const { x, y } = edgeModel.textPosition;
      const nodeAsSource = this.edges[i].sourceNodeId === nodeId;
      const nodeAsTarget = this.edges[i].targetNodeId === nodeId;
      if (nodeAsSource) {
        // edgeModel.updateStartPoint({
        //   x: edgeModel.startPoint.x + deltaX,
        //   y: edgeModel.startPoint.y + deltaY,
        // });
        edgeModel.moveStartPoint(deltaX, deltaY);
      }
      if (nodeAsTarget) {
        // edgeModel.updateEndPoint({
        //   x: edgeModel.endPoint.x + deltaX,
        //   y: edgeModel.endPoint.y + deltaY,
        // });
        edgeModel.moveEndPoint(deltaX, deltaY);
      }
      // 如果有文案了，当节点移动引起文案位置修改时，找出当前文案位置与最新边距离最短距离的点
      // 最大程度保持节点位置不变且在边上
      if (nodeAsSource || nodeAsTarget) {
        // todo: 找到更好的边位置移动处理方式
        // 如果是自定义边文本位置，则移动节点的时候重新计算其位置
        if (edgeModel.customTextPosition === true) {
          edgeModel.resetTextPosition();
        } else if (edgeModel.modelType === ModelType.POLYLINE_EDGE && edgeModel.text?.value) {
          const textPosition = edgeModel.text;
          const newPoint = getClosestPointOfPolyline(textPosition, edgeModel.points);
          edgeModel.moveText(newPoint.x - textPosition.x, newPoint.y - textPosition.y);
        } else {
          const { x: x1, y: y1 } = edgeModel.textPosition;
          edgeModel.moveText(x1 - x, y1 - y);
        }
      }
    }
  }
  /**
   * 删除两节点之间的边
   * @param sourceNodeId 边的起始节点
   * @param targetNodeId 边的目的节点
   */
  @action
  deleteEdgeBySourceAndTarget(sourceNodeId, targetNodeId) {
    for (let i = 0; i < this.edges.length; i++) {
      if (this.edges[i].sourceNodeId === sourceNodeId
          && this.edges[i].targetNodeId === targetNodeId
      ) {
        const edgeData = this.edges[i].getData();
        this.edges.splice(i, 1);
        i--;
        this.eventCenter.emit(EventType.EDGE_DELETE, { data: edgeData });
      }
    }
  }
  /**
   * 基于边Id删除边
   */
  @action
  deleteEdgeById(id) {
    const edge = this.edgesMap[id];
    if (!edge) {
      return;
    }
    const idx = this.edgesMap[id].index;
    const edgeData = this.edgesMap[id].model.getData();
    this.edges.splice(idx, 1);
    this.eventCenter.emit(EventType.EDGE_DELETE, { data: edgeData });
  }
  /**
   * 删除以节点Id为起点的所有边
   */
  @action
  deleteEdgeBySource(sourceNodeId) {
    for (let i = 0; i < this.edges.length; i++) {
      if (this.edges[i].sourceNodeId === sourceNodeId) {
        const edgeData = this.edges[i].getData();
        this.edges.splice(i, 1);
        i--;
        this.eventCenter.emit(EventType.EDGE_DELETE, { data: edgeData });
      }
    }
  }
  /**
   * 删除以节点Id为终点的所有边
   */
  @action
  deleteEdgeByTarget(targetNodeId) {
    for (let i = 0; i < this.edges.length; i++) {
      if (this.edges[i].targetNodeId === targetNodeId) {
        const edgeData = this.edges[i].getData();
        this.edges.splice(i, 1);
        i--;
        this.eventCenter.emit(EventType.EDGE_DELETE, { data: edgeData });
      }
    }
  }
  /**
   * 设置元素的状态，在需要保证整个画布上所有的元素只有一个元素拥有此状态时可以调用此方法。
   * 例如文本编辑、菜单显示等。
   * additionStateData: 传递的额外值，如菜单显示的时候，需要传递期望菜单显示的位置。
   */
  @action
  setElementStateById(id: ElementModeId, state: number, additionStateData?: AdditionData) {
    this.nodes.forEach((node) => {
      if (node.id === id) {
        node.setElementState(state, additionStateData);
      } else {
        node.setElementState(ElementState.DEFAULT);
      }
    });
    this.edges.forEach((edge) => {
      if (edge.id === id) {
        edge.setElementState(state, additionStateData);
      } else {
        edge.setElementState(ElementState.DEFAULT);
      }
    });
  }
  /**
   * 更新节点或边的文案
   * @param id 节点或者边id
   * @param value 文案内容
   */
  @action
  updateText(id: ElementModeId, value: string) {
    this.nodes.forEach((node) => {
      if (node.id === id) {
        node.updateText(value);
      }
    });
    this.edges.forEach((edge) => {
      if (edge.id === id) {
        edge.updateText(value);
      }
    });
  }

  /**
   * 选中节点
   * @param id 节点Id
   * @param multiple 是否为多选，如果为多选，则不去掉原有已选择节点的选中状态
   */
  @action selectNodeById(id: string, multiple = false) {
    if (!multiple) {
      this.clearSelectElements();
    }
    const selectElement = this.nodesMap[id]?.model;
    selectElement?.setSelected(true);
  }
  /**
   * 选中边
   * @param id 边Id
   * @param multiple 是否为多选，如果为多选，则不去掉原已选中边的状态
   */
  @action selectEdgeById(id: string, multiple = false) {
    if (!multiple) {
      this.clearSelectElements();
    }
    const selectElement = this.edgesMap[id]?.model;
    selectElement?.setSelected(true);
  }
  /**
   * 将图形选中
   * @param id 选择元素ID
   * @param multiple 是否允许多选，如果为true，不会将上一个选中的元素重置
   */
  @action
  selectElementById(id: string, multiple = false) {
    if (!multiple) {
      this.clearSelectElements();
    }
    const selectElement = this.getElement(id) as BaseNodeModel | BaseEdgeModel;
    selectElement?.setSelected(true);
  }
  /**
   * 将所有选中的元素设置为非选中
   */
  @action
  clearSelectElements() {
    this.selectElements.forEach(element => {
      element?.setSelected(false);
    });
    this.selectElements.clear();
    /**
     * 如果堆叠模式为默认模式，则将置顶元素重新恢复原有层级
     */
    if (this.overlapMode === OverlapMode.DEFAULT) {
      this.topElement?.setZIndex();
    }
  }
  /**
   * 批量移动节点，节点移动的时候，会动态计算所有节点与未移动节点的边位置
   * 移动的节点之间的边会保持相对位置
   */
  @action
  moveNodes(nodeIds: string[], deltaX: number, deltaY: number, isignoreRule = false) {
    nodeIds.forEach(nodeId => this.moveNode(nodeId, deltaX, deltaY, isignoreRule));
  }
  /**
   * 添加节点移动限制规则，在节点移动的时候触发。
   * 如果方法返回false, 则会阻止节点移动。
   * @param fn function
   * @example
   *
   * graphModel.addNodeMoveRules((nodeModel, x, y) => {
   *   if (nodeModel.properties.disabled) {
   *     return false
   *   }
   *   return true
   * })
   *
   */
  addNodeMoveRules(fn: NodeMoveRule) {
    if (!this.nodeMoveRules.includes(fn)) {
      this.nodeMoveRules.push(fn);
    }
  }
  /**
   * 设置默认的边类型
   * 也就是设置在节点直接有用户手动绘制的连线类型。
   * @param type Options.EdgeType
   */
  @action
  setDefaultEdgeType(type: string): void {
    this.edgeType = type;
  }
  /**
  * 修改指定节点类型
  * @param id 节点id
  * @param type 节点类型
  */
  @action
  changeNodeType(id, type: string): void {
    const nodeModel = this.getNodeModelById(id);
    if (!nodeModel) {
      console.warn(`找不到id为${id}的节点`);
      return;
    }
    const data = nodeModel.getData();
    data.type = type;
    const Model = this.getModel(type);
    if (!Model) {
      throw new Error(`找不到${type}对应的节点，请确认是否已注册此类型节点。`);
    }
    const newNodeModel = new Model(data, this);
    this.nodes.splice(this.nodesMap[id].index, 1, newNodeModel);
    // 微调边
    const edgeModels = this.getNodeEdges(id);
    edgeModels.forEach(edge => {
      if (edge.sourceNodeId === id) {
        const point = getNodeAnchorPosition(
          newNodeModel,
          edge.startPoint,
          newNodeModel.width,
          newNodeModel.height,
        );
        edge.updateStartPoint(point);
      }
      if (edge.targetNodeId === id) {
        const point = getNodeAnchorPosition(
          newNodeModel,
          edge.endPoint,
          newNodeModel.width,
          newNodeModel.height,
        );
        edge.updateEndPoint(point);
      }
    });
  }
  /**
   * 切换边的类型
   * @param id 边Id
   * @param type 边类型
   */
  @action changeEdgeType(id, type) {
    const edgeModel = this.getEdgeModelById(id);
    if (!edgeModel) {
      console.warn(`找不到id为${id}的边`);
      return;
    }
    if (edgeModel.type === type) {
      return;
    }
    const data = edgeModel.getData();
    data.type = type;
    const Model = this.getModel(type);
    if (!Model) {
      throw new Error(`找不到${type}对应的节点，请确认是否已注册此类型节点。`);
    }
    // 为了保持切换类型时不复用上一个类型的轨迹
    delete data.pointsList;
    const newEdgeModel = new Model(data, this);
    this.edges.splice(this.edgesMap[id].index, 1, newEdgeModel);
  }
  /**
   * 获取所有以此节点为终点的边
   */
  @action getNodeIncomingEdge(nodeId) {
    const edges = [];
    this.edges.forEach(edge => {
      if (edge.targetNodeId === nodeId) {
        edges.push(edge);
      }
    });
    return edges;
  }
  /**
   * 获取所有以此节点为起点的边
   */
  @action getNodeOutgoingEdge(nodeId) {
    const edges = [];
    this.edges.forEach(edge => {
      if (edge.sourceNodeId === nodeId) {
        edges.push(edge);
      }
    });
    return edges;
  }
  /**
   * 获取节点连接到的所有起始节点
   */
  @action getNodeIncomingNode(nodeId) {
    const nodes = [];
    this.edges.forEach(edge => {
      if (edge.targetNodeId === nodeId) {
        nodes.push(this.nodesMap[edge.sourceNodeId].model);
      }
    });
    return nodes;
  }
  /**
   * 获取节点连接到的所有目标节点
   */
  @action getNodeOutgoingNode(nodeId) {
    const nodes = [];
    this.edges.forEach(edge => {
      if (edge.sourceNodeId === nodeId) {
        nodes.push(this.nodesMap[edge.targetNodeId].model);
      }
    });
    return nodes;
  }
  /**
   * 设置主题
   * todo docs link
   */
  @action setTheme(style: Theme) {
    this.theme = updateTheme({ ...this.theme, ...style });
  }
  /**
   * 重新设置画布的宽高
   */
  @action resize(width: number, height: number): void {
    this.width = width ?? this.width;
    this.height = height ?? this.height;
  }
  /**
   * 清空画布
   */
  @action clearData(): void {
    this.nodes = [];
    this.edges = [];
  }

  /**
   * 获取图形区域虚拟矩型的尺寸和中心坐标
   * @returns
   */
  getVirtualRectSize(): VirtualRectSize {
    const { nodes } = this;
    let nodesX = [];
    let nodesY = [];
    // 获取所有节点组成的x，y轴最大最小值，这里考虑了图形的长宽和边框
    nodes.forEach((node) => {
      const { x, y, width, height } = node;
      const { strokeWidth = 0 } = node.getNodeStyle();
      nodesX = nodesX.concat([x + width / 2 + strokeWidth, x - width / 2 - strokeWidth]);
      nodesY = nodesY.concat([y + height / 2 + strokeWidth, y - height / 2 - strokeWidth]);
    });

    const minX = Math.min(...nodesX);
    const maxX = Math.max(...nodesX);
    const minY = Math.min(...nodesY);
    const maxY = Math.max(...nodesY);

    const virtualRectWidth = (maxX - minX) || 0;
    const virtualRectHeight = (maxY - minY) || 0;

    // 获取虚拟矩型的中心坐标
    const virtualRectCenterPositionX = minX + virtualRectWidth / 2;
    const virtualRectCenterPositionY = minY + virtualRectHeight / 2;

    return {
      virtualRectWidth,
      virtualRectHeight,
      virtualRectCenterPositionX,
      virtualRectCenterPositionY,
    };
  }
  /**
   * 将图形整体移动到画布中心
   */
  @action translateCenter(): void {
    const { nodes, width, height, rootEl, transformModel } = this;
    if (!nodes.length) { return; }

    const containerWidth = width || rootEl.clientWidth;
    const containerHeight = height || rootEl.clientHeight;

    const {
      virtualRectCenterPositionX,
      virtualRectCenterPositionY,
    } = this.getVirtualRectSize();

    // 将虚拟矩型移动到画布中心
    transformModel.focusOn(
      virtualRectCenterPositionX,
      virtualRectCenterPositionY,
      containerWidth,
      containerHeight,
    );
  }

  /**
   * 画布图形适应屏幕大小
   * @param offset number 距离盒子四周的距离， 默认为20
   */
  @action fitView(offset = 20): void {
    const { nodes, width, height, rootEl, transformModel } = this;
    if (!nodes.length) { return; }
    const containerWidth = width || rootEl.clientWidth;
    const containerHeight = height || rootEl.clientHeight;

    const {
      virtualRectWidth,
      virtualRectHeight,
      virtualRectCenterPositionX,
      virtualRectCenterPositionY,
    } = this.getVirtualRectSize();

    const zoomRatioX = (virtualRectWidth + offset) / containerWidth;
    const zoomRatioY = (virtualRectHeight + offset) / containerHeight;

    let zoomRatio = 0;
    zoomRatio = 1 / Math.max(zoomRatioX, zoomRatioY);

    const point: PointTuple = [containerWidth / 2, containerHeight / 2];
    // 适应画布大小
    transformModel.zoom(zoomRatio, point);
    // 将虚拟矩型移动到画布中心
    transformModel.focusOn(
      virtualRectCenterPositionX,
      virtualRectCenterPositionY,
      containerWidth,
      containerHeight,
    );
  }
}

export { GraphModel };
export default GraphModel;
