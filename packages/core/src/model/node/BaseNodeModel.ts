import {
  observable, action, toJS, isObservable,
} from 'mobx';
import { assign, cloneDeep } from 'lodash-es';
import { createUuid } from '../../util/uuid';
import { OutlineTheme } from '../../constant/DefaultTheme';
import {
  ElementState, ModelType, ElementType, OverlapMode,
} from '../../constant/constant';
import {
  AdditionData,
  NodeData,
  NodeAttribute,
  NodeConfig,
  NodeMoveRule,
  Bounds,
  AnchorConfig,
  PointAnchor,
  AnchorsOffsetItem,
  PointTuple,
  ShapeStyleAttribute,
} from '../../type';
import GraphModel from '../GraphModel';
import { IBaseModel } from '../BaseModel';
import { formatData } from '../../util/compatible';
import { pickNodeConfig } from '../../util/node';
import { getZIndex } from '../../util/zIndex';

const defaultConfig = assign(
  {
    x: 0,
    y: 0,
    zIndex: 1,
    text: {
      value: '',
      x: 0,
      y: 0,
      draggable: false,
      editable: true,
    },
    hideOutline: false,
  },
);

export type ConnectRule = {
  message: string;
  validate: (
    source: BaseNodeModel,
    target: BaseNodeModel,
    sourceAnchor: AnchorConfig,
    targetAnchor: AnchorConfig,
  ) => boolean;
};

export type ConnectRuleResult = {
  isAllPass: boolean;
  msg?: string;
};

interface IBaseNodeModel extends IBaseModel {
  /**
   * model基础类型，固定为node
   */
  readonly BaseType: ElementType.NODE,
}

export { BaseNodeModel };
export default class BaseNodeModel implements IBaseNodeModel {
  id = createUuid();
  readonly BaseType = ElementType.NODE;
  modelType = ModelType.NODE;
  additionStateData: AdditionData;
  [propName: string]: any; // 支持自定义
  targetRules: ConnectRule[] = [];
  sourceRules: ConnectRule[] = [];
  moveRules: NodeMoveRule[] = []; // 节点移动之前的hook
  hasSetTargetRules = false; // 用来限制rules的重复值
  hasSetSourceRules = false; // 用来限制rules的重复值
  @observable properties: Record<string, any> = {};
  @observable type = '';
  @observable x = defaultConfig.x;
  @observable y = defaultConfig.y;
  @observable
  private _width = 100;
  graphModel: GraphModel;
  public get width() {
    return this._width;
  }
  public set width(value) {
    this._width = value;
  }
  @observable
  private _height = 80;
  public get height() {
    return this._height;
  }
  public set height(value) {
    this._height = value;
  }
  @observable isSelected = false;
  @observable isHovered = false;
  @observable isHitable = true; // 细粒度控制节点是否对用户操作进行反应
  @observable zIndex = defaultConfig.zIndex;
  @observable anchorsOffset: AnchorsOffsetItem[] = []; // 根据与(x, y)的偏移量计算anchors的坐标
  @observable state = 1;
  @observable text = defaultConfig.text;
  @observable draggable = true;

  constructor(data: NodeConfig, graphModel: GraphModel) {
    this.graphModel = graphModel;
    this.initNodeData(data);
    this.setAttributes();
  }
  /**
   * 初始化节点数据，不建议重写
   * 可以重写setAttributes来实现修改初始化功能
   * initNodeData和setAttributes的区别在于
   * initNodeData需要
   */
  protected initNodeData(data) {
    if (!data.properties) {
      data.properties = {};
    }

    if (!data.id) {
      // 自定义节点id > 全局定义id > 内置
      const { idGenerator } = this.graphModel;
      const globalId = idGenerator && idGenerator(data.type);
      if (globalId) data.id = globalId;
      const customNodeId = this.createId();
      if (customNodeId) data.id = customNodeId;
    }

    this.formatText(data);
    assign(this, pickNodeConfig(data));
    const { overlapMode } = this.graphModel;
    if (overlapMode === OverlapMode.INCREASE) {
      this.zIndex = data.zIndex || getZIndex();
    }
  }
  /**
   * @overridable 支持重新
   * @returns string
   */
  public createId(): string {
    return null;
  }
  /**
   * 初始化文本属性，对
   */
  private formatText(data): void {
    if (!data.text) {
      data.text = {
        value: '',
        x: data.x,
        y: data.y,
        draggable: false,
        editable: true,
      };
    }
    if (data.text && typeof data.text === 'string') {
      data.text = {
        value: data.text,
        x: data.x,
        y: data.y,
        draggable: false,
        editable: true,
      };
    } else if (data.text && data.text.editable === undefined) {
      data.text.editable = true;
    }
  }
  /**
   * 设置model初始化属性
   * 例如设置节点的宽度
   * @example
   *
   * setAttributes () {
   *   this.width = 300
   *   this.height = 200
   * }
   *
   * @overridable 支持重写
   */
  setAttributes() {}

  /**
   * 获取被保存时返回的数据
   * @overridable 支持重写
   * @returns NodeData
   */
  public getData(): NodeData {
    const { x, y, value } = this.text;
    let { properties } = this;
    if (isObservable(properties)) {
      properties = toJS(properties);
    }
    const data: NodeData = {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      properties,
    };
    if (this.graphModel.overlapMode === OverlapMode.INCREASE) {
      data.zIndex = this.zIndex;
    }
    if (value) {
      data.text = {
        x,
        y,
        value,
      };
    }
    return data;
  }

  getProperties() {
    return toJS(this.properties);
  }
  /**
   * @overridable 支持重写
   * 获取当前节点样式
   * @returns 自定义节点样式
   */
  getNodeStyle(): ShapeStyleAttribute {
    return {
      ...this.graphModel.theme.baseNode,
    };
  }
  /* 支持节点自定义文案样式 */
  getTextStyle() {
    // 透传 nodeText
    const { nodeText } = this.graphModel.theme;
    return cloneDeep(nodeText);
  }
  /**
   * 获取节点锚点样式
   * @returns 自定义样式
   */
  getAnchorStyle(): Record<string, any> {
    const { anchor } = this.graphModel.theme;
    // 防止被重写覆盖主题。
    return cloneDeep(anchor);
  }
  /**
   * 获取自定义锚点拖出样式
   * @returns 自定义锚点拖出样式
   */
  getAnchorLineStyle() {
    const { anchorLine } = this.graphModel.theme;
    return cloneDeep(anchorLine);
  }
  /**
   * @overridable 支持重写
   * 获取outline样式，重写可以定义此类型节点outline样式， 默认使用主题样式
   * @returns 自定义outline样式
   */
  getOutlineStyle(): OutlineTheme {
    const { outline } = this.graphModel.theme;
    return cloneDeep(outline);
  }
  /**
   * 在边的时候，是否允许这个节点为source节点，边到target节点。
   */
  isAllowConnectedAsSource(
    target: BaseNodeModel,
    soureAnchor: AnchorConfig,
    targetAnchor: AnchorConfig,
  ): ConnectRuleResult | Boolean {
    const rules = !this.hasSetSourceRules
      ? this.getConnectedSourceRules()
      : this.sourceRules;
    this.hasSetSourceRules = true;
    let isAllPass = true;
    let msg: string;
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (!rule.validate.call(this, this, target, soureAnchor, targetAnchor)) {
        isAllPass = false;
        msg = rule.message;
        break;
      }
    }
    return {
      isAllPass,
      msg,
    };
  }

  /**
   * 获取当前节点作为连接的起始节点规则。
   */
  getConnectedSourceRules(): ConnectRule[] {
    return this.sourceRules;
  }
  /**
   * 在边的时候，是否允许这个节点未target节点
   */

  isAllowConnectedAsTarget(
    source: BaseNodeModel,
    soureAnchor: AnchorConfig,
    targetAnchor: AnchorConfig,
  ): ConnectRuleResult | Boolean {
    const rules = !this.hasSetTargetRules
      ? this.getConnectedTargetRules()
      : this.targetRules;
    this.hasSetTargetRules = true;
    let isAllPass = true;
    let msg: string;
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (!rule.validate.call(this, source, this, soureAnchor, targetAnchor)) {
        isAllPass = false;
        msg = rule.message;
        break;
      }
    }
    return {
      isAllPass,
      msg,
    };
  }
  /**
   * 是否允许移动节点到新的位置
   */
  isAllowMoveNode(deltaX, deltaY) {
    for (const rule of this.moveRules) {
      if (!rule(this, deltaX, deltaY)) return false;
    }
    for (const rule of this.graphModel.nodeMoveRules) {
      if (!rule(this, deltaX, deltaY)) return false;
    }
    return true;
  }

  getConnectedTargetRules(): ConnectRule[] {
    return this.targetRules;
  }

  /**
   * @overridable 子类重写此方法设置锚点
   * @returns Point[] 锚点坐标构成的数组
   */
  public getAnchorsByOffset(): PointAnchor[] {
    const {
      anchorsOffset,
      id,
      x,
      y,
    } = this;
    if (anchorsOffset && anchorsOffset.length > 0) {
      return anchorsOffset.map((el, idx) => {
        if (el.length) {
          el = el as PointTuple; // 历史数据格式
          return {
            id: `${id}_${idx}`,
            x: x + el[0],
            y: y + el[1],
          };
        }
        el = el as PointAnchor;
        return {
          ...el,
          x: x + el.x,
          y: y + el.y,
          id: el.id || `${id}_${idx}`,
        };
      });
    }
    return this.getDetaultAnchor();
  }
  /**
   * 获取节点默认情况下的锚点
   */
  public getDetaultAnchor(): PointAnchor[] {
    return [];
  }
  /**
   * 获取节点BBox
   */
  public getBounds(): Bounds {
    return {
      x1: this.x - this.width / 2,
      y1: this.y - this.height / 2,
      x2: this.x + this.width / 2,
      y2: this.y + this.height / 2,
    };
  }

  get anchors(): PointAnchor[] {
    return this.getAnchorsByOffset();
  }

  @action
  addNodeMoveRules(fn: NodeMoveRule) {
    if (!this.moveRules.includes(fn)) {
      this.moveRules.push(fn);
    }
  }
  @action
  move(deltaX, deltaY, isignoreRule = false): void {
    if (!isignoreRule && !this.isAllowMoveNode(deltaX, deltaY)) return;
    const targetX = this.x + deltaX;
    const targetY = this.y + deltaY;
    this.x = targetX;
    this.y = targetY;
    this.text && this.moveText(deltaX, deltaY);
  }

  @action
  moveTo(x, y, isignoreRule = false): void {
    const deltaX = x - this.x;
    const deltaY = y - this.y;
    if (!isignoreRule && !this.isAllowMoveNode(deltaX, deltaY)) return;
    if (this.text) {
      this.text && this.moveText(deltaX, deltaY);
    }
    this.x = x;
    this.y = y;
  }

  @action
  moveText(deltaX, deltaY): void {
    const {
      x,
      y,
      value,
      draggable,
      editable,
    } = this.text;
    this.text = {
      value,
      editable,
      draggable,
      x: x + deltaX,
      y: y + deltaY,
    };
  }

  @action
  updateText(value: string): void {
    this.text.value = value;
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
  setElementState(state: number, additionStateData?: AdditionData): void {
    this.state = state;
    this.additionStateData = additionStateData;
  }

  @action
  updateStroke(color): void {
    this.stroke = color;
  }

  @action
  setProperty(key, val): void {
    this.properties = {
      ...this.properties,
      [key]: formatData(val),
    };
    this.setAttributes();
  }

  @action
  setProperties(properties): void {
    // fix: vue setProperties not observable
    this.properties = {
      ...this.properties,
      ...formatData(properties),
    };
    this.setAttributes();
  }

  @action
  setZIndex(zindex: number = defaultConfig.zIndex): void {
    this.zIndex = zindex;
  }

  @action
  updateAttributes(attributes) {
    assign(this, attributes);
  }
}
