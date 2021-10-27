import {
  action, observable, computed, toJS,
} from 'mobx';
import { assign, pick } from 'lodash-es';
import { createUuid } from '../../util/uuid';
import { getAnchors } from '../../util/node';
import { IBaseModel } from '../BaseModel';
import GraphModel from '../GraphModel';
import {
  Point,
  AdditionData,
  EdgeAttribute,
  EdgeData,
  MenuConfig,
  EdgeConfig,
} from '../../type/index';
import {
  ElementState, ModelType, ElementType, OverlapMode,
} from '../../constant/constant';
import { defaultTheme } from '../../constant/DefaultTheme';
import { formatData } from '../../util/compatible';
import { pickEdgeConfig, twoPointDistance } from '../../util/edge';
import { getZIndex } from '../../util/zIndex';

const defaultData = {
  sourceNodeId: '',
  sourceAnchorId: '',
  targetNodeId: '',
  targetAnchorId: '',
  startPoint: null,
  endPoint: null,
  zIndex: 0,
  isSelected: false,
  isHovered: false,
  text: {
    value: '',
    x: 0,
    y: 0,
    draggable: false,
    editable: true,
  },
  points: '',
  pointsList: [],
  strokeOpacity: 1,
  ...defaultTheme.line,
};
class BaseEdgeModel implements IBaseModel {
  id = createUuid();
  readonly BaseType = ElementType.EDGE;
  @observable state = 1;
  modelType = ModelType.EDGE;
  additionStateData: AdditionData;
  [propName: string]: any; // 支持自定义
  graphModel: GraphModel;
  menu?: MenuConfig[];
  sourceAnchorId = defaultData.sourceAnchorId;
  targetAnchorId = defaultData.targetAnchorId;
  customTextPosition = false; // 是否自定义连线文本位置
  @observable text = defaultData.text;
  @observable type = '';
  @observable properties = {};
  @observable sourceNodeId = defaultData.sourceNodeId;
  @observable targetNodeId = defaultData.targetNodeId;
  @observable startPoint = defaultData.startPoint;
  @observable endPoint = defaultData.endPoint;
  @observable strokeWidth = defaultData.strokeWidth;
  @observable stroke = defaultData.stroke;
  @observable strokeDashArray = defaultData.strokeDashArray;
  @observable outlineColor = defaultData.outlineColor;
  @observable outlineStrokeDashArray = defaultData.outlineStrokeDashArray;
  @observable strokeOpacity = defaultData.strokeOpacity;
  @observable zIndex = defaultData.zIndex;
  @observable isSelected = defaultData.isSelected;
  @observable isHovered = defaultData.isHovered;
  @observable isHitable = true; // 细粒度控制连线是否对用户操作进行反应
  @observable hoverStroke = defaultData.hoverStroke;
  @observable selectedStroke = defaultData.selectedStroke;
  @observable points = defaultData.points;
  @observable pointsList = defaultData.pointsList;
  @observable draggable = true;

  constructor(data: EdgeConfig, graphModel: GraphModel, type) {
    this.graphModel = graphModel;
    this.setStyleFromTheme(type, graphModel);
    this.initEdgeData(data);
    this.setAttributes();
    // 设置连线的 anchors，也就是连线的两个端点
    // 端点依赖于 edgeData 的 sourceNode 和 targetNode
    this.setAnchors();
    // 连线的拐点依赖于两个端点
    this.initPoints();
    // 文本位置依赖于连线上的所有拐点
    this.formatText(data);
  }

  initEdgeData(data) {
    if (!data.properties) {
      data.properties = {};
    }

    if (!data.id) {
      const { idGenerator } = this.graphModel;
      const globalId = idGenerator && idGenerator();
      if (globalId) data.id = globalId;
      const nodeId = this.createId();
      if (nodeId) data.id = nodeId;
    }

    assign(this, pickEdgeConfig(data));
    const { overlapMode } = this.graphModel;
    if (overlapMode === OverlapMode.INCREASE) {
      this.zIndex = data.zIndex || getZIndex();
    }
  }

  createId() {
    return null;
  }

  setAttributes() { }

  @computed get sourceNode() {
    return this.graphModel?.nodesMap[this.sourceNodeId]?.model;
  }
  @computed get targetNode() {
    return this.graphModel?.nodesMap[this.targetNodeId]?.model;
  }
  @computed get textPosition(): Point {
    return this.getTextPosition();
  }
  /**
   * @override 重新自定义文本位置
   * @returns 文本位置
   */
  getTextPosition(): Point {
    return {
      x: 0,
      y: 0,
    };
  }
  move() { }

  /* 获取起点 */
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

  /* 获取终点 */
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

  getProperties() {
    return toJS(this.properties);
  }

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

  @action
  setProperty(key, val): void {
    this.properties[key] = formatData(val);
  }

  @action
  setProperties(properties): void {
    Object.assign(this.properties, properties);
  }

  /* 更新数据 */
  @action
  updateData(edgeAttribute: EdgeAttribute): void {
    // formatData兼容vue数据
    const edgeData = formatData(pick(edgeAttribute,
      'type',
      'sourceNodeId',
      'targetNodeId',
      'startPoint',
      'endPoint',
      'text',
      'properties'));
    // 兼容text, object/string类型
    const {
      x,
      y,
      draggable,
      editable,
    } = this.text;
    if (edgeData.text && typeof edgeData.text === 'string') {
      const text = {
        value: edgeData.text,
        draggable,
        editable,
      };
      const textPostion = this.textPosition;
      if (!x && !y) {
        edgeData.text = Object.assign({}, text, textPostion);
      } else {
        edgeData.text = Object.assign({}, text, { x, y });
      }
    } else if (typeof edgeData.text === 'object') {
      const text = Object.assign({}, this.text, edgeData.text);
      edgeData.text = pick(text, 'x', 'y', 'value', 'draggable', 'editable');
    }
    assign(this, edgeData);
  }

  @action
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

  @action
  resetTextPosition() {
    const { x, y } = this.textPosition;
    this.text.x = x;
    this.text.y = y;
  }

  @action
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

  @action
  setText(textConfig): void {
    if (textConfig) {
      assign(this.text, textConfig);
    }
  }

  @action
  updateText(value: string): void {
    const {
      x,
      y,
      draggable,
      editable,
    } = this.text;
    this.text = {
      x,
      y,
      draggable,
      editable,
      value,
    };
  }

  @action
  setAnchors(): void {
    if (!this.startPoint) {
      const position = this.getBeginAnchor(this.sourceNode, this.targetNode);
      this.startPoint = position;
    }
    if (!this.endPoint) {
      const position = this.getEndAnchor(this.targetNode);
      this.endPoint = position;
    }
  }

  @action
  setSelected(flag = true): void {
    this.isSelected = flag;
  }

  @action
  setHovered(flag = true): void {
    this.isHovered = flag;
  }

  @action
  setHitable(flag = true): void {
    this.isHitable = flag;
  }

  @action
  setElementState(state: ElementState, additionStateData?: AdditionData): void {
    this.state = state;
    this.additionStateData = additionStateData;
  }

  @action
  updateStroke(color): void {
    this.stroke = color;
  }

  @action
  updateStrokeWidth(width): void {
    this.strokeWidth = width;
  }

  @action
  updateStartPoint(anchor): void {
    this.startPoint = anchor;
  }

  @action
  updateEndPoint(anchor): void {
    this.endPoint = anchor;
  }

  @action
  setStyleFromTheme(type, graphModel): void {
    const { theme } = graphModel;
    if (theme[type]) {
      assign(this, theme[type]);
    }
  }

  @action
  setZIndex(zindex: number = defaultData.zIndex): void {
    this.zIndex = zindex;
  }

  @action
  initPoints() {}

  @action
  updateAttributes(attributes) {
    assign(this, attributes);
  }
  // 获取连线调整的起点
  @action
  getAdjustStart() {
    return this.startPoint;
  }
  // 获取连线调整的终点
  @action
  getAdjustEnd() {
    return this.endPoint;
  }
  // 起终点拖拽调整过程中，进行直线路径更新
  @action
  updateAfterAdjustStartAndEnd({ startPoint, endPoint }) {
    this.updateStartPoint({ x: startPoint.x, y: startPoint.y });
    this.updateEndPoint({ x: endPoint.x, y: endPoint.y });
  }
}

export { BaseEdgeModel };
export default BaseEdgeModel;
