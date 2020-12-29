import {
  action, observable, computed, toJS,
} from 'mobx';
import { assign, pick } from 'lodash-es';
import { createUuid } from '../../util/uuid';
import { getAnchors } from '../../util/node';
import { IBaseModel } from '../BaseModel';
import GraphModel from '../GraphModel';
import {
  Point, AdditionData, EdgeAttribute, EdgeData,
} from '../../type/index';
import {
  ElementState, ModelType, ElementMaxzIndex, ElementType,
} from '../../constant/constant';
import { defaultTheme } from '../../constant/DefaultTheme';

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
  @observable text = defaultData.text;
  @observable type = '';
  @observable properties = {};
  @observable sourceNodeId = defaultData.sourceNodeId;
  @observable targetNodeId = defaultData.targetNodeId;
  @observable startPoint = defaultData.startPoint;
  @observable endPoint = defaultData.endPoint;
  @observable strokeWidth = defaultData.strokeWidth;
  @observable stroke = defaultData.stroke;
  @observable outlineColor = defaultData.outlineColor;
  @observable strokeOpacity = defaultData.strokeOpacity;
  @observable zIndex = defaultData.zIndex;
  @observable isSelected = defaultData.isSelected;
  @observable isHovered = defaultData.isHovered;
  @observable isHitable = true; // 细粒度控制连线是否对用户操作进行反应
  @observable hoverStroke = defaultData.hoverStroke;
  @observable selectedStroke = defaultData.selectedStroke;
  @observable points = defaultData.points;
  @observable pointsList = defaultData.pointsList;
  constructor(data, graphModel: GraphModel) {
    // todo: 规范所有的初始化参数
    assign(this, pick(data, [
      'id',
      'type',
      'sourceNodeId',
      'targetNodeId',
      'startPoint',
      'endPoint',
      'pointsList',
      'properties',
    ]));
    if (data.text) {
      this.text = data.text;
    }
    this.graphModel = graphModel;
  }
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
    const sourceAnchors = getAnchors(sourceNode);
    let position;
    if (sourceNode.y >= targetNode.y + targetNode.height) {
      // 上方
      [position] = sourceAnchors;
    } else if (sourceNode.y + sourceNode.height <= targetNode.y) {
      // 下方
      [, , position] = sourceAnchors;
    } else if (sourceNode.x >= targetNode.x) {
      // 左边
      [, , , position] = sourceAnchors;
    } else {
      // 右边
      [, position] = sourceAnchors;
    }
    return position;
  }

  /* 获取终点 */
  getEndAnchor(sourceNode, targetNode): Point {
    const targetAnchors = getAnchors(targetNode);
    let position;
    if (targetNode.y >= sourceNode.y + sourceNode.height) {
      // 上方
      [position] = targetAnchors;
    } else if (targetNode.y + targetNode.height <= sourceNode.y) {
      // 下方
      [, , position] = targetAnchors;
    } else if (targetNode.x >= sourceNode.x) {
      // 左边
      [, , , position] = targetAnchors;
    } else {
      // 右边
      [, position] = targetAnchors;
    }
    return position;
  }

  getProperties() {
    return toJS(this.properties);
  }

  getData(): EdgeData {
    const { x, y, value } = this.text;
    return {
      id: this.id,
      type: this.type,
      sourceNodeId: this.sourceNode.id,
      targetNodeId: this.targetNode.id,
      startPoint: { ...this.startPoint },
      endPoint: { ...this.endPoint },
      text: {
        x,
        y,
        value,
      },
      properties: toJS(this.properties),
    };
  }

  @action
  setProperty(key, val): void {
    this.properties[key] = val;
  }

  @action
  setProperties(properties): void {
    this.properties = Object.assign(this.properties, properties);
  }

  /* 更新数据 */
  @action
  updateData(edgeAttribute: EdgeAttribute): void {
    const nodeData = pick(edgeAttribute,
      'type',
      'sourceNodeId',
      'targetNodeId',
      'startPoint',
      'endPoint',
      'text',
      'properties');
    assign(this, nodeData);
  }

  @action
  formatText(data) {
    // 暂时处理，只传入text的情况
    if (data.text && typeof data.text === 'string') {
      const { x, y } = this.textPosition;
      this.text = {
        value: data.text || '',
        x,
        y,
        draggable: false,
      };
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
      } = this.text;
      this.text = {
        value,
        draggable,
        x: x + deltaX,
        y: y + deltaY,
      };
    }
  }

  @action
  setText(textConfig): void {
    this.text = textConfig;
  }

  @action
  updateText(value: string): void {
    const {
      x,
      y,
      draggable,
    } = this.text;
    this.text = {
      x,
      y,
      draggable,
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
      const position = this.getEndAnchor(this.sourceNode, this.targetNode);
      this.endPoint = position;
    }
  }

  @action
  setSelected(flag = true): void {
    this.isSelected = flag;
    this.zIndex = this.isSelected ? ElementMaxzIndex : 0;
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
}

export { BaseEdgeModel };
export default BaseEdgeModel;
