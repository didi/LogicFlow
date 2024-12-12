import { assign, cloneDeep, find, isUndefined } from 'lodash-es'
import { action, computed, isObservable, observable, set, toJS } from 'mobx'
import { BaseNodeModel, GraphModel, Model } from '..'
import LogicFlow from '../../LogicFlow'
import {
  createUuid,
  formatData,
  getAnchors,
  getZIndex,
  pickEdgeConfig,
  twoPointDistance,
} from '../../util'
import {
  ElementState,
  ElementType,
  ModelType,
  OverlapMode,
  TextMode,
} from '../../constant'

import Point = LogicFlow.Point
import EdgeData = LogicFlow.EdgeData
import EdgeConfig = LogicFlow.EdgeConfig
import TextConfig = LogicFlow.TextConfig
import PropertiesType = LogicFlow.PropertiesType

export interface IBaseEdgeModel<P extends PropertiesType>
  extends Model.BaseModel<P> {
  /**
   * model 基础类型，固定为 edge
   */
  readonly BaseType: ElementType.EDGE
  properties: P

  sourceNodeId: string
  targetNodeId: string

  startPoint?: Point
  endPoint?: Point
  points: string
  pointsList: Point[]

  isAnimation: boolean
  isDragging?: boolean
  isShowAdjustPoint: boolean // 是否显示边两端的调整点

  sourceAnchorId?: string
  targetAnchorId?: string
  arrowConfig?: LogicFlow.ArrowConfig
}

export class BaseEdgeModel<P extends PropertiesType = PropertiesType>
  implements IBaseEdgeModel<P>
{
  readonly BaseType = ElementType.EDGE
  static BaseType: ElementType = ElementType.EDGE

  // 数据属性
  public id = ''
  @observable type = ''
  @observable sourceNodeId = ''
  @observable targetNodeId = ''
  @observable startPoint!: Point
  @observable endPoint!: Point

  @observable textMode = TextMode.TEXT
  @observable text: Required<TextConfig> = {
    value: '',
    x: 0,
    y: 0,
    draggable: false,
    editable: true,
  }
  @observable properties: P
  @observable points = ''
  @observable pointsList: Point[] = []

  // 状态属性
  virtual = false
  @observable isSelected = false
  @observable isHovered = false
  @observable isHitable = true // 细粒度控制边是否对用户操作进行反应
  @observable isHittable = true // 细粒度控制边是否对用户操作进行反应
  @observable draggable = true
  @observable visible = true

  // 边特有属性，动画及调整点
  @observable isAnimation = false
  @observable isShowAdjustPoint = false // 是否显示边两端的调整点
  isDragging?: boolean
  // 引用属性
  graphModel: GraphModel
  @observable zIndex: number = 0
  @observable state = ElementState.DEFAULT
  modelType = ModelType.EDGE
  additionStateData?: Model.AdditionStateDataType

  sourceAnchorId?: string
  targetAnchorId?: string

  menu?: LogicFlow.MenuConfig[]
  customTextPosition = false // 是否自定义边文本位置
  @observable style: LogicFlow.CommonTheme = {} // 每条边自己的样式，动态修改

  // TODO: 每个边独立生成一个marker没必要
  // 箭头属性
  @observable arrowConfig: LogicFlow.ArrowConfig = {
    markerEnd: `url(#marker-end-${this.id})`,
    markerStart: `url(#marker-start-${this.id})`,
  };
  [propName: string]: unknown // 支持自定义

  constructor(data: EdgeConfig<P>, graphModel: GraphModel) {
    this.graphModel = graphModel
    this.properties = data.properties ?? ({} as P)

    this.initEdgeData(data)
    this.setAttributes()
  }

  /**
   * 初始化边数据
   * @overridable 支持重写
   * initNodeData和setAttributes的区别在于
   * initNodeData只在节点初始化的时候调用，用于初始化节点的所有属性。
   * setAttributes除了初始化调用外，还会在properties发生变化后调用。
   */
  initEdgeData(data: EdgeConfig) {
    if (!data.properties) {
      data.properties = {}
    }

    if (!data.id) {
      // 自定义边id > 全局定义边id > 内置
      const { idGenerator } = this.graphModel
      const globalId = idGenerator && idGenerator(data.type)
      const nodeId = this.createId()
      data.id = nodeId || globalId || createUuid()
    }
    this.arrowConfig.markerEnd = `url(#marker-end-${data.id})`
    this.arrowConfig.markerStart = `url(#marker-start-${data.id})`
    const {
      editConfigModel: { adjustEdgeStartAndEnd },
    } = this.graphModel
    this.isShowAdjustPoint = adjustEdgeStartAndEnd
    assign(this, pickEdgeConfig(data))
    const { overlapMode } = this.graphModel
    if (overlapMode === OverlapMode.INCREASE) {
      this.zIndex = data.zIndex || getZIndex()
    }
    // 设置边的 anchors，也就是边的两个端点
    // 端点依赖于 edgeData 的 sourceNode 和 targetNode
    this.setAnchors()
    // 边的拐点依赖于两个端点
    this.initPoints()
    // 文本位置依赖于边上的所有拐点
    this.formatText(data)
  }

  /**
   * 设置model属性
   * @overridable 支持重写
   * 每次properties发生变化会触发
   */
  setAttributes() {}

  createId(): string | null {
    return null
  }

  /**
   * 自定义边样式
   *
   * @overridable 支持重写
   * @returns 自定义边样式
   */
  getEdgeStyle(): LogicFlow.EdgeTheme {
    return {
      ...this.graphModel.theme.baseEdge,
      ...this.style,
    }
  }

  /**
   * 自定义边调整点样式
   *
   * @overridable 支持重写
   * 在isShowAdjustPoint为true时会显示调整点。
   */
  getAdjustPointStyle() {
    return {
      ...this.graphModel.theme.edgeAdjust,
    }
  }
  /**
   * 自定义边文本样式
   *
   * @overridable 支持重写
   */
  getTextStyle() {
    // 透传 edgeText
    const { edgeText } = this.graphModel.theme
    return cloneDeep(edgeText)
  }

  /**
   * 自定义边动画样式
   *
   * @overridable 支持重写
   * @example
   * getEdgeAnimationStyle() {
   *   const style = super.getEdgeAnimationStyle()
   *   style.stroke = 'blue'
   *   style.animationDuration = '30s'
   *   style.animationDirection = 'reverse'
   *   return style
   * }
   */
  getEdgeAnimationStyle() {
    const { edgeAnimation } = this.graphModel.theme
    return cloneDeep(edgeAnimation)
  }

  /**
   * 自定义边箭头样式
   *
   * @overridable 支持重写
   * @example
   * getArrowStyle() {
   *   const style = super.getArrowStyle()
   *   style.stroke = 'green'
   *   return style
   * }
   */
  getArrowStyle(): LogicFlow.ArrowTheme {
    const edgeStyle = this.getEdgeStyle()
    const edgeAnimationStyle = this.getEdgeAnimationStyle()
    const { arrow } = this.graphModel.theme
    const stroke = this.isAnimation
      ? edgeAnimationStyle.stroke
      : edgeStyle.stroke
    return {
      ...edgeStyle,
      fill: stroke,
      stroke,
      ...arrow,
    }
  }

  /**
   * 自定义边被选中时展示其范围的矩形框样式
   *
   * @overridable 支持重写
   * @example
   * // 隐藏outline
   * getOutlineStyle() {
   *   const style = super.getOutlineStyle()
   *   style.stroke = "none"
   *   style.hover.stroke = "none"
   *   return style
   * }
   */
  getOutlineStyle(): LogicFlow.OutlineTheme {
    const { graphModel } = this
    const { outline } = graphModel.theme
    return cloneDeep(outline)
  }

  /**
   * 重新自定义文本位置
   *
   * @overridable 支持重写
   */
  getTextPosition(): Point {
    return {
      x: 0,
      y: 0,
    }
  }

  /**
   * 边的前一个节点
   */
  @computed get sourceNode() {
    return this.graphModel?.nodesMap[this.sourceNodeId]?.model
  }

  /**
   * 边的后一个节点
   */
  @computed get targetNode() {
    return this.graphModel?.nodesMap[this.targetNodeId]?.model
  }

  @computed get textPosition(): Point {
    return this.getTextPosition()
  }

  /**
   * 内部方法，计算两个节点相连时的起点位置
   */
  getBeginAnchor(
    sourceNode: BaseNodeModel,
    targetNode: BaseNodeModel,
    sourceAnchorId?: string,
  ): Point | undefined {
    // https://github.com/didi/LogicFlow/issues/1077
    // 可能拿到的sourceAnchors为空数组，因此position可能返回为undefined
    let position: Point | undefined
    let minDistance: number | undefined
    const sourceAnchors = getAnchors(sourceNode)
    if (sourceAnchorId) {
      position = find(sourceAnchors, (anchor) => anchor.id === sourceAnchorId)
      // 如果指定了起始锚点，且指定锚点是节点拥有的锚点时，就把该点设置为起点
      if (position) {
        return position
      }
      console.warn(
        `未在节点上找到指定的起点锚点${sourceAnchorId}，已使用默认锚点作为起点`,
      )
    }
    sourceAnchors.forEach((anchor) => {
      const distance = twoPointDistance(anchor, targetNode)
      if (minDistance === undefined) {
        minDistance = distance
        position = anchor
      } else if (distance < minDistance) {
        minDistance = distance
        position = anchor
      }
    })
    return position
  }

  /**
   * 内部方法，计算两个节点相连时的终点位置
   */
  getEndAnchor(
    targetNode: BaseNodeModel,
    targetAnchorId?: string,
  ): Point | undefined {
    // https://github.com/didi/LogicFlow/issues/1077
    // 可能拿到的targetAnchors为空数组，因此position可能返回为undefined
    let position: Point | undefined
    let minDistance: number | undefined
    const targetAnchors = getAnchors(targetNode)
    if (targetAnchorId) {
      position = find(targetAnchors, (anchor) => anchor.id === targetAnchorId)
      // 如果指定了终点锚点，且指定锚点是节点拥有的锚点时，就把该点设置为终点
      if (position) {
        return position
      }
      console.warn(
        `未在节点上找到指定的终点锚点${targetAnchorId}，已使用默认锚点作为终点`,
      )
    }
    targetAnchors.forEach((anchor) => {
      if (!this.startPoint) return // 如果此时 this.startPoint 为 undefined，直接返回

      const distance = twoPointDistance(anchor, this.startPoint)
      if (minDistance === undefined) {
        minDistance = distance
        position = anchor
      } else if (distance < minDistance) {
        minDistance = distance
        position = anchor
      }
    })
    return position
  }

  /**
   * 获取当前边的properties
   */
  getProperties() {
    return toJS(this.properties)
  }

  /**
   * 获取被保存时返回的数据
   *
   * @overridable 支持重写
   */
  getData(): EdgeData {
    let { properties } = this
    if (isObservable(properties)) {
      properties = toJS(properties)
    }
    const data: EdgeData = {
      id: this.id,
      type: this.type,
      properties,
      sourceNodeId: this.sourceNodeId,
      targetNodeId: this.targetNodeId,
      sourceAnchorId: this.sourceAnchorId,
      targetAnchorId: this.targetAnchorId,
      startPoint: assign({}, this.startPoint),
      endPoint: assign({}, this.endPoint),
    }
    if (this.graphModel.overlapMode === OverlapMode.INCREASE) {
      data.zIndex = this.zIndex
    }
    const { x, y, value } = this.text
    if (value) {
      data.text = {
        x,
        y,
        value,
      }
    }
    return data
  }

  /**
   * 获取边的数据
   *
   * @overridable 支持重写
   * 用于在历史记录时获取节点数据。
   * 在某些情况下，如果希望某个属性变化不引起history的变化，
   * 可以重写此方法。
   */
  getHistoryData(): EdgeData {
    return this.getData()
  }

  /**
   * 设置边的属性，会触发重新渲染
   * @param key 属性名
   * @param val 属性值
   */
  @action setProperty(key: string, val: any): void {
    set(this.properties, key, formatData(val))
    this.setAttributes()
  }

  /**
   * 删除边的属性，会触发重新渲染
   * @param key 属性名
   */
  @action deleteProperty(key: string): void {
    delete this.properties[key]
    this.setAttributes()
  }

  /**
   * 设置边的属性，会触发重新渲染
   * @param properties 要更新的 properties，会做合并
   */
  @action
  setProperties(properties: Record<string, any>): void {
    this.properties = {
      ...toJS(this.properties),
      ...formatData(properties),
    }
    this.setAttributes()
  }

  /**
   * 修改边的id
   */
  @action
  changeEdgeId(id: string) {
    const { markerEnd, markerStart } = this.arrowConfig
    if (markerStart && markerStart === `url(#marker-start-${this.id})`) {
      this.arrowConfig.markerStart = `url(#marker-start-${id})`
    }
    if (markerEnd && markerEnd === `url(#marker-end-${this.id})`) {
      this.arrowConfig.markerEnd = `url(#marker-end-${id})`
    }
    this.id = id
  }

  /**
   * 设置边样式，用于插件开发时跳过自定义边的渲染。大多数情况下，不需要使用此方法。
   * 如果需要设置边的样式，请使用 getEdgeStyle 方法自定义边样式。
   */
  @action
  setStyle(key: string, val): void {
    this.style = {
      ...this.style,
      [key]: formatData(val),
    }
  }

  /**
   * 设置边样式，用于插件开发时跳过自定义边的渲染。大多数情况下，不需要使用此方法。
   * 如果需要设置边的样式，请使用 getEdgeStyle 方法自定义边样式。
   */
  @action
  setStyles(styles): void {
    this.style = {
      ...this.style,
      ...formatData(styles),
    }
  }

  /**
   * 设置边样式，用于插件开发时跳过自定义边的渲染。大多数情况下，不需要使用此方法。
   * 如果需要设置边的样式，请使用 getEdgeStyle 方法自定义边样式。
   */
  @action
  updateStyles(styles): void {
    this.style = {
      ...formatData(styles),
    }
  }

  /**
   * 设置当前元素的文本模式
   * @param mode
   */
  @action setTextMode(mode: TextMode) {
    this.textMode = mode
  }

  /**
   * 内部方法，处理初始化文本格式
   */
  @action formatText(data: EdgeConfig) {
    const {
      editConfigModel: { edgeTextDraggable, edgeTextEdit },
    } = this.graphModel
    const { x, y } = this.textPosition
    const { text } = data
    let textConfig: Required<TextConfig> = {
      value: '',
      x,
      y,
      draggable: edgeTextDraggable,
      editable: edgeTextEdit,
    }

    if (text) {
      if (typeof text === 'string') {
        textConfig = {
          ...textConfig,
          value: text,
        }
      } else {
        textConfig = {
          ...textConfig,
          x: text.x ?? x,
          y: text.y ?? y,
          value: text.value ?? '',
        }
        if (!isUndefined(text.draggable)) {
          textConfig.draggable = text.draggable
        }
        if (!isUndefined(text.editable)) {
          textConfig.editable = text.editable
        }
      }
    }
    this.text = textConfig
  }
  /**
   * 重置文本位置
   */
  @action resetTextPosition() {
    const { x, y } = this.textPosition
    this.text.x = x
    this.text.y = y
  }

  /**
   * 移动边上的文本
   */
  @action moveText(deltaX: number, deltaY: number): void {
    const { x, y, value, draggable, editable } = this.text
    this.text = {
      value,
      editable,
      draggable,
      x: x + deltaX,
      y: y + deltaY,
    }
  }

  /**
   * 设置文本位置和值
   */
  @action setText(textConfig: LogicFlow.TextConfig): void {
    if (textConfig) {
      assign(this.text, textConfig)
    }
  }

  /**
   * 更新文本的值
   */
  @action updateText(value: string): void {
    this.text = {
      ...toJS(this.text),
      value,
    }
  }

  /**
   * 内部方法，计算边的起点和终点和其对于的锚点Id
   */
  @action
  setAnchors(): void {
    if (!this.sourceAnchorId || !this.startPoint) {
      const anchor = this.getBeginAnchor(
        this.sourceNode,
        this.targetNode,
        this.sourceAnchorId,
      )
      if (!anchor) {
        // https://github.com/didi/LogicFlow/issues/1077
        // 当用户自定义getDefaultAnchor(){return []}时，表示：不显示锚点，也不允许其他节点连接到此节点
        // 此时拿到的anchor=undefined，下面会直接报错
        throw new Error(
          '无法获取beginAnchor，请检查anchors相关逻辑，anchors不能为空',
        )
      }
      if (!this.startPoint) {
        this.startPoint = {
          x: anchor.x,
          y: anchor.y,
        }
      }
      if (!this.sourceAnchorId) {
        this.sourceAnchorId = anchor.id
      }
    }
    if (!this.targetAnchorId || !this.endPoint) {
      const anchor = this.getEndAnchor(this.targetNode, this.targetAnchorId)
      if (!anchor) {
        // https://github.com/didi/LogicFlow/issues/1077
        // 当用户自定义getDefaultAnchor(){return []}时，表示：不显示锚点，也不允许其他节点连接到此节点
        // 此时拿到的anchor=undefined，下面会直接报错
        throw new Error(
          '无法获取endAnchor，请检查anchors相关逻辑，anchors不能为空',
        )
      }
      if (!this.endPoint) {
        this.endPoint = {
          x: anchor.x,
          y: anchor.y,
        }
      }
      if (!this.targetAnchorId) {
        this.targetAnchorId = anchor.id
      }
    }
  }

  @action
  setSelected(flag = true): void {
    this.isSelected = flag
  }

  @action
  setHovered(flag = true): void {
    this.isHovered = flag
  }

  @action
  setHitable(flag = true): void {
    this.isHitable = flag
  }

  @action
  setHittable(flag = true): void {
    this.isHittable = flag
  }

  @action
  openEdgeAnimation(): void {
    this.isAnimation = true
  }

  @action
  closeEdgeAnimation(): void {
    this.isAnimation = false
  }

  @action
  setElementState(
    state: ElementState,
    additionStateData?: Model.AdditionStateDataType,
  ): void {
    this.state = state
    this.additionStateData = additionStateData
  }

  @action
  updateStartPoint(anchor: Point): void {
    this.startPoint = anchor
  }

  @action
  moveStartPoint(deltaX: number, deltaY: number): void {
    if (this.startPoint) {
      this.startPoint.x += deltaX
      this.startPoint.y += deltaY
    }
  }

  @action
  updateEndPoint(anchor: Point): void {
    this.endPoint = anchor
  }

  @action
  moveEndPoint(deltaX: number, deltaY: number): void {
    if (this.endPoint) {
      this.endPoint.x += deltaX
      this.endPoint.y += deltaY
    }
  }

  @action
  setZIndex(zIndex = 0): void {
    this.zIndex = zIndex
  }

  @action
  initPoints() {}

  @action
  updateAttributes(attributes) {
    assign(this, attributes)
  }

  // 获取边调整的起点
  @action
  getAdjustStart() {
    return this.startPoint
  }

  // 获取边调整的终点
  @action
  getAdjustEnd() {
    return this.endPoint
  }

  // 起终点拖拽调整过程中，进行直线路径更新
  @action
  updateAfterAdjustStartAndEnd({
    startPoint,
    endPoint,
  }: Record<'startPoint' | 'endPoint', Point>) {
    this.updateStartPoint({ x: startPoint.x, y: startPoint.y })
    this.updateEndPoint({ x: endPoint.x, y: endPoint.y })
  }
}

export default BaseEdgeModel
