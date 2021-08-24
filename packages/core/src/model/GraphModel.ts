import { action, observable, computed } from 'mobx';
import { map } from 'lodash-es';
import BaseNodeModel from './node/BaseNodeModel';
import BaseEdgeModel from './edge/BaseEdgeModel';
import EditConfigModel from './EditConfigModel';
import TransfromModel from './TransformModel';
import { IBaseModel } from './BaseModel';
import {
  ElementState, ModelType, EventType, ElementMaxzIndex, ElementType,
} from '../constant/constant';
import {
  AdditionData, Point, NodeConfig, EdgeConfig, Style, PointTuple, NodeMoveRule,
} from '../type';
import { updateTheme } from '../util/theme';
import EventEmitter from '../event/eventEmitter';
import { snapToGrid, getGridOffset } from '../util/geometry';
import { isPointInArea } from '../util/graph';
import { getClosestPointOfPolyline } from '../util/edge';
import { formatData } from '../util/compatible';
import { getNodeAnchorPosition, getNodeBBox } from '../util/node';

type BaseNodeModelId = string; // 节点ID
type BaseEdgeModelId = string; // 连线ID
type ElementModeId = string;
type BaseElementModel = BaseNodeModel | BaseEdgeModel;
const VisibleMoreSpace = 200;

class GraphModel {
  readonly BaseType = ElementType.GRAPH;
  modelType = ModelType.GRAPH;
  rootEl: HTMLElement;
  theme;
  eventCenter: EventEmitter;
  modelMap = new Map();
  width: number;
  height: number;
  topElement: BaseNodeModel | BaseEdgeModel; // 当前位于顶部的元素
  selectElement: BaseNodeModel | BaseEdgeModel; // 当前位于顶部的元素
  idGenerator: () => number | string;
  nodeMoveRules: NodeMoveRule[] = [];
  @observable edgeType: string;
  @observable nodes: BaseNodeModel[] = [];
  @observable activeElement: IBaseModel;
  @observable activeElementState: ElementState;
  @observable state: ElementState;
  @observable additionStateData: AdditionData;
  @observable edges: BaseEdgeModel[] = [];
  @observable isSlient = false;
  @observable plugins = [];
  @observable tools = [];
  @observable background;
  @observable transformMatrix = new TransfromModel();
  @observable editConfig: EditConfigModel;
  @observable gridSize = 1;
  @observable partial = false; // 是否开启局部渲染
  @observable fakerNode: BaseNodeModel;
  constructor(config) {
    const {
      container,
      background = {},
      grid: { size = 1 } = {},
      isSilentMode = false,
      eventCenter,
      idGenerator,
    } = config;
    this.background = background;
    this.isSlient = isSilentMode;
    this.gridSize = size;
    this.rootEl = container;
    this.editConfig = new EditConfigModel(config);
    this.eventCenter = eventCenter;
    this.theme = updateTheme(config.style);
    this.edgeType = config.edgeType || 'polyline';
    this.width = config.width;
    this.height = config.height;
    this.partial = config.partial;
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
  // fixme: 用户点击触发两次sortElements
  @computed get sortElements() {
    let elements = [];
    // IE BUG: mobx observer对象使用解构会导致IE11出现问题
    this.nodes.forEach(node => elements.push(node));
    this.edges.forEach(edge => elements.push(edge));
    elements = elements.sort((a, b) => a.zIndex - b.zIndex);
    // 只显示可见区域的节点和连线以及和这个可以区域节点的节点
    const showElements = [];
    let topElementIdx = -1;
    // todo: 缓存, 优化计算效率
    const visibleLt: PointTuple = [-VisibleMoreSpace, -VisibleMoreSpace];
    const visibleRb: PointTuple = [this.width + VisibleMoreSpace, this.height + VisibleMoreSpace];
    for (let i = 0; i < elements.length; i++) {
      const currentItem = elements[i];
      // 如果节点不在可见区域，且不是全元素显示模式，则隐藏节点。
      if (!this.partial || this.isElementInArea(currentItem, visibleLt, visibleRb, false)) {
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
   * 当前编辑的元素，低频操作，先循环找吧。
   */
  @computed get textEditElement() {
    const textEditNode = this.nodes.find(node => node.state === ElementState.TEXT_EDIT);
    const textEditEdge = this.edges.find(edge => edge.state === ElementState.TEXT_EDIT);
    return textEditNode || textEditEdge;
  }
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
   */
  getAreaElement(leftTopPoint, rightBottomPoint) {
    const areaElements = [];
    const elements = [];
    // IE BUG: mobx observer对象使用解构会导致IE11出现问题
    this.nodes.forEach(node => elements.push(node));
    this.edges.forEach(edge => elements.push(edge));
    for (let i = 0; i < elements.length; i++) {
      const currentItem = elements[i];
      if (this.isElementInArea(currentItem, leftTopPoint, rightBottomPoint)) {
        areaElements.push(currentItem);
      }
    }
    return areaElements;
  }

  getModel(type: string) {
    return this.modelMap.get(type);
  }

  getNodeModel(nodeId: BaseNodeModelId): BaseNodeModel {
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
    const [x, y] = this.transformMatrix
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
   * @param element 节点或者连线
   * @param lt 左上角点
   * @param rb 右下角点
   */
  isElementInArea(element, lt, rb, wholeEdge = true) {
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
      let inArea = true;
      for (let i = 0; i < bboxPointsList.length; i++) {
        let { x, y } = bboxPointsList[i];
        [x, y] = this.transformMatrix.CanvasPointToHtmlPoint([x, y]);
        if (!isPointInArea([x, y], lt, rb)) {
          inArea = false;
          break;
        }
      }
      return inArea;
    }
    if (element.BaseType === ElementType.EDGE) {
      element = element as BaseEdgeModel;
      const { startPoint, endPoint } = element;
      const startHtmlPoint = this.transformMatrix.CanvasPointToHtmlPoint(
        [startPoint.x, startPoint.y],
      );
      const endHtmlPoint = this.transformMatrix.CanvasPointToHtmlPoint([endPoint.x, endPoint.y]);
      const isStartInArea = isPointInArea(startHtmlPoint, lt, rb);
      const isEndInArea = isPointInArea(endHtmlPoint, lt, rb);
      return wholeEdge ? (isStartInArea && isEndInArea) : (isStartInArea || isEndInArea);
    }
    return false;
  }
  graphDataToModel(graphData) {
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
        if (Object.prototype.toString.call(node.text) === '[object Object]') {
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

  modelToGraphData() {
    const edges = this.edges.map(edge => edge.getData());
    const nodes = this.nodes.map(node => node.getData());
    return {
      nodes,
      edges,
    };
  }

  getEdgeModel(edgeId: string) {
    return this.edgesMap[edgeId]?.model;
  }

  getElement(id: string): IBaseModel | undefined {
    const nodeModel = this.getNodeModel(id);
    if (nodeModel) {
      return nodeModel;
    }
    const edgeModel = this.getEdgeModel(id);
    return edgeModel;
  }

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
   * @param isIgnoreCheck 是否包括sourceNode和targetNode没有被选中的连线,默认包括。
   * 复制的时候不能包括此类连线, 因为复制的时候不允许悬空的连线
   */
  getSelectElements(isIgnoreCheck = true) {
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

  updateAttributes(id: string, attributes: object) {
    const element = this.getElement(id);
    element.updateAttributes(attributes);
  }

  @action
  setFakerNode(nodeModel: BaseNodeModel) {
    this.fakerNode = nodeModel;
  }

  @action
  removeFakerNode() {
    this.fakerNode = null;
  }

  @action
  setModel(type: string, ModelClass) {
    return this.modelMap.set(type, ModelClass);
  }

  @action updateEdgeByIndex(index, data) {
    this.edges[index] = { ...this.edges[index], ...data };
  }

  @action
  toFront(id) {
    const element = this.nodesMap[id]?.model || this.edgesMap[id]?.model;
    if (element) {
      this.topElement?.setZIndex();
      this.topElement = element;
      element.setZIndex(ElementMaxzIndex);
    }
  }

  @action
  deleteNode(id) {
    const nodeData = this.nodesMap[id].model.getData();
    this.removeEdgeBySource(id);
    this.removeEdgeByTarget(id);
    this.nodes.splice(this.nodesMap[id].index, 1);
    this.eventCenter.emit(EventType.NODE_DELETE, { data: nodeData });
  }

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
    const Model = this.getNodeModel(nodeId);
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
    nodeModel.move(deltaX, deltaY, isignoreRule);
    // 2) 移动连线
    this.moveEdge(nodeId, deltaX, deltaY);
  }

  /**
   * 移动节点-绝对位置
   * @param nodeModel 节点Id
   * @param x X轴目标位置
   * @param y Y轴目标位置
   */
  @action
  moveNode2Coordinate(nodeId: BaseNodeModelId, x: number, y: number) {
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
    this.moveNode(nodeId, deltaX, deltaY);
  }

  @action
  setTextEditable(id: ElementModeId) {
    this.setElementStateById(id, ElementState.TEXT_EDIT);
  }

  @action
  createEdge(edgeConfig: EdgeConfig): EdgeConfig {
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
      throw new Error(`找不到${type}对应的连线，请确认是否已注册此类型连线。`);
    }
    const edgeModel = new Model({ ...edgeOriginData, type }, this);
    const edgeData = edgeModel.getData();
    this.edges.push(edgeModel);
    this.eventCenter.emit(EventType.EDGE_ADD, { data: edgeData });
    return edgeModel;
  }

  @action
  moveEdge(nodeId: BaseNodeModelId, deltaX: number, deltaY: number) {
    /* 更新相关连线位置 */
    for (let i = 0; i < this.edges.length; i++) {
      const edgeModel = this.edges[i];
      const { x, y } = edgeModel.textPosition;
      const nodeAsSource = this.edges[i].sourceNodeId === nodeId;
      const nodeAsTarget = this.edges[i].targetNodeId === nodeId;
      if (nodeAsSource) {
        edgeModel.updateStartPoint({
          x: edgeModel.startPoint.x + deltaX,
          y: edgeModel.startPoint.y + deltaY,
        });
      }
      if (nodeAsTarget) {
        edgeModel.updateEndPoint({
          x: edgeModel.endPoint.x + deltaX,
          y: edgeModel.endPoint.y + deltaY,
        });
      }
      // 如果有文案了，当节点移动引起文案位置修改时，找出当前文案位置与最新连线距离最短距离的点
      // 最大程度保持节点位置不变且在连线上
      if (nodeAsSource || nodeAsTarget) {
        // todo: 找到更好的连线位置移动处理方式
        // 如果是自定义连线文本位置，则移动节点的时候重新计算其位置
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
  @action
  removeEdge(sourceNodeId, targetNodeId) {
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

  @action
  removeEdgeById(id) {
    const idx = this.edgesMap[id].index;
    const edge = this.edgesMap[id];
    if (!edge) {
      console.warn(`不存在id为${id}的边`);
      return;
    }
    const edgeData = this.edgesMap[id].model.getData();
    this.edges.splice(idx, 1);
    this.eventCenter.emit(EventType.EDGE_DELETE, { data: edgeData });
  }

  @action
  removeEdgeBySource(sourceNodeId) {
    for (let i = 0; i < this.edges.length; i++) {
      if (this.edges[i].sourceNodeId === sourceNodeId) {
        const edgeData = this.edges[i].getData();
        this.edges.splice(i, 1);
        i--;
        this.eventCenter.emit(EventType.EDGE_DELETE, { data: edgeData });
      }
    }
  }

  @action
  removeEdgeByTarget(targetNodeId) {
    for (let i = 0; i < this.edges.length; i++) {
      if (this.edges[i].targetNodeId === targetNodeId) {
        const edgeData = this.edges[i].getData();
        this.edges.splice(i, 1);
        i--;
        this.eventCenter.emit(EventType.EDGE_DELETE, { data: edgeData });
      }
    }
  }

  @action
  setElementState(state: ElementState, additionStateData?: AdditionData) {
    this.state = state;
    this.additionStateData = additionStateData;
  }

  @action
  setElementStateById(id: ElementModeId, state: ElementState, additionStateData?: AdditionData) {
    this.resetElementState();
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

  @action
  setElementTextById(id: ElementModeId, value: string) {
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

  @action
  resetElementState() {
  }

  @action
  selectNodeById(id: string, multiple = false) {
    if (!multiple) {
      this.selectElement?.setSelected(false);
      this.clearSelectElements();
    }
    this.selectElement = this.nodesMap[id]?.model;
    this.selectElement?.setSelected(true);
    this.selectElements.set(id, this.selectElement);
  }

  @action
  selectEdgeById(id: string, multiple = false) {
    if (!multiple) {
      this.selectElement?.setSelected(false);
      this.clearSelectElements();
    }
    this.selectElement = this.edgesMap[id]?.model;
    this.selectElement?.setSelected(true);
  }

  @action
  selectElementById(id: string, multiple = false) {
    if (!multiple) {
      this.selectElement?.setSelected(false);
      this.clearSelectElements();
    }
    this.selectElement = this.getElement(id) as BaseNodeModel | BaseEdgeModel;
    this.selectElement?.setSelected(true);
    this.selectElements.set(id, this.selectElement);
  }

  @action
  clearSelectElements() {
    this.selectElements.forEach(element => {
      element?.setSelected(false);
    });
    this.selectElements.clear();
    this.topElement?.setZIndex();
  }
  /**
   * 批量移动元素
   */
  @action
  moveElements(
    elements: { nodes: NodeConfig[] },
    deltaX: number,
    deltaY: number,
  ) {
    // 如果移动的
    elements.nodes.forEach(node => this.moveNode(node.id, deltaX, deltaY));
  }
  /**
   * 批量移动节点，节点移动的时候，会动态计算所有节点与未移动节点的连线位置
   * 移动的节点直接的连线会保持相对位置
   */
  @action
  moveNodes(nodeIds, deltaX, deltaY, isignoreRule = false) {
    nodeIds.forEach(nodeId => this.moveNode(nodeId, deltaX, deltaY, isignoreRule));
  }
  /**
   * 添加节点移动限制规则，在节点移动的时候触发。
   * 如果方法返回false, 则会阻止节点移动。
   * @param fn function
   */
  addNodeMoveRules(fn: NodeMoveRule) {
    if (!this.nodeMoveRules.includes(fn)) {
      this.nodeMoveRules.push(fn);
    }
  }
  /* 修改连线类型 */
  @action
  changeEdgeType(type: string): void {
    this.edgeType = type;
  }
  @action
  changeNodeType(id, type: string): void {
    const nodeModel = this.getNodeModel(id);
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
    // 微调连线
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

  /* 设置主题 */
  @action setTheme(style: Style) {
    this.theme = updateTheme({ ...this.theme, ...style });
  }
  // 清空数据
  @action
  clearData(): void {
    this.nodes = [];
    this.edges = [];
  }
}

export { GraphModel };
export default GraphModel;
