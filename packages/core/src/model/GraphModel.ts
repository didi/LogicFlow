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
  AdditionData, Point, NodeConfig, EdgeConfig, Style, PointTuple,
} from '../type';
import MenuModel from './MenuModel';
import { updateTheme } from '../util/theme';
import EventEmitter from '../event/eventEmitter';
import { snapToGrid } from '../util/geometry';
import { isPointInArea } from '../util/graph';
import { getClosestPointOfPolyline } from '../util/edge';

type BaseNodeModelId = string; // 节点ID
type BaseEdgeModelId = string; // 连线ID
type ElementModeId = string;

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
  @observable menuConfig;
  @observable gridSize = 1;
  @observable partial = false; // 是否开启局部渲染
  @observable fakerNode: BaseNodeModel;
  // @observable selectElements = new Map<string, IBaseModel>(); // 多选还没有做，先不加
  constructor(config) {
    const {
      container,
      background = {},
      grid: { size = 1 } = {},
      isSilentMode = false,
      eventCenter,
    } = config;
    this.background = background;
    this.isSlient = isSilentMode;
    this.gridSize = size;
    this.rootEl = container;
    this.editConfig = new EditConfigModel(config);
    this.menuConfig = new MenuModel(config, this);
    this.eventCenter = eventCenter;
    this.theme = updateTheme(config.style);
    this.edgeType = config.edgeType || 'polyline';
    this.width = config.width;
    this.height = config.height;
    this.partial = config.partial;
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
    const elements = [...this.edges, ...this.nodes];
    // 只显示可见区域的节点和连线以及和这个可以区域节点的节点
    const showElements = [];
    let topElementIdx = -1;
    // todo: 缓存, 优化计算效率
    for (let i = 0; i < elements.length; i++) {
      const currentItem = elements[i];
      // 如果节点不在可见区域，且不是全元素显示模式，则隐藏节点。
      if (!this.partial || this.isElementVisible(currentItem)) {
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
  /**
   * 当前展示菜单的元素
   */
  @computed get showMenuElement() {
    const showMenuNode = this.nodes.find(node => node.state === ElementState.SHOW_MENU);
    if (showMenuNode) return showMenuNode;
    const showMenuEdge = this.edges.find(edge => edge.state === ElementState.SHOW_MENU);
    if (showMenuEdge) return showMenuEdge;
    if (this.state === ElementState.SHOW_MENU) {
      return this;
    }
    return {
      BaseType: '',
      additionStateData: '',
      setElementState() {},
    };
  }

  getModel(type: string) {
    return this.modelMap.get(type);
  }

  getNodeModel(nodeId: BaseNodeModelId): BaseNodeModel {
    return this.nodesMap[nodeId]?.model;
  }
  /**
   * 因为流程图所在的位置可以是页面任何地方
   * 当内部事件需要获取触发事件时，其相对于画布左上角的位置
   * 需要事件触发位置减去画布相对于client的位置
   */
  getPointByClient({ x: x1, y: y1 }: Point) {
    const bbox = this.rootEl.getBoundingClientRect();
    const domOverlayPostion = {
      x: x1 - bbox.left,
      y: y1 - bbox.top,
    };
    const [x, y] = this.transformMatrix
      .HtmlPointToCanvasPoint([domOverlayPostion.x, domOverlayPostion.y]);
    return {
      domOverlayPostion,
      canvasOverlayPostion: {
        x,
        y,
      },
    };
  }
  isElementVisible(element) {
    const visibleLt: PointTuple = [-VisibleMoreSpace, -VisibleMoreSpace];
    const visibleRb: PointTuple = [this.width + VisibleMoreSpace, this.height + VisibleMoreSpace];
    if (element.BaseType === ElementType.NODE) {
      element = element as BaseNodeModel;
      let { x, y } = element;
      [x, y] = this.transformMatrix.CanvasPointToHtmlPoint([x, y]);
      if (isPointInArea([x, y], visibleLt, visibleRb)) {
        return true;
      }
    }
    if (element.BaseType === ElementType.EDGE) {
      element = element as BaseEdgeModel;
      const { startPoint, endPoint } = element;
      const startHtmlPoint = this.transformMatrix.CanvasPointToHtmlPoint(
        [startPoint.x, startPoint.y],
      );
      const endHtmlPoint = this.transformMatrix.CanvasPointToHtmlPoint([endPoint.x, endPoint.y]);
      if (
        isPointInArea(startHtmlPoint, visibleLt, visibleRb)
        || isPointInArea(endHtmlPoint, visibleLt, visibleRb)
      ) {
        return true;
      }
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
      }
      if (Object.prototype.toString.call(node.text) === '[object Object]') {
        node.text.x = snapToGrid(node.text.x, this.gridSize);
        node.text.y = snapToGrid(node.text.y, this.gridSize);
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
    const edge = this.edgesMap[edgeId];
    if (edge) {
      return edge.model;
    }
  }

  getElement(id: string): IBaseModel | undefined {
    const nodeModel = this.getNodeModel(id);
    if (nodeModel) {
      return nodeModel;
    }
    const edgeModel = this.getEdgeModel(id);
    return edgeModel;
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
  showMenu(id) {
    this.nodes.forEach((node) => node.showMenu(node.id === id));
    // this.edges.forEach((edge) => edge.showMenu(edge.id === id));
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
    const Model = this.getModel(nodeConfig.type);
    // TODO 元素的 model 不应该直接可以操作 graphModel 的属性，但可以调方法
    const nodeModel = new Model(nodeConfig, this);
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
   * 移动节点
   * @param nodeModel 节点Id
   * @param deltaX X轴移动距离
   * @param deltaY Y轴移动距离
   */
  @action
  moveNode(nodeId: BaseNodeModelId, deltaX: number, deltaY: number) {
    // 1) 移动节点
    const nodeModel = this.nodesMap[nodeId].model;
    nodeModel.move(deltaX, deltaY);
    // 2) 移动连线
    this.moveEdge(nodeId, deltaX, deltaY);
  }

  @action
  setTextEditable(id: ElementModeId) {
    this.setElementStateById(id, ElementState.TEXT_EDIT);
  }

  @action
  createEdge(edgeConfig: EdgeConfig) {
    // 边的类型优先级：自定义>全局>默认
    let { type } = edgeConfig;
    if (!type) {
      type = this.edgeType;
    }
    const Model = this.getModel(type);
    const edgeModel = new Model({ ...edgeConfig, type }, this);
    const edgeData = edgeModel.getData();
    this.eventCenter.emit(EventType.EDGE_ADD, { data: edgeData });
    this.edges.push(edgeModel);
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
        if (edgeModel.modelType === ModelType.POLYLINE_EDGE && edgeModel.text?.value) {
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
    if (this.showMenuElement && this.showMenuElement.BaseType) {
      this.showMenuElement.setElementState(ElementState.DEFAULT);
    }
  }

  @action
  selectNodeById(id) {
    this.selectElement?.setSelected(false);
    this.selectElement = this.nodesMap[id]?.model;
    this.selectElement?.setSelected(true);
  }

  @action
  selectEdgeById(id) {
    this.selectElement?.setSelected(false);
    this.selectElement = this.edgesMap[id]?.model;
    this.selectElement?.setSelected(true);
  }

  @action
  selectElementById(id: string) {
    this.selectElement?.setSelected(false);
    this.selectElement = this.getElement(id) as BaseNodeModel | BaseEdgeModel;
    this.selectElement?.setSelected(true);
  }

  /* 修改连线类型 */
  @action
  changeEdgeType(type: string): void {
    this.edgeType = type;
  }
  /* 设置主题 */
  @action setTheme(style: Style) {
    this.theme = updateTheme({ ...this.theme, ...style });
  }
}

export { GraphModel };
export default GraphModel;
