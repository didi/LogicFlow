import { assign, cloneDeep } from 'lodash-es';
import { action, observable, computed, toJS, makeObservable } from '../../util/stateUtil';
import { createUuid } from '../../util/uuid';
import { getAnchors } from '../../util/node';
import { IBaseModel } from '../BaseModel';
import GraphModel from '../GraphModel';
import {
  Point,
  AdditionData,
  EdgeData,
  MenuConfig,
  EdgeConfig,
  ShapeStyleAttribute,
} from '../../type/index';
import {
  ModelType, ElementType, OverlapMode, EventType,
} from '../../constant/constant';
import { OutlineTheme } from '../../constant/DefaultTheme';
import { defaultAnimationData } from '../../constant/DefaultAnimation';
import { formatData } from '../../util/compatible';
import { pickEdgeConfig, twoPointDistance } from '../../util/edge';
import { getZIndex } from '../../util/zIndex';

class BaseEdgeModel implements IBaseModel {
  // 数据属性
  id = createUuid();
  type = '';
  sourceNodeId = '';
  targetNodeId = '';
  startPoint = null;
  endPoint = null;
  text = {
    value: '',
    x: 0,
    y: 0,
    draggable: false,
    editable: true,
  };
  properties: Record<string, any> = {};
  points = '';
  pointsList = [];
  // 状态属性
  isSelected = false;
  isHovered = false;
  isHitable = true; // 细粒度控制边是否对用户操作进行反应
  draggable = true;
  visible = true;
  virtual = false; // 如果此属性为true, 则保存图时将不会保存此边
  isAnimation = false;
  // 引用属性
  graphModel: GraphModel;
  zIndex = 0;
  readonly BaseType = ElementType.EDGE;
  modelType = ModelType.EDGE;
  state = 1;
  additionStateData: AdditionData;
  sourceAnchorId = '';
  targetAnchorId = '';
  menu?: MenuConfig[];
  customTextPosition = false; // 是否自定义边文本位置
  animationData = defaultAnimationData;
  style: ShapeStyleAttribute = { }; // 每条边自己的样式，动态修改
  // TODO: 每个边独立生成一个marker没必要
  arrowConfig = {
    markerEnd: `url(#marker-end-${this.id})`,
    markerStart: '',
  }; // 箭头属性
  [propName: string]: any; // 支持自定义

  constructor(data: EdgeConfig, graphModel: GraphModel) {
    makeObservable(this, {
      type: observable,
      sourceNodeId: observable,
      targetNodeId: observable,
      startPoint: observable,
      endPoint: observable,
      text: observable,
      properties: observable,
      points: observable,
      pointsList: observable,
      isSelected: observable,
      isHovered: observable,
      isHitable: observable,
      draggable: observable,
      visible: observable,
      isAnimation: observable,
      zIndex: observable,
      state: observable,
      arrowConfig: observable,
      style: observable,
      sourceNode: computed,
      targetNode: computed,
      textPosition: computed,
      setProperty: action,
      setProperties: action,
      formatText: action,
      resetTextPosition: action,
      moveText: action,
      setText: action,
      updateText: action,
      setAnchors: action,
      setSelected: action,
      setHovered: action,
      setHitable: action,
      setElementState: action,
      updateStartPoint: action,
      moveStartPoint: action,
      updateEndPoint: action,
      moveEndPoint: action,
      setZIndex: action,
      initPoints: action,
      updateAttributes: action,
      getAdjustStart: action,
      getAdjustEnd: action,
      updateAfterAdjustStartAndEnd: action,
    });

    this.graphModel = graphModel;
    this.data = data;
  }
  init() {
    this.initEdgeData(this.data);
    this.setAttributes();
    // 设置边的 anchors，也就是边的两个端点
    // 端点依赖于 edgeData 的 sourceNode 和 targetNode
    this.setAnchors();
    // 边的拐点依赖于两个端点
    this.initPoints();
    // 文本位置依赖于边上的所有拐点
    this.formatText(this.data);
  }
  /**
   * @override 支持重写
   * 初始化边数据
   * initNodeData和setAttributes的区别在于
   * initNodeData只在节点初始化的时候调用，用于初始化节点的所有属性。
   * setAttributes除了初始化调用外，还会在properties发生变化了调用。
   */
  initEdgeData(data) {
    if (!data.properties) {
      data.properties = {};
    }

    if (!data.id) {
      // 自定义边id > 全局定义边id > 内置
      const { idGenerator } = this.graphModel;
      const globalId = idGenerator && idGenerator(data.type);
      if (globalId) data.id = globalId;
      const nodeId = this.createId();
      if (nodeId) data.id = nodeId;
    }

    assign(this, pickEdgeConfig(data));
    const { overlapMode } = this.graphModel;
    if (overlapMode === OverlapMode.INCREASE) {
      this.zIndex = data.zIndex || getZIndex();
    }
    this.arrowConfig.markerEnd = `url(#marker-end-${this.id})`;
    // 设置边的 anchors，也就是边的两个端点
    // 端点依赖于 edgeData 的 sourceNode 和 targetNode
    this.setAnchors();
    // 边的拐点依赖于两个端点
    this.initPoints();
    // 文本位置依赖于边上的所有拐点
    this.formatText(data);
  }
  /**
   * 设置model属性，每次properties发生变化会触发
   * @override 支持重写
   */
  setAttributes() { }
  /**
   * @override 支持重写，自定义此类型节点默认生成方式
   * @returns string
   */
  createId() {
    return null;
  }
  /**
   * @override 支持重写
   * 获取当前节点样式
   * @returns 自定义边样式
   */
  getEdgeStyle() {
    return {
      ...this.graphModel.theme.baseEdge,
      ...this.style,
    };
  }
  /**
   * @override 支持重写
   * 获取当前节点文本样式
   */
  getTextStyle() {
    // 透传 edgeText
    const { edgeText } = this.graphModel.theme;
    return cloneDeep(edgeText);
  }
  /**
   * @override 支持重写
   * 获取当前边的动画样式
   * @returns 自定义边动画样式
   */
  getAnimation() {
    const { animationData } = this;
    return cloneDeep(animationData);
  }
  /**
   * @overridable 支持重写
   * 获取当前边的动画样式
   * @returns 自定义边动画样式
   */
  getEdgeAnimationStyle() {
    const { edgeAnimation } = this.graphModel.theme;
    return cloneDeep(edgeAnimation);
  }
  /**
   * @overridable 支持重写
   * 获取outline样式，重写可以定义此类型边outline样式， 默认使用主题样式
   * @returns 自定义outline样式
   */
  getOutlineStyle(): OutlineTheme {
    const { graphModel } = this;
    const { outline } = graphModel.theme;
    return cloneDeep(outline);
  }
  /**
   * @override 支持重新，重新自定义文本位置
   * @returns 文本位置
   */
  getTextPosition(): Point {
    return {
      x: 0,
      y: 0,
    };
  }
  get sourceNode() {
    return this.graphModel?.nodesMap[this.sourceNodeId]?.model;
  }
  get targetNode() {
    return this.graphModel?.nodesMap[this.targetNodeId]?.model;
  }
  get textPosition(): Point {
    return this.getTextPosition();
  }

  /**
   * 内部方法，计算两个节点相连是起点位置
   */
  getBeginAnchor(sourceNode, targetNode): Point {
    let position;
    let minDistance;
    const sourceAnchors = getAnchors(sourceNode);
    sourceAnchors.forEach((anchor) => {
      const distance = twoPointDistance(anchor, targetNode);
      if (!minDistance) {
        minDistance = distance;
        position = anchor;
      } else if (distance < minDistance) {
        minDistance = distance;
        position = anchor;
      }
    });
    return position;
  }

  /**
   * 内部方法，计算两个节点相连是终点位置
   */
  getEndAnchor(targetNode): Point {
    let position;
    let minDistance;
    const targetAnchors = getAnchors(targetNode);
    targetAnchors.forEach((anchor) => {
      const distance = twoPointDistance(anchor, this.startPoint);
      if (!minDistance) {
        minDistance = distance;
        position = anchor;
      } else if (distance < minDistance) {
        minDistance = distance;
        position = anchor;
      }
    });
    return position;
  }
  /**
   * 获取当前边的properties
   */
  getProperties() {
    return toJS(this.properties);
  }
  /**
   * 获取被保存时返回的数据
   */
  getData(): EdgeData {
    const { x, y, value } = this.text;
    const data: EdgeData = {
      id: this.id,
      type: this.type,
      sourceNodeId: this.sourceNode.id,
      targetNodeId: this.targetNode.id,
      startPoint: Object.assign({}, this.startPoint),
      endPoint: Object.assign({}, this.endPoint),
      properties: toJS(this.properties),
    };
    if (value) {
      data.text = {
        x,
        y,
        value,
      };
    }
    if (this.graphModel.overlapMode === OverlapMode.INCREASE) {
      data.zIndex = this.zIndex;
    }
    return data;
  }
  /**
   * 用于在历史记录时获取节点数据，
   * 在某些情况下，如果希望某个属性变化不引起history的变化，
   * 可以重写此方法。
   */
  getHistoryData(): EdgeData {
    return this.getData();
  }
  setProperty(key, val): void {
    this.properties[key] = formatData(val);
    this.graphModel.eventCenter.emit(EventType.EDGE_PROPERTY_UPDATE, {
      id: this.id,
      data: {
        [key]: val,
      },
    });
    this.setAttributes();
  }

  deleteProperty(key: string): void {
    delete this.properties[key];
    this.setAttributes();
  }

  setProperties(properties): void {
    this.properties = {
      ...this.properties,
      ...formatData(properties),
    };
    this.graphModel.eventCenter.emit(EventType.EDGE_PROPERTY_UPDATE, {
      id: this.id,
      data: properties,
    });
    this.setAttributes();
  }

  changeEdgeId(id: string) {
    const { markerEnd, markerStart } = this.arrowConfig;
    if (markerStart && markerStart === `url(#marker-start-${this.id})`) {
      this.arrowConfig.markerStart = `url(#marker-start-${id})`;
    }
    if (markerEnd && markerEnd === `url(#marker-end-${this.id})`) {
      this.arrowConfig.markerEnd = `url(#marker-end-${id})`;
    }
    this.id = id;
  }
  // 设置样式
  setStyle(key, val): void {
    this.style = {
      ...this.style,
      [key]: formatData(val),
    };
  }

  setStyles(styles): void {
    this.style = {
      ...this.style,
      ...formatData(styles),
    };
  }

  updateStyles(styles): void {
    this.style = {
      ...formatData(styles),
    };
  }

  /**
   * 内部方法，处理初始化文本格式
   */
  formatText(data) {
    // 暂时处理，只传入text的情况
    const { x, y } = this.textPosition;
    if (!data.text || typeof data.text === 'string') {
      this.text = {
        value: data.text || '',
        x,
        y,
        draggable: this.text.draggable,
        editable: this.text.editable,
      };
      return;
    }

    if (Object.prototype.toString.call(data.text) === '[object Object]') {
      this.text = {
        x: data.text.x || x,
        y: data.text.y || y,
        value: data.text.value || '',
        draggable: this.text.draggable,
        editable: this.text.editable,
      };
    }
  }
  /**
   * 重置文本位置
   */
  resetTextPosition() {
    const { x, y } = this.textPosition;
    this.text.x = x;
    this.text.y = y;
  }
  /**
   * 移动边上的文本
   */
  moveText(deltaX: number, deltaY: number): void {
    if (this.text) {
      const {
        x,
        y,
        value,
        draggable,
        editable,
      } = this.text;
      this.text = {
        value,
        draggable,
        x: x + deltaX,
        y: y + deltaY,
        editable,
      };
    }
  }
  /**
   * 设置文本位置和值
   */
  setText(textConfig): void {
    if (textConfig) {
      assign(this.text, textConfig);
    }
  }
  /**
   * 更新文本的值
   */
  updateText(value: string): void {
    const { id, type, text: { value: oldValue } } = this;
    const preText = {
      id,
      type,
      oldValue,
      newValue: value,
    };
    this.text = {
      ...this.text,
      value,
    };
    this.graphModel.eventCenter.emit(EventType.EDGE_TEXT_UPDATE, preText);
  }
  /**
   * 内部方法，计算边的起点和终点和其对于的锚点Id
   */
  setAnchors(): void {
    if (!this.sourceAnchorId || !this.startPoint) {
      const anchor = this.getBeginAnchor(this.sourceNode, this.targetNode);
      if (!this.startPoint) {
        this.startPoint = {
          x: anchor.x,
          y: anchor.y,
        };
      }
      if (!this.sourceAnchorId) {
        this.sourceAnchorId = anchor.id;
      }
    }
    if (!this.targetAnchorId || !this.endPoint) {
      const anchor = this.getEndAnchor(this.targetNode);
      if (!this.endPoint) {
        this.endPoint = {
          x: anchor.x,
          y: anchor.y,
        };
      }
      if (!this.targetAnchorId) {
        this.targetAnchorId = anchor.id;
      }
    }
  }

  setSelected(flag = true): void {
    this.isSelected = flag;
  }

  setHovered(flag = true): void {
    this.isHovered = flag;
  }

  setHitable(flag = true): void {
    this.isHitable = flag;
  }

  openEdgeAnimation(): void {
    this.isAnimation = true;
  }

  closeEdgeAnimation(): void {
    this.isAnimation = false;
  }

  setElementState(state: number, additionStateData?: AdditionData): void {
    this.state = state;
    this.additionStateData = additionStateData;
  }

  updateStartPoint(anchor): void {
    this.startPoint = anchor;
  }

  moveStartPoint(deltaX, deltaY): void {
    this.startPoint.x += deltaX;
    this.startPoint.y += deltaY;
  }

  updateEndPoint(anchor): void {
    this.endPoint = anchor;
  }

  moveEndPoint(deltaX, deltaY): void {
    this.endPoint.x += deltaX;
    this.endPoint.y += deltaY;
  }

  setZIndex(zIndex = 0): void {
    this.zIndex = zIndex;
  }

  initPoints() {}

  updateAttributes(attributes) {
    assign(this, attributes);
  }
  // 获取边调整的起点
  getAdjustStart() {
    return this.startPoint;
  }
  // 获取边调整的终点
  getAdjustEnd() {
    return this.endPoint;
  }
  // 起终点拖拽调整过程中，进行直线路径更新
  updateAfterAdjustStartAndEnd({ startPoint, endPoint }) {
    this.updateStartPoint({ x: startPoint.x, y: startPoint.y });
    this.updateEndPoint({ x: endPoint.x, y: endPoint.y });
  }
}

export { BaseEdgeModel };
export default BaseEdgeModel;
