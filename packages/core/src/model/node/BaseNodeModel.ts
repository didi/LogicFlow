import { assign, cloneDeep, isNil } from 'lodash-es';
import { observable, action, toJS, isObservable, computed, makeObservable } from '../../util/stateUtil';
import { createUuid } from '../../util/uuid';
import { OutlineTheme } from '../../constant/DefaultTheme';
import {
  ModelType, ElementType, OverlapMode, EventType,
} from '../../constant/constant';
import {
  AdditionData,
  NodeData,
  NodeConfig,
  NodeMoveRule,
  Bounds,
  AnchorConfig,
  PointAnchor,
  AnchorsOffsetItem,
  PointTuple,
  ShapeStyleAttribute,
  IsAllowMove,
} from '../../type';
import GraphModel from '../GraphModel';
import { IBaseModel } from '../BaseModel';
import { formatData } from '../../util/compatible';
import { pickNodeConfig } from '../../util/node';
import { getZIndex } from '../../util/zIndex';
import { BaseEdgeModel } from '../edge';

export type ConnectRule = {
  message: string;
  validate: (
    source?: BaseNodeModel,
    target?: BaseNodeModel,
    sourceAnchor?: AnchorConfig,
    targetAnchor?: AnchorConfig,
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
  // 数据属性
  id = createUuid();
  type = '';
  x = 0;
  y = 0;
  text = {
    value: '',
    x: 0,
    y: 0,
    draggable: false,
    editable: true,
  };
  properties: Record<string, any> = {};
  // 形状属性
  private _width = 100;
  public get width() {
    return this._width;
  }
  public set width(value) {
    this._width = value;
  }
  private _height = 80;
  public get height() {
    return this._height;
  }
  public set height(value) {
    this._height = value;
  }
  anchorsOffset: AnchorsOffsetItem[] = []; // 根据与(x, y)的偏移量计算anchors的坐标
  // 状态属性
  isSelected = false;
  isHovered = false;
  isDragging = false;
  isHitable = true; // 细粒度控制节点是否对用户操作进行反应
  draggable = true;
  visible = true;
  // 其它属性
  graphModel: GraphModel;
  zIndex = 1;
  state = 1;
  autoToFront = true; // 节点选中时是否自动置顶，默认为true.
  readonly BaseType = ElementType.NODE;
  modelType = ModelType.NODE;
  additionStateData: AdditionData;
  targetRules: ConnectRule[] = [];
  sourceRules: ConnectRule[] = [];
  moveRules: NodeMoveRule[] = []; // 节点移动之前的hook
  hasSetTargetRules = false; // 用来限制rules的重复值
  hasSetSourceRules = false; // 用来限制rules的重复值
  [propName: string]: any; // 支持自定义
  constructor(data: NodeConfig, graphModel: GraphModel) {
    makeObservable<BaseNodeModel, '_width' | '_height'>(this, {
      type: observable,
      x: observable,
      y: observable,
      text: observable,
      properties: observable,
      _width: observable,
      _height: observable,
      anchorsOffset: observable,
      isSelected: observable,
      isHovered: observable,
      isDragging: observable,
      isHitable: observable,
      draggable: observable,
      visible: observable,
      zIndex: observable,
      state: observable,
      autoToFront: observable,
      incoming: computed,
      outgoing: computed,
      addNodeMoveRules: action,
      move: action,
      moveTo: action,
      setIsDragging: action,
      moveText: action,
      updateText: action,
      setSelected: action,
      setHovered: action,
      setHitable: action,
      setElementState: action,
      setProperty: action,
      setProperties: action,
      setZIndex: action,
      updateAttributes: action,
    });

    this.graphModel = graphModel;
    this.data = data;
  }
  init() {
    this.initNodeData(this.data);
    this.setAttributes();
  }
  /**
   * 获取进入当前节点的边和节点
   */
  get incoming(): { nodes: BaseNodeModel[], edges: BaseEdgeModel[] } {
    return {
      nodes: this.graphModel.getNodeIncomingNode(this.id),
      edges: this.graphModel.getNodeIncomingEdge(this.id),
    };
  }
  /*
   * 获取离开当前节点的边和节点
   */
  get outgoing(): { nodes: BaseNodeModel[], edges: BaseEdgeModel[] } {
    return {
      nodes: this.graphModel.getNodeOutgoingNode(this.id),
      edges: this.graphModel.getNodeOutgoingEdge(this.id),
    };
  }
  /**
   * @override 可以重写
   * 初始化节点数据
   * initNodeData和setAttributes的区别在于
   * initNodeData只在节点初始化的时候调用，用于初始化节点的所有属性。
   * setAttributes除了初始化调用外，还会在properties发生变化了调用。
   */
  public initNodeData(data) {
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
   * 设置model属性，每次properties发生变化会触发
   * 例如设置节点的宽度
   * @example
   *
   * setAttributes () {
   *   this.width = 300
   *   this.height = 200
   * }
   *
   * @override 支持重写
   */
  public setAttributes() {}
  /**
   * @override 支持重写，自定义此类型节点默认生成方式
   * @returns string
   */
  public createId(): string {
    return null;
  }
  /**
   * 初始化文本属性
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
   * 获取被保存时返回的数据
   * @override 支持重写
   */
  getData(): NodeData {
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
  setIsDragging(isDragging) {
    this.isDragging = isDragging;
  }
  /**
   * 用于在历史记录时获取节点数据，
   * 在某些情况下，如果希望某个属性变化不引起history的变化，
   * 可以重写此方法。
   */
  getHistoryData(): NodeData {
    return this.getData();
  }
  /**
   * 获取当前节点的properties
   */
  getProperties() {
    return toJS(this.properties);
  }
  /**
   * @override 支持重写
   * 获取当前节点样式
   * @returns 自定义节点样式
   */
  getNodeStyle(): ShapeStyleAttribute {
    return {
      ...this.graphModel.theme.baseNode,
    };
  }
  /**
   * @override 支持重写
   * 获取当前节点文本样式
   */
  getTextStyle() {
    // 透传 nodeText
    const { nodeText } = this.graphModel.theme;
    return cloneDeep(nodeText);
  }
  /**
   * @override 支持重写
   * 获取当前节点锚点样式
   * @returns 自定义样式
   */
  getAnchorStyle(anchorInfo): Record<string, any> {
    const { anchor } = this.graphModel.theme;
    // 防止被重写覆盖主题。
    return cloneDeep(anchor);
  }
  /**
   * @override 支持重写
   * 获取当前节点锚点拖出连线样式
   * @returns 自定义锚点拖出样式
   */
  getAnchorLineStyle() {
    const { anchorLine } = this.graphModel.theme;
    return cloneDeep(anchorLine);
  }
  /**
   * @override 支持重写
   * 获取outline样式，重写可以定义此类型节点outline样式， 默认使用主题样式
   * @returns 自定义outline样式
   */
  getOutlineStyle(): OutlineTheme {
    const { outline } = this.graphModel.theme;
    return cloneDeep(outline);
  }
  /**
   * @over
   * 在边的时候，是否允许这个节点为source节点，边到target节点。
   */
  isAllowConnectedAsSource(
    target: BaseNodeModel,
    sourceAnchor: AnchorConfig,
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
      if (!rule.validate.call(this, this, target, sourceAnchor, targetAnchor)) {
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
   * 在连线的时候，是否允许这个节点为target节点
   */
  isAllowConnectedAsTarget(
    source: BaseNodeModel,
    sourceAnchor: AnchorConfig,
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
      if (!rule.validate.call(this, source, this, sourceAnchor, targetAnchor)) {
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
   * 内部方法
   * 是否允许移动节点到新的位置
   */
  isAllowMoveNode(deltaX, deltaY): boolean | IsAllowMove {
    let isAllowMoveX = true;
    let isAllowMoveY = true;
    const rules = this.moveRules.concat(this.graphModel.nodeMoveRules);
    for (const rule of rules) {
      const r = rule(this, deltaX, deltaY);
      if (!r) return false;
      if (
        typeof r === 'object'
      ) {
        const r1 = r as IsAllowMove;
        if (r1.x === false && r1.y === false) {
          return false;
        }
        isAllowMoveX = isAllowMoveX && r1.x;
        isAllowMoveY = isAllowMoveY && r1.y;
      }
    }
    return {
      x: isAllowMoveX,
      y: isAllowMoveY,
    };
  }
  /**
   * 获取作为连线终点时的所有规则。
   */
  getConnectedTargetRules(): ConnectRule[] {
    return this.targetRules;
  }

  /**
   * @returns Point[] 锚点坐标构成的数组
   */
  getAnchorsByOffset(): PointAnchor[] {
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
    return this.getDefaultAnchor();
  }
  /**
   * @override 子类重写此方法设置默认锚点
   * 获取节点默认情况下的锚点
   */
  public getDefaultAnchor(): PointAnchor[] {
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

  getAnchorInfo(anchorId: string) {
    if (isNil(anchorId)) return;

    for (let i = 0; i < this.anchors.length; i++) {
      const anchor = this.anchors[i];
      if (anchor.id === anchorId) {
        return anchor;
      }
    }
  }

  addNodeMoveRules(fn: NodeMoveRule) {
    if (!this.moveRules.includes(fn)) {
      this.moveRules.push(fn);
    }
  }
  move(deltaX, deltaY, isIgnoreRule = false): boolean {
    let isAllowMoveX = false;
    let isAllowMoveY = false;
    if (isIgnoreRule) {
      isAllowMoveX = true;
      isAllowMoveY = true;
    } else {
      const r = this.isAllowMoveNode(deltaX, deltaY);
      if (typeof r === 'boolean') {
        isAllowMoveX = r;
        isAllowMoveY = r;
      } else {
        isAllowMoveX = r.x;
        isAllowMoveY = r.y;
      }
    }
    if (isAllowMoveX) {
      const targetX = this.x + deltaX;
      this.x = targetX;
      this.text && this.moveText(deltaX, 0);
    }
    if (isAllowMoveY) {
      const targetY = this.y + deltaY;
      this.y = targetY;
      this.text && this.moveText(0, deltaY);
    }
    return isAllowMoveX || isAllowMoveY;
  }

  moveTo(x, y, isIgnoreRule = false): boolean {
    const deltaX = x - this.x;
    const deltaY = y - this.y;
    return this.move(deltaX, deltaY, isIgnoreRule);
  }

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

  updateText(value: string): void {
    const { id } = this;
    this.text = {
      ...this.text,
      value,
    };
    this.graphModel.eventCenter.emit(EventType.NODE_TEXT_UPDATE, {
      id,
      text: this.text,
    });
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

  setElementState(state: number, additionStateData?: AdditionData): void {
    this.state = state;
    this.additionStateData = additionStateData;
  }

  setProperty(key, val): void {
    this.properties = {
      ...this.properties,
      [key]: formatData(val),
    };
    this.setAttributes();
    this.graphModel.eventCenter.emit(EventType.NODE_PROPERTY_UPDATE, {
      id: this.id,
      data: {
        [key]: val,
      },
    });
  }

  setProperties(properties): void {
    this.properties = {
      ...this.properties,
      ...formatData(properties),
    };
    this.setAttributes();
    this.graphModel.eventCenter.emit(EventType.NODE_PROPERTY_UPDATE, {
      id: this.id,
      data: properties,
    });
  }

  setZIndex(zIndex = 1): void {
    this.zIndex = zIndex;
  }
  /**
   * 设置节点属性；
   * 支持属性请参考节点属性文档
   * http://logic-flow.org/api/nodeModelApi.html#%E6%95%B0%E6%8D%AE%E5%B1%9E%E6%80%A7
   * @example
   * nodeModel.updateAttributes({
   *  width: 100,
   *  height: 100
   * })
   */
  updateAttributes(attributes) {
    assign(this, cloneDeep(attributes));
  }
}
