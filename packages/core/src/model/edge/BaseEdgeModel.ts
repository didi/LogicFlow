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
  ElementState, ModelType, ElementType,
} from '../../constant/constant';
import { defaultTheme } from '../../constant/DefaultTheme';
import { formatData } from '../../util/compatible';
import { pickEdgeConfig, twoPointDistance } from '../../util/edge';

const defaultData = {
  sourceNodeId: '',
  targetNodeId: '',
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
  readonly id = createUuid();
  readonly BaseType = ElementType.EDGE;
  @observable state = 1;
  modelType = ModelType.EDGE;
  additionStateData: AdditionData;
  graphModel: GraphModel;
  menu?: MenuConfig[];
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
    assign(this, pickEdgeConfig(data));
  }

  setAttributes() { }

  @computed get sourceNode() {
    return this.graphModel?.nodesMap[this.sourceNodeId]?.model;
  }
  @computed get targetNode() {
    return this.graphModel?.nodesMap[this.targetNodeId]?.model;
  }
  @computed get textPosition(): Point {
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
      startPoint: { ...this.startPoint },
      endPoint: { ...this.endPoint },
      properties: toJS(this.properties),
    };
    if (value) {
      data.text = {
        x,
        y,
        value,
      };
    }
    return data;
  }

  @action
  setProperty(key, val): void {
    this.properties[key] = formatData(val);
  }

  @action
  setProperties(properties): void {
    this.properties = Object.assign(this.properties, properties);
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
        edgeData.text = { ...text, ...textPostion };
      } else {
        edgeData.text = { ...text, x, y };
      }
    } else if (typeof edgeData.text === 'object') {
      const text = { ...this.text, ...edgeData.text };
      edgeData.text = pick(text, 'x', 'y', 'value', 'draggable', 'editable');
    }
    assign(this, edgeData);
  }

  @action
  formatText(data) {
    // 暂时处理，只传入text的情况
    const { x, y } = this.textPosition;
    if (!data.text) {
      this.text = {
        value: '',
        x,
        y,
        draggable: false,
        editable: true,
      };
    }
    if (data.text && typeof data.text === 'string') {
      this.text = {
        value: data.text || '',
        x,
        y,
        draggable: false,
        editable: true,
      };
    } else if (data.text && data.text.editable === undefined) {
      this.text.editable = true;
    }
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
      this.text = assign(this.text, textConfig);
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
}

export { BaseEdgeModel };
export default BaseEdgeModel;
