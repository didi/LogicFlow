import { observable, action, toJS, isObservable, computed } from 'mobx'
import {
  assign,
  cloneDeep,
  has,
  isNil,
  findIndex,
  isArray,
  slice,
  mapKeys,
} from 'lodash-es'
import { GraphModel, Model } from '..'
import LogicFlow from '../../LogicFlow'
import {
  createUuid,
  formatData,
  getClosestAnchor,
  getZIndex,
  Matrix,
  pickNodeConfig,
  TranslateMatrix,
  getNodeTextDeltaPerent,
  pointPositionAfterRotate,
} from '../../util'
import {
  ElementState,
  ElementType,
  EventType,
  ModelType,
  OverlapMode,
  TextMode,
} from '../../constant'
import { ResizeControl } from '../../view/Control'
import AnchorConfig = Model.AnchorConfig
import GraphElements = LogicFlow.GraphElements
import TextConfig = LogicFlow.TextConfig
import NodeConfig = LogicFlow.NodeConfig
import NodeData = LogicFlow.NodeData
import Point = LogicFlow.Point
import CommonTheme = LogicFlow.CommonTheme

import ResizeInfo = ResizeControl.ResizeInfo
import ResizeNodeData = ResizeControl.ResizeNodeData
import PCTResizeParams = ResizeControl.PCTResizeParams
import LabelType = LogicFlow.LabelType
import LabelConfig = LogicFlow.LabelConfig

export interface IBaseNodeModel extends Model.BaseModel {
  /**
   * model基础类型，固定为node
   */
  readonly BaseType: ElementType.NODE

  isDragging: boolean
  isShowAnchor: boolean
  getNodeStyle: () => CommonTheme
  getTextStyle: () => LogicFlow.TextNodeTheme
  setIsShowAnchor: (isShowAnchor: boolean) => void
}

export class BaseNodeModel implements IBaseNodeModel {
  readonly BaseType = ElementType.NODE
  static BaseType: ElementType = ElementType.NODE

  // 数据属性
  public id = ''
  @observable readonly type = ''
  @observable x = 0
  @observable y = 0
  @observable text: TextConfig = {
    value: '',
    x: 0,
    y: 0,
    draggable: false,
    editable: true,
  }
  @observable label: LabelType[] = []
  @observable properties: Record<string, unknown> = {}
  // 形状属性
  @observable private _width = 100
  public get width() {
    return this._width
  }

  public set width(value: number) {
    this._width = value
  }

  @observable private _height = 80
  public get height() {
    return this._height
  }

  public set height(value: number) {
    this._height = value
  }

  minWidth: number = 30
  minHeight: number = 30
  maxWidth: number = 2000
  maxHeight: number = 2000
  PCTResizeInfo?: PCTResizeParams

  // 根据与 (x, y) 的偏移量计算 anchors 的坐标
  @observable anchorsOffset: BaseNodeModel.AnchorsOffsetItem[] = []

  // 状态属性
  readonly virtual: boolean = false
  @observable isSelected = false
  @observable isHovered = false
  @observable isShowAnchor = false
  @observable isDragging = false
  @observable isHitable = true // TODO: 兼容拼写错误的情况 Remove
  @observable isHittable = true // 细粒度控制节点是否对用户操作进行反应
  @observable draggable = true
  @observable visible = true
  @observable enableRotate = true
  @observable enableResize = true

  // 其它属性
  graphModel: GraphModel
  textMode = TextMode.TEXT
  @observable zIndex = 1
  @observable state = ElementState.DEFAULT
  @observable autoToFront = true // 节点选中时是否自动置顶，默认为true.
  @observable style: CommonTheme = {} // 每个节点自己的样式，动态修改

  // TODO: 利用向量计算实现 平移、旋转、缩放 等操作，利用 svg 的 transform 属性
  @observable transform!: string // 节点的transform属性
  @observable private _rotate = 0
  get rotate() {
    return this._rotate
  }

  set rotate(value: number) {
    this._rotate = value
    const { x = 0, y = 0 } = this
    if (this.textMode === TextMode.LABEL) {
      this.label = this.label.map((item) => {
        const { x, y } = item
        const { x: nodeX, y: nodeY } = this
        const newPosition = pointPositionAfterRotate({ x, y }, this.rotate, {
          x: nodeX,
          y: nodeY,
        })
        return {
          ...item,
          ...newPosition,
        }
      })
    }
    this.transform = new TranslateMatrix(-x, -y)
      .rotate(value)
      .translate(x, y)
      .toString()
  }

  modelType = ModelType.NODE
  additionStateData?: Model.AdditionStateDataType = {}

  // 节点连入、练出、移动等规则
  targetRules: Model.ConnectRule[] = []
  sourceRules: Model.ConnectRule[] = []
  moveRules: Model.NodeMoveRule[] = [] // 节点移动之前的hook
  hasSetTargetRules = false // 用来限制rules的重复值
  hasSetSourceRules = false; // 用来限制rules的重复值
  [propName: string]: any // 支持用户自定义属性

  constructor(data: NodeConfig, graphModel: GraphModel) {
    this.graphModel = graphModel
    this.properties = data.properties || {}

    this.initNodeData(data)
    this.setAttributes()
  }

  /**
   * 获取进入当前节点的边和节点
   */
  @computed get incoming(): GraphElements {
    return {
      nodes: this.graphModel.getNodeIncomingNode(this.id),
      edges: this.graphModel.getNodeIncomingEdge(this.id),
    }
  }

  /*
   * 获取离开当前节点的边和节点
   */
  @computed get outgoing(): GraphElements {
    return {
      nodes: this.graphModel.getNodeOutgoingNode(this.id),
      edges: this.graphModel.getNodeOutgoingEdge(this.id),
    }
  }

  /**
   * @overridable 可以重写
   * 初始化节点数据
   * initNodeData和setAttributes的区别在于
   * initNodeData只在节点初始化的时候调用，用于初始化节点的所有属性。
   * setAttributes除了初始化调用外，还会在properties发生变化了调用。
   */
  public initNodeData(data: NodeConfig) {
    const {
      editConfigModel: { nodeTextMode },
    } = this.graphModel
    if (!data.properties) {
      data.properties = {}
    }

    if (!data.id) {
      // 自定义节点id > 全局定义id > 内置
      const { idGenerator } = this.graphModel
      const globalId = idGenerator && idGenerator(data.type)
      const nodeId = this.createId()
      data.id = nodeId || globalId || createUuid()
    }
    if (!data.properties.labelConfig) {
      const {
        editConfigModel: { multipleNodeText, nodeTextVerticle },
      } = this.graphModel
      data.properties.labelConfig = {
        verticle: nodeTextVerticle,
        multiple: multipleNodeText,
      }
    }
    if (!data.textMode) {
      data.textMode = nodeTextMode
    }
    if (data.textMode === TextMode.LABEL) {
      this.formatLabel(data)
    } else {
      this.formatText(data)
    }
    assign(this, pickNodeConfig(data)) // TODO: 确认 constructor 中赋值 properties 是否必要
    const { overlapMode } = this.graphModel
    if (overlapMode === OverlapMode.INCREASE) {
      this.zIndex = data.zIndex || getZIndex()
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
   * @overridable 支持重写
   */
  public setAttributes() {}

  /**
   * @overridable 支持重写，自定义此类型节点默认生成方式
   * @returns string | null
   */
  public createId(): string | null {
    return null
  }

  /**
   * 始化文本属性
   */
  private formatText(data: NodeConfig): void {
    if (!data.text) {
      data.text = {
        value: '',
        x: data.x,
        y: data.y,
        draggable: false,
        editable: true,
      }
    } else {
      if (typeof data.text === 'string') {
        data.text = {
          value: data.text,
          x: data.x,
          y: data.y,
          draggable: false,
          editable: true,
        }
      } else {
        data.text.editable = data.text.editable ?? true
      }
    }
  }

  /**
   * 始化文本属性
   */
  private formatLabel(data): void {
    const { labelConfig } = data.properties
    const defaultPosition = (index = 0) => {
      /**
       * 多文本在节点中的默认位置排列:
       * 中心 -> 左上 -> 右上 -> 左下 -> 右下 -> 中间按y轴堆积
       */
      const width = data.properties.width || this.width
      const height = data.properties.height || this.height
      switch (index) {
        case 0:
          return {
            x: data.x - 10, // 视图层div默认宽高是20
            y: data.y + 20 * index - 10, //如果初始化了多个文本，则在y轴位置上累加
          }
        case 1:
          return {
            x: data.x - width / 2 - 10,
            y: data.y - height / 2 - 10,
          }
        case 2:
          return {
            x: data.x + width / 2 - 10,
            y: data.y - height / 2 - 10,
          }
        case 3:
          return {
            x: data.x - width / 2 - 10,
            y: data.y + height / 2 - 10,
          }
        case 4:
          return {
            x: data.x + width / 2 - 10,
            y: data.y + height / 2 - 10,
          }
        default:
          return {
            x: data.x - 10,
            y: data.y + 20 * (index - 5) - 10,
          }
      }
    }
    if (!data.label || !isArray(data.label)) {
      data.label = []
      return
    }
    // multiple时，判断是否有max，有的话超出max的数据就不存入，没有max就不限制
    // 非multiple时只取第一个作为对象给data.label
    const labelList = data.label.map((item, index) => {
      const defaultText = {
        id: createUuid(),
        relateId: data.id,
        verticle: labelConfig.virtical,
        draggable: false,
        editable: true,
        isFocus: false,
        ...defaultPosition(index),
        ...getNodeTextDeltaPerent(
          defaultPosition(index),
          { x: this.x, y: this.y },
          this.width,
          this.height,
        ),
      }
      if (typeof item === 'string') {
        return {
          ...defaultText,
          value: item,
          content: item,
        }
      }
      return {
        ...defaultText,
        ...item,
        content: item.content || item.value,
        ...getNodeTextDeltaPerent(
          item,
          { x: this.x, y: this.y },
          this.width,
          this.height,
        ),
      }
    })
    if (!isNil(labelConfig.max) && labelConfig.max < labelList.length) {
      console.warn('传入文案数量超出所设置最大值')
    }
    data.label = labelConfig.multiple
      ? slice(
          labelList,
          0,
          isNil(labelConfig.max) || labelConfig.max > labelList.length
            ? labelList.length
            : labelConfig.max,
        )
      : labelList[0]
  }

  /**
   * @overridable 支持重写
   * 计算节点 resize 时
   */
  resize(resizeInfo: ResizeInfo): ResizeNodeData {
    const { width, height, deltaX, deltaY } = resizeInfo
    // 移动节点以及文本内容
    this.move(deltaX / 2, deltaY / 2)

    this.width = width
    this.height = height
    this.setProperties({
      width,
      height,
    })

    return this.getData()
  }

  // TODO: 等比例缩放
  proportionalResize() {}

  /**
   * 获取被保存时返回的数据
   * @overridable 支持重写
   */
  getData(): NodeData {
    const { properties, textMode } = this
    const data: NodeData = {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      properties,
      textMode,
    }
    if (this.rotate) {
      data.rotate = this.rotate
    }
    if (this.graphModel.overlapMode === OverlapMode.INCREASE) {
      data.zIndex = this.zIndex
    }
    if (isObservable(properties)) {
      data.properties = toJS(properties)
    }
    if (textMode === TextMode.LABEL) {
      if (!isArray(this.label)) {
        this.label = []
        data.label = []
      } else {
        data.label = this.label.map((textItem) => {
          const { x, y, value, content } = textItem
          return {
            x,
            y,
            value,
            content,
          }
        })
      }
    } else {
      const { x, y, value } = this.text
      if (value) {
        data.text = {
          x,
          y,
          value,
        }
      }
    }
    return data
  }

  /**
   * 用于在历史记录时获取节点数据，
   * 在某些情况下，如果希望某个属性变化不引起history的变化，
   * 可以重写此方法。
   */
  getHistoryData(): NodeData {
    return this.getData()
  }

  /**
   * 获取当前节点的properties
   */
  getProperties() {
    return toJS(this.properties)
  }

  /**
   * @overridable 支持重写
   * 获取当前节点最外层g标签Attributes, 例如 className
   * @returns 自定义节点样式
   */
  getOuterGAttributes(): LogicFlow.DomAttributes {
    return {
      className: '',
    }
  }

  /**
   * @overridable 支持重写
   * 获取当前节点样式
   * @returns 自定义节点样式
   */
  getNodeStyle(): CommonTheme {
    return {
      ...this.graphModel.theme.baseNode,
      ...this.style,
    }
  }

  /**
   * @overridable 支持重写
   * 获取当前节点文本内容
   */
  getTextShape() {
    return null
  }

  /**
   * @overridable 支持重写
   * 获取当前节点文本样式
   */
  getTextStyle() {
    // 透传 nodeText
    const { nodeText } = this.graphModel.theme
    return cloneDeep(nodeText)
  }

  /**
   * @overridable 支持重写
   * 获取当前节点旋转控制点的样式
   */
  getRotateControlStyle(): CommonTheme {
    const { rotateControl } = this.graphModel.theme
    return cloneDeep(rotateControl)
  }

  /**
   * @overrideable 支持重写
   * 获取当前节点缩放控制节点的样式
   */
  getResizeControlStyle() {
    const { resizeControl } = this.graphModel.theme
    return cloneDeep(resizeControl)
  }

  getResizeOutlineStyle() {
    const { resizeOutline } = this.graphModel.theme
    return cloneDeep(resizeOutline)
  }

  /**
   * @overridable 支持重写
   * 获取当前节点锚点样式
   * @returns 自定义样式
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAnchorStyle(_anchorInfo?: Point): LogicFlow.AnchorTheme {
    const { anchor } = this.graphModel.theme
    // 防止被重写覆盖主题。
    return cloneDeep(anchor)
  }

  /**
   * @overridable 支持重写
   * 获取当前节点锚点拖出连线样式
   * @returns 自定义锚点拖出样式
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAnchorLineStyle(_anchorInfo?: Point): LogicFlow.AnchorLineTheme {
    const { anchorLine } = this.graphModel.theme
    return cloneDeep(anchorLine)
  }

  /**
   * @overridable 支持重写
   * 获取outline样式，重写可以定义此类型节点outline样式， 默认使用主题样式
   * @returns 自定义outline样式
   */
  getOutlineStyle(): LogicFlow.OutlineTheme {
    const { outline } = this.graphModel.theme
    return cloneDeep(outline)
  }

  /**
   * @overridable 在连接边时，是否允许这个节点为 source 节点，边到 target 节点
   * @param target 目标节点
   * @param sourceAnchor 源锚点
   * @param targetAnchor 目标锚点
   * @param edgeId 调整后边的 id，在开启 adjustEdgeStartAndEnd 后调整边连接的节点时会传入
   * 详见：https://github.com/didi/LogicFlow/issues/926#issuecomment-1371823306
   */
  isAllowConnectedAsSource(
    target: BaseNodeModel,
    sourceAnchor?: Model.AnchorConfig,
    targetAnchor?: Model.AnchorConfig,
    edgeId?: string,
  ): Model.ConnectRuleResult {
    const rules = !this.hasSetSourceRules
      ? this.getConnectedSourceRules()
      : this.sourceRules
    this.hasSetSourceRules = true
    let isAllPass = true
    let msg: string = ''
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      if (
        !rule.validate.call(
          this,
          this,
          target,
          sourceAnchor,
          targetAnchor,
          edgeId,
        )
      ) {
        isAllPass = false
        msg = rule.message
        break
      }
    }
    return {
      isAllPass,
      msg,
    }
  }

  /**
   * 获取当前节点作为连接的起始节点规则。
   */
  getConnectedSourceRules(): Model.ConnectRule[] {
    return this.sourceRules
  }

  /**
   * @overridable 在连线时，判断是否允许这个节点为 target 节点
   * @param source 源节点
   * @param sourceAnchor 源锚点
   * @param targetAnchor 目标锚点
   * @param edgeId 调整后边的 id，在开启 adjustEdgeStartAndEnd 后调整边连接的节点时会传入
   * 详见：https://github.com/didi/LogicFlow/issues/926#issuecomment-1371823306
   */
  isAllowConnectedAsTarget(
    source: BaseNodeModel,
    sourceAnchor?: Model.AnchorConfig,
    targetAnchor?: Model.AnchorConfig,
    edgeId?: string,
  ): Model.ConnectRuleResult {
    const rules = !this.hasSetTargetRules
      ? this.getConnectedTargetRules()
      : this.targetRules
    this.hasSetTargetRules = true
    let isAllPass = true
    let msg: string = ''
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      if (
        !rule.validate.call(
          this,
          source,
          this,
          sourceAnchor,
          targetAnchor,
          edgeId,
        )
      ) {
        isAllPass = false
        msg = rule.message
        break
      }
    }
    return {
      isAllPass,
      msg,
    }
  }

  /**
   * 内部方法
   * 是否允许移动节点到新的位置
   */
  isAllowMoveNode(deltaX: number, deltaY: number): boolean | Model.IsAllowMove {
    let isAllowMoveX = true
    let isAllowMoveY = true
    const rules = this.moveRules.concat(this.graphModel.nodeMoveRules)
    for (const rule of rules) {
      const r = rule(this, deltaX, deltaY)
      if (!r) return false
      if (typeof r === 'object') {
        const r1 = r as Model.IsAllowMove
        if (!r1.x && !r1.y) {
          return false
        }
        isAllowMoveX = isAllowMoveX && r1.x
        isAllowMoveY = isAllowMoveY && r1.y
      }
    }
    return {
      x: isAllowMoveX,
      y: isAllowMoveY,
    }
  }

  /**
   * 获取作为连线终点时的所有规则。
   */
  getConnectedTargetRules(): Model.ConnectRule[] {
    return this.targetRules
  }

  /**
   * @returns Point[] 锚点坐标构成的数组
   */
  getAnchorsByOffset(): Model.AnchorConfig[] {
    const { anchorsOffset, id, x, y } = this
    if (anchorsOffset && anchorsOffset.length > 0) {
      return anchorsOffset.map((el, idx) => {
        if (el.length) {
          el = el as LogicFlow.PointTuple // 历史数据格式
          return {
            id: `${id}_${idx}`,
            x: x + el[0],
            y: y + el[1],
          }
        }
        el = el as Model.AnchorConfig
        return {
          ...el,
          x: x + el.x,
          y: y + el.y,
          id: el.id || `${id}_${idx}`,
        }
      })
    }
    return this.getDefaultAnchor()
  }

  /**
   * @overridable 子类重写此方法设置默认锚点
   * 获取节点默认情况下的锚点
   */
  public getDefaultAnchor(): Model.AnchorConfig[] {
    return []
  }

  /**
   * @overridable 子类重写此方法获取手动连接边到节点时，需要连接的锚点
   * 手动连接边到节点时，需要连接的锚点
   */
  public getTargetAnchor(position: Point): Model.AnchorInfo {
    return getClosestAnchor(position, this)
  }

  /**
   * 获取节点BBox
   */
  public getBounds(): Model.BoxBoundsPoint {
    return {
      x1: this.x - this.width / 2,
      y1: this.y - this.height / 2,
      x2: this.x + this.width / 2,
      y2: this.y + this.height / 2,
    }
  }

  get anchors(): Model.AnchorConfig[] {
    const anchors = this.getAnchorsByOffset()
    const { x, y, rotate } = this
    anchors.forEach((anchor) => {
      const { x: anchorX, y: anchorY } = anchor
      const [e, f] = new Matrix([anchorX, anchorY, 1])
        .translate(-x, -y)
        .rotate(rotate)
        .translate(x, y)[0]
      anchor.x = e
      anchor.y = f
    })
    return anchors
  }

  getAnchorInfo(anchorId: string | undefined): AnchorConfig | undefined {
    if (isNil(anchorId)) return undefined

    for (let i = 0; i < this.anchors.length; i++) {
      const anchor = this.anchors[i]
      if (anchor.id === anchorId) {
        return anchor
      }
    }
  }

  @action addNodeMoveRules(fn: Model.NodeMoveRule) {
    if (!this.moveRules.includes(fn)) {
      this.moveRules.push(fn)
    }
  }

  isAllowMoveByXORY(deltaX: number, deltaY: number, isIgnoreRule: boolean) {
    let isAllowMoveX: boolean
    let isAllowMoveY: boolean
    if (isIgnoreRule) {
      isAllowMoveX = true
      isAllowMoveY = true
    } else {
      const r = this.isAllowMoveNode(deltaX, deltaY)
      if (typeof r === 'boolean') {
        isAllowMoveX = r
        isAllowMoveY = r
      } else {
        isAllowMoveX = r.x
        isAllowMoveY = r.y
      }
    }
    return {
      isAllowMoveX,
      isAllowMoveY,
    }
  }

  @action move(deltaX: number, deltaY: number, isIgnoreRule = false): boolean {
    const { isAllowMoveX, isAllowMoveY } = this.isAllowMoveByXORY(
      deltaX,
      deltaY,
      isIgnoreRule,
    )
    if (isAllowMoveX) {
      this.x = this.x + deltaX
      this.textMode === TextMode.TEXT
        ? this.text && this.moveText(deltaX, 0)
        : this.label && this.moveLabel(deltaX, 0)
    }
    if (isAllowMoveY) {
      this.y = this.y + deltaY
      this.textMode === TextMode.TEXT
        ? this.text && this.moveText(0, deltaY)
        : this.label && this.moveLabel(0, deltaY)
    }
    return isAllowMoveX || isAllowMoveY
  }

  @action getMoveDistance(
    deltaX: number,
    deltaY: number,
    isIgnoreRule = false,
  ): [number, number] {
    const { isAllowMoveX, isAllowMoveY } = this.isAllowMoveByXORY(
      deltaX,
      deltaY,
      isIgnoreRule,
    )
    let moveX = 0
    let moveY = 0

    if (isAllowMoveX && deltaX) {
      this.x = this.x + deltaX
      this.textMode === TextMode.TEXT
        ? this.text && this.moveText(deltaX, 0)
        : this.label && this.moveLabel(deltaX, 0)
      moveX = deltaX
    }
    if (isAllowMoveY && deltaY) {
      this.y = this.y + deltaY
      this.textMode === TextMode.TEXT
        ? this.text && this.moveText(0, deltaY)
        : this.label && this.moveLabel(0, deltaY)
      moveY = deltaY
    }
    return [moveX, moveY]
  }

  @action moveTo(x: number, y: number, isIgnoreRule = false): boolean {
    const deltaX = x - this.x
    const deltaY = y - this.y
    if (!isIgnoreRule && !this.isAllowMoveNode(deltaX, deltaY)) return false
    if (this.textMode === TextMode.TEXT) {
      this.moveText(deltaX, deltaY)
    } else {
      this.moveLabel(deltaX, deltaY)
    }
    this.x = x
    this.y = y
    return true
  }

  @action moveText(deltaX: number, deltaY: number): void {
    if (!this.text) return
    const { x, y, value, draggable, editable } = this.text
    this.text = {
      value,
      editable,
      draggable,
      x: x + deltaX,
      y: y + deltaY,
    }
  }

  @action
  moveLabel(deltaX, deltaY, textId?: string): void {
    this.label = this.label.map((item) => {
      if (textId && item.id !== textId) return item
      return {
        ...item,
        x: item.x + deltaX,
        y: item.y + deltaY,
      }
    })
  }

  @action updateText(value: string): void {
    this.text = {
      ...toJS(this.text),
      value,
    }
  }

  @action
  updateLabel(
    value:
      | string
      | {
          content?: string
          value?: string
          x?: number
          y?: number
          isFocus?: boolean
        },
    id?: string,
  ): void {
    const textIndex = findIndex(this.label, (item) => item.id === id)
    if (textIndex < 0) return
    assign(this.label[textIndex], value)
  }

  @action
  addLabel(labelConf: LabelType | { x: number; y: number }): void {
    const { labelConfig } = this.properties
    const { eventCenter } = this.graphModel
    const { multiple = false, max } = labelConfig as LabelConfig
    // 不是多选或者当前文本数量已到最大值时不允许新增文本

    if (!multiple && this.label.length) {
      this.label[0] = {
        ...this.label[0],
        isFocus: true,
      }
      return
    }
    if (multiple && !isNil(max) && this.label.length >= max) {
      eventCenter.emit(EventType.TEXT_NOT_ALLOWED_ADD, {
        data: this.label,
        model: this,
      })
      console.warn('该元素可添加文本已达上限')
      return
    }
    const newLabel = {
      id: createUuid(),
      relateId: this.id,
      value: '',
      content: '',
      draggable: false,
      editable: true,
      x: multiple && max !== 1 ? labelConf.x : this.x - 10,
      y: multiple && max !== 1 ? labelConf.y : this.y - 10,
      isFocus: true,
    }
    this.label.push(newLabel)
    eventCenter.emit(EventType.TEXT_ADD, {
      data: newLabel,
      model: this,
    })
  }

  @action
  deleteLabel(labelInfo: { index?: number; id?: string }): void {
    if (labelInfo.index) {
      this.label.splice(labelInfo.index, 1)
      return
    }
    const textIndex = findIndex(this.label, (item) => item.id === labelInfo.id)
    if (textIndex < 0) return
    this.label.splice(textIndex, 1)
  }

  @action
  setSelected(flag = true): void {
    this.isSelected = flag
  }

  @action setHovered(flag = true): void {
    this.isHovered = flag
    this.setIsShowAnchor(flag)
  }

  @action setIsShowAnchor(flag = true): void {
    this.isShowAnchor = flag
  }

  @action setEnableRotate(flag = true): void {
    this.enableRotate = flag
  }

  @action setEnableResize(flag = true): void {
    this.enableResize = flag
  }

  @action setHitable(flag = true): void {
    this.isHitable = flag
  }

  @action setHittable(flag = true): void {
    this.isHittable = flag
  }

  @action setElementState(
    state: number,
    additionStateData?: Model.AdditionStateDataType,
  ): void {
    this.state = state
    this.additionStateData = additionStateData
  }

  // TODO: 处理重复代码，setProperty 和 setProperties  -> 公用代码提到 updateProperties 中？
  @action setProperty(key: string, val: any): void {
    const preProperties = toJS(this.properties)
    const nextProperties = {
      ...preProperties,
      [key]: formatData(val),
    }
    this.properties = nextProperties
    this.setAttributes()

    // 触发更新节点 properties:change 的事件
    this.graphModel.eventCenter.emit(EventType.NODE_PROPERTIES_CHANGE, {
      id: this.id,
      keys: [key],
      preProperties,
      properties: nextProperties,
    })
  }

  @action setProperties(properties: Record<string, any>): void {
    const preProperties = toJS(this.properties)
    const nextProperties = {
      ...preProperties,
      ...formatData(properties),
    }
    this.properties = nextProperties
    this.setAttributes()

    const updateKeys: string[] = []
    mapKeys(properties, (val, key) => {
      // key 存在于上一个 properties 并且与传入的值不相等 或者 key 不存在于上一个 properties
      if (
        (has(preProperties, key) && preProperties[key] !== val) ||
        !has(preProperties, key)
      ) {
        updateKeys.push(key)
      }
    })

    // 触发更新节点 properties:change 的事件
    this.graphModel.eventCenter.emit(EventType.NODE_PROPERTIES_CHANGE, {
      id: this.id,
      keys: updateKeys,
      preProperties,
      properties: nextProperties,
    })
  }

  @action deleteProperty(key: string): void {
    delete this.properties[key]
    this.setAttributes()
  }

  @action setStyle(key: string, val: any): void {
    this.style = {
      ...this.style,
      [key]: formatData(val),
    }
  }

  @action setStyles(styles: Record<string, any>): void {
    this.style = {
      ...this.style,
      ...formatData(styles),
    }
  }

  @action updateStyles(styles: Record<string, any>): void {
    this.style = {
      ...formatData(styles),
    }
  }

  @action setZIndex(zIndex = 1): void {
    this.zIndex = zIndex
  }

  @action updateAttributes(attributes: any) {
    assign(this, attributes)
  }
}

export namespace BaseNodeModel {
  export type PointTuple = [number, number]
  export type AnchorsOffsetItem = PointTuple | Point
}

export default BaseNodeModel
