import {
  assign,
  cloneDeep,
  find,
  findIndex,
  isObject,
  isArray,
  isNil,
  slice,
} from 'lodash-es'
import { action, computed, observable, toJS } from 'mobx'
import { BaseNodeModel, GraphModel, Model } from '..'
import LogicFlow from '../../LogicFlow'
import {
  createUuid,
  formatData,
  getAnchors,
  getZIndex,
  pickEdgeConfig,
  twoPointDistance,
  getEdgeTextDeltaPerent,
} from '../../util'
import {
  ElementState,
  ElementType,
  EventType,
  ModelType,
  OverlapMode,
} from '../../constant'

import Point = LogicFlow.Point
import EdgeData = LogicFlow.EdgeData
import EdgeConfig = LogicFlow.EdgeConfig
import LabelType = LogicFlow.LabelType
import LabelConfig = LogicFlow.LabelConfig

export interface IBaseEdgeModel extends Model.BaseModel {
  /**
   * model 基础类型，固定为 edge
   */
  readonly BaseType: ElementType.EDGE

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

export class BaseEdgeModel implements IBaseEdgeModel {
  readonly BaseType = ElementType.EDGE
  static BaseType: ElementType = ElementType.EDGE

  // 数据属性
  public id = ''
  @observable type = ''
  @observable sourceNodeId = ''
  @observable targetNodeId = ''
  @observable startPoint!: Point
  @observable endPoint!: Point

  @observable text: LabelType | LabelType[] = {
    value: '',
    x: 0,
    y: 0,
    draggable: false,
    editable: true,
    content: '',
  }
  @observable properties: Record<string, unknown> = {
    labelConfig: {
      multiple: false,
      verticle: false,
      max: 1,
    },
  }
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

  constructor(data: EdgeConfig, graphModel: GraphModel) {
    this.graphModel = graphModel
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
    if (!data.properties.labelConfig) {
      const {
        editConfigModel: { multipleEdgeText, edgeTextVerticle },
      } = this.graphModel
      data.properties.labelConfig = {
        verticle: edgeTextVerticle,
        multiple: multipleEdgeText,
      }
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
   * @overridable 支持重写
   * 获取当前节点文本内容
   */
  getTextShape() {
    return null
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
    const data: EdgeData = {
      id: this.id,
      type: this.type,
      sourceNodeId: this.sourceNode.id,
      targetNodeId: this.targetNode.id,
      startPoint: assign({}, this.startPoint),
      endPoint: assign({}, this.endPoint),
      properties: toJS(this.properties),
    }
    if (this.graphModel.overlapMode === OverlapMode.INCREASE) {
      data.zIndex = this.zIndex
    }
    if (isObject(this.text)) {
      const { x, y, value, content } = this.text as LabelType
      if (value) {
        data.text = {
          x,
          y,
          value,
          content,
        }
      }
    }
    if (isArray(this.text)) {
      data.text = (this.text as LabelType[]).map((textItem) => {
        const { x, y, value, content } = textItem
        return {
          x,
          y,
          value,
          content,
        }
      })
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
  @action
  setProperty(key: string, val: any): void {
    this.properties[key] = formatData(val)
    this.setAttributes()
  }
  /**
   * 删除边的属性，会触发重新渲染
   * @param key 属性名
   */
  @action
  deleteProperty(key: string): void {
    delete this.properties[key]
    this.setAttributes()
  }
  /**
   * 设置边的属性，会触发重新渲染
   * @param key 属性名
   * @param val 属性值
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
   * 内部方法，处理初始化文本格式
   */
  @action formatText(data): void {
    const { x, y } = this.textPosition
    const { labelConfig } = data.properties
    const defaultPosition = (index = 0) => ({
      x: x - 10, // 视图层div默认宽高是20
      y: y - 10 + 20 * index, //如果初始化了多个文本，则在y轴位置上累加
    })
    console.log('data', data, this.startPoint, this.endPoint)
    if (!data.text) {
      // 单文本情况下，没有就初始化一个
      // 多文本情况下，没有就是没有
      this.text = labelConfig.multiple
        ? []
        : {
            id: createUuid(),
            relateId: data.id,
            value: '',
            content: '',
            verticle: labelConfig.verticle,
            draggable: false,
            editable: true,
            isFocus: false,
            ...defaultPosition(),
            ...getEdgeTextDeltaPerent(
              defaultPosition(),
              this.startPoint,
              this.endPoint,
            ),
          }
    }
    // 如果初始化传入的是字符串，转成对象再根据是否multiple决定是作为数组赋值还是对象复杂
    if (typeof data.text === 'string') {
      const text = {
        id: createUuid(),
        relateId: data.id,
        value: data.text,
        content: `<p>${data.text}</p>`,
        verticle: labelConfig.verticle,
        draggable: false,
        editable: true,
        isFocus: false,
        ...defaultPosition(),
        ...getEdgeTextDeltaPerent(
          defaultPosition(),
          this.startPoint,
          this.endPoint,
        ),
      }
      this.text = labelConfig.multiple ? [text] : text
    }
    // 如果初始化传入的是对象，判断是否multiple
    // 非multiple时文本位置固定在节点中间
    // multiple时不限制文本位置，作为数组赋值给data.text
    if (isObject(data.text)) {
      const formatedText = {
        id: createUuid(),
        isFocus: false,
        ...data.text,
        content: data.text.content || data.text.value,
        ...defaultPosition(),
        ...getEdgeTextDeltaPerent(
          defaultPosition(),
          this.startPoint,
          this.endPoint,
        ),
      }
      this.text = labelConfig.multiple ? [formatedText] : formatedText
    }
    // multiple时，判断是否有max，有的话超出max的数据就不存入，没有max就不限制
    // 非multiple时只取第一个作为对象给data.text
    if (isArray(data.text)) {
      const textList = data.text.map((item, index) => {
        if (typeof item === 'string') {
          return {
            id: createUuid(),
            relateId: data.id,
            value: item,
            content: item,
            verticle: labelConfig.virtical,
            draggable: false,
            editable: true,
            isFocus: false,
            ...defaultPosition(index),
            ...getEdgeTextDeltaPerent(
              defaultPosition(index),
              this.startPoint,
              this.endPoint,
            ),
          }
        }
        return {
          id: createUuid(),
          ...item,
          content: item.content || item.value,
          ...getEdgeTextDeltaPerent(item, this.startPoint, this.endPoint),
        }
      })
      this.text = labelConfig.multiple
        ? slice(
            textList,
            0,
            isNil(labelConfig.max) || labelConfig.max > textList.length
              ? textList.length
              : labelConfig?.max,
          )
        : textList[0]
    }
  }
  /**
   * 重置文本位置
   */
  @action resetTextPosition() {
    const { x, y } = this.textPosition
    const { labelConfig } = this.properties
    if (!(labelConfig as LabelConfig)?.multiple) {
      ;(this.text as LabelType).x = x
      ;(this.text as LabelType).y = y
    }
  }
  /**
   * 移动边上的文本
   */
  @action moveText(deltaX, deltaY, textId?: string): void {
    const { labelConfig } = this.properties
    if ((labelConfig as LabelConfig)?.multiple && isArray(this.text)) {
      this.text = (this.text as LabelType[]).map((item: LabelType) => {
        if (textId && item.id !== textId) return item
        return {
          ...item,
          x: item.x + deltaX,
          y: item.y + deltaY,
        }
      })
      return
    }
    if (!(labelConfig as LabelConfig)?.multiple && isObject(this.text)) {
      const { x, y, id } = this.text as LabelType
      if (textId && id !== textId) return
      this.text = {
        ...this.text,
        x: x + deltaX,
        y: y + deltaY,
      }
      return
    }
  }
  /**
   * 设置文本位置和值
   */
  @action setText(textConfig: LabelType, id?: string): void {
    const { labelConfig } = this.properties
    if (!textConfig) return
    if (!(labelConfig as LabelConfig)?.multiple) {
      if (isArray(this.text)) return
      assign(this.text, textConfig)
      return
    }
    // 多个文本的情况下，不指定id就不修改
    if (!id) return
    const targetIndex = findIndex(
      this.text as LabelType[],
      (item) => item.id === id,
    )
    if (targetIndex < 0) return
    assign(this.text[targetIndex], textConfig)
  }
  /**
   * 更新文本的值
   */
  @action updateText(
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
    const { labelConfig } = this.properties
    const { eventCenter } = this.graphModel
    if (!(labelConfig as LabelConfig)?.multiple) {
      this.text =
        typeof value === 'string'
          ? {
              ...toJS(this.text),
              value,
              content: value,
              isFocus: false,
            }
          : assign(this.text, value)
    } else if (isArray(this.text) && id) {
      const textIndex = findIndex(this.text, (item) => item.id === id)
      if (textIndex < 0) return
      this.text[textIndex] = assign(this.text[textIndex], value)
    }
    eventCenter.emit(EventType.TEXT_UPDATE, {
      data: this.text,
      model: this,
    })
  }

  @action
  addText(labelConf: LabelType | { x: number; y: number }): void {
    const { labelConfig } = this.properties
    const { eventCenter } = this.graphModel
    const { multiple = false, max } = labelConfig as LabelConfig
    // 当前文本数量已到最大值时不允许新增文本
    if (multiple && !isNil(max) && this.text.length >= max) {
      eventCenter.emit(EventType.TEXT_NOT_ALLOWED_ADD, {
        data: this.text,
        model: this,
      })
      console.warn('该元素可添加文本已达上限')
      return
    }
    if ((labelConfig as LabelConfig)?.multiple) {
      const newText = {
        id: createUuid(),
        relateId: this.id,
        value: 'new Text',
        content: 'new Text',
        draggable: false,
        editable: true,
        x: (labelConfig as LabelConfig)?.multiple
          ? labelConf.x
          : this.textPosition.x - 10,
        y: (labelConfig as LabelConfig)?.multiple
          ? labelConf.y
          : this.textPosition.y - 10,
        isFocus: true,
      }
      this.text.push(newText)
    } else {
      this.text = {
        ...toJS(this.text),
        isFocus: true,
      }
    }
    console.log('this.text', this.text)
    eventCenter.emit(EventType.TEXT_ADD, {
      data: this.text,
      model: this,
    })
  }

  @action
  deleteText(labelInfo: { index?: number; id?: string }): void {
    const { eventCenter } = this.graphModel
    if (!isArray(this.text) && labelInfo?.id === this.text.id) {
      assign(this.text, {
        value: '',
        content: '',
      })
      eventCenter.emit(EventType.TEXT_CLEAR, {
        data: this.text,
        model: this,
      })
      return
    }
    if (labelInfo.index) {
      this.text.splice(labelInfo.index, 1)
      return
    }
    const labelIndex = findIndex(
      this.text as LabelType[],
      (item) => item.id === labelInfo.id,
    )
    if (labelIndex < 0) return
    this.text.splice(labelIndex, 1)
    eventCenter.emit(EventType.TEXT_DELETE, {
      data: this.text,
      model: this,
    })
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
