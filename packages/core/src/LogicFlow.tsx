import { createElement as h, render, Component } from 'preact/compat'
import { observer } from 'mobx-preact'
import { Options as LFOptions } from './options'
import {
  BaseNodeModel,
  BaseEdgeModel,
  GraphModel,
  SnaplineModel,
  ZoomParamType,
} from './model'

import Graph from './view/Graph'
import * as _Model from './model'
import * as _View from './view'
import { formatData } from './util'

import Dnd from './view/behavior/DnD'
import Tool from './tool/tool'
import { snapline } from './tool'
import Keyboard from './keyboard'
import History from './history/History'
import { CallbackType } from './event/eventEmitter'

import { EditConfigInterface } from './model'
import { ElementType, EventType } from './constant'
import { initDefaultShortcut } from './keyboard/shortcut'

import Extension = LogicFlow.Extension
import RegisteredExtension = LogicFlow.RegisteredExtension
import ExtensionConstructor = LogicFlow.ExtensionConstructor
import GraphConfigData = LogicFlow.GraphConfigData
import RegisterConfig = LogicFlow.RegisterConfig
import RegisterParam = LogicFlow.RegisterParam
import NodeConfig = LogicFlow.NodeConfig
import EdgeConfig = LogicFlow.EdgeConfig
import EdgeData = LogicFlow.EdgeData
import GraphElements = LogicFlow.GraphElements
import PointTuple = LogicFlow.PointTuple
import ExtensionRender = LogicFlow.ExtensionRender
import RegisterElementFunc = LogicFlow.RegisterElementFunc
import FocusOnParams = LogicFlow.FocusOnParams

const pluginFlag = Symbol('plugin registered by Logicflow.use')

export class LogicFlow {
  // 只读：logicflow实例挂载的容器。
  readonly container: HTMLElement
  // 只读：控制整个 LogicFlow 画布的model
  readonly graphModel: GraphModel

  viewMap: Map<string, Component> = new Map()
  history: History
  keyboard: Keyboard
  dnd: Dnd
  tool: Tool
  snaplineModel?: SnaplineModel

  /**
   * 只读：控制上一步、下一步相关
   */

  readonly options: LFOptions.Definition
  components: ExtensionRender[] = []
  // 个性配置的插件，覆盖全局配置的插件
  readonly plugins: ExtensionConstructor[]
  // 全局配置的插件，所有的LogicFlow示例都会使用
  static extensions: Map<string, RegisteredExtension> = new Map()
  // 插件扩展方法
  extension: Record<string, Extension> = {}

  readonly width?: number // 只读：画布宽度
  readonly height?: number // 只读：画布高度

  /**
   * 自定义数据转换方法
   * 当接入系统格式和 LogicFlow 数据格式不一致时，可自定义此方法来进行数据格式转换
   * 详情请参考 adapter docs
   * 包括 adapterIn 和 adapterOut 两个方法
   */
  private adapterIn?: (data: unknown) => GraphConfigData
  private adapterOut?: (data: GraphConfigData, ...rest: any) => unknown;

  // 支持插件在 LogicFlow 实例上增加自定义方法
  [propName: string]: any

  protected get [Symbol.toStringTag]() {
    return LogicFlow.toStringTag
  }

  constructor(options: LFOptions.Common) {
    options = LFOptions.get(options)
    this.options = options
    this.container = this.initContainer(options.container)
    this.plugins = options.plugins ?? []
    // model 初始化
    this.graphModel = new GraphModel({
      ...options,
    })
    // 附加功能初始化
    this.tool = new Tool(this)
    this.history = new History(this.graphModel.eventCenter)
    this.dnd = new Dnd({ lf: this })
    this.keyboard = new Keyboard({
      lf: this,
      keyboard: options.keyboard,
    })
    // 不可编辑模式没有开启，且没有关闭对齐线
    if (options.snapline !== false) {
      this.snaplineModel = new SnaplineModel(this.graphModel)
      snapline(this.graphModel.eventCenter, this.snaplineModel)
    }
    if (!this.options.isSilentMode) {
      // 先初始化默认内置快捷键
      initDefaultShortcut(this, this.graphModel)
      // 然后再初始化自定义快捷键，自定义快捷键可以覆盖默认快捷键.
      // 插件最后初始化。方便插件强制覆盖内置快捷键
      this.keyboard.initShortcuts()
    }
    // init 放到最后
    this.defaultRegister()
    this.installPlugins(options.disabledPlugins)
  }

  /**
   * 注册自定义节点和边
   * 支持两种方式
   * 方式一（推荐）
   * 详情见 todo: docs link
   * @example
   * import { RectNode, RectModel } from '@logicflow/core'
   * class CustomView extends RectNode {
   * }
   * class CustomModel extends RectModel {
   * }
   * lf.register({
   *   type: 'custom',
   *   view: CustomView,
   *   model: CustomModel
   * })
   * 方式二
   * 不推荐，极个别在自定义的时候需要用到lf的情况下可以用这种方式。
   * 大多数情况下，我们可以直接在view中从this.props中获取graphModel
   * 或者model中直接this.graphModel获取model的方法。
   * @example
   * lf.register('custom', ({ RectNode, RectModel }) => {
   *    class CustomView extends RectNode {}
   *    class CustomModel extends RectModel {}
   *    return {
   *      view: CustomView,
   *      model: CustomModel
   *    }
   * })
   */
  register(
    type: string | RegisterConfig,
    fn?: RegisterElementFunc,
    isObserverView = true,
  ) {
    // 方式1
    if (typeof type !== 'string') {
      this.registerElement(type)
      return
    }
    const registerParam: RegisterParam = {
      BaseEdge: _View.BaseEdge,
      BaseEdgeModel: _Model.BaseEdgeModel,
      BaseNode: _View.BaseNode,
      BaseNodeModel: _Model.BaseNodeModel,
      RectNode: _View.RectNode,
      RectNodeModel: _Model.RectNodeModel,
      CircleNode: _View.CircleNode,
      CircleNodeModel: _Model.CircleNodeModel,
      PolygonNode: _View.PolygonNode,
      PolygonNodeModel: _Model.PolygonNodeModel,
      TextNode: _View.TextNode,
      TextNodeModel: _Model.TextNodeModel,
      LineEdge: _View.LineEdge,
      LineEdgeModel: _Model.LineEdgeModel,
      DiamondNode: _View.DiamondNode,
      DiamondNodeModel: _Model.DiamondNodeModel,
      PolylineEdge: _View.PolylineEdge,
      PolylineEdgeModel: _Model.PolylineEdgeModel,
      BezierEdge: _View.BezierEdge,
      BezierEdgeModel: _Model.BezierEdgeModel,
      EllipseNode: _View.EllipseNode,
      EllipseNodeModel: _Model.EllipseNodeModel,
      HtmlNode: _View.HtmlNode,
      HtmlNodeModel: _Model.HtmlNodeModel,
      // mobx,
      h,
      type,
    }
    // 为了能让后来注册的可以继承前面注册的
    // 例如我注册一个”开始节点“
    // 然后我再想注册一个”立即开始节点“
    // 注册传递参数改为动态。
    this.viewMap.forEach((component) => {
      const key = (component as any).extendKey
      if (key) {
        registerParam[key] = component
      }
    })
    this.graphModel.modelMap.forEach((component) => {
      const key = component.extendKey
      if (key) {
        registerParam[key as string] = component
      }
    })
    if (fn) {
      // TODO: 确认 fn 是否必传，如果必传，可以去掉这个判断
      const { view: ViewClass, model: ModelClass } = fn(registerParam)
      let vClass = ViewClass as any // TODO: 确认 ViewClass 类型
      if (isObserverView && !vClass.isObervered) {
        vClass.isObervered = true
        // @ts-ignore
        vClass = observer(vClass)
      }
      this.setView(type, vClass)
      this.graphModel.setModel(type, ModelClass)
    }
  }

  private registerElement(config) {
    let vClass = config.view
    if (config.isObserverView !== false && !vClass.isObervered) {
      vClass.isObervered = true
      vClass = observer(vClass)
    }
    this.setView(config.type, vClass)
    this.graphModel.setModel(config.type, config.model)
  }

  /**
   * 批量注册
   * @param elements 注册的元素
   */
  batchRegister(elements = []) {
    elements.forEach((element) => {
      this.registerElement(element)
    })
  }

  private defaultRegister() {
    // register default shape
    this.registerElement({
      view: _View.RectNode,
      model: _Model.RectNodeModel,
      type: 'rect',
    })
    this.registerElement({
      type: 'circle',
      view: _View.CircleNode,
      model: _Model.CircleNodeModel,
    })
    this.registerElement({
      type: 'polygon',
      view: _View.PolygonNode,
      model: _Model.PolygonNodeModel,
    })
    this.registerElement({
      type: 'line',
      view: _View.LineEdge,
      model: _Model.LineEdgeModel,
    })
    this.registerElement({
      type: 'polyline',
      view: _View.PolylineEdge,
      model: _Model.PolylineEdgeModel,
    })
    this.registerElement({
      type: 'bezier',
      view: _View.BezierEdge,
      model: _Model.BezierEdgeModel,
    })
    this.registerElement({
      type: 'text',
      view: _View.TextNode,
      model: _Model.TextNodeModel,
    })
    this.registerElement({
      type: 'ellipse',
      view: _View.EllipseNode,
      model: _Model.EllipseNodeModel,
    })
    this.registerElement({
      type: 'diamond',
      view: _View.DiamondNode,
      model: _Model.DiamondNodeModel,
    })
    this.registerElement({
      type: 'html',
      view: _View.HtmlNode,
      model: _Model.HtmlNodeModel,
    })
  }

  /**
   * 将图形选中
   * @param id 选择元素ID
   * @param multiple 是否允许多选，如果为true，不会将上一个选中的元素重置
   * @param toFront 是否将选中的元素置顶，默认为true
   */
  selectElementById(id: string, multiple = false, toFront = true) {
    this.graphModel.selectElementById(id, multiple)
    if (!multiple && toFront) {
      this.graphModel.toFront(id)
    }
  }

  /**
   * 定位到画布视口中心
   * 支持用户传入图形当前的坐标或id，可以通过type来区分是节点还是边的id，也可以不传（兜底）
   * @param focusOnArgs.id 如果传入的是id, 则画布视口中心移动到此id的元素中心点。
   * @param focusOnArgs.coordinate 如果传入的是坐标，则画布视口中心移动到此坐标。
   */
  focusOn(focusOnArgs: FocusOnParams): void {
    const { transformModel } = this.graphModel
    let { coordinate } = focusOnArgs
    const { id } = focusOnArgs
    if (!coordinate && id) {
      const model = this.getNodeModelById(id)
      if (model) {
        coordinate = model.getData()
      }
      const edgeModel = this.getEdgeModelById(id)
      if (edgeModel) {
        coordinate = edgeModel.textPosition
      }
    }
    const { x, y } = coordinate ?? ({} as any) // TODO：使用 Point Position 类型
    transformModel.focusOn(x, y, this.graphModel.width, this.graphModel.height)
  }

  /**
   * 设置主题样式
   * @param { object } style 自定义主题样式
   * todo docs link
   */
  setTheme(style: Partial<LogicFlow.Theme>): void {
    this.graphModel.setTheme(style)
  }

  /**
   * 重新设置画布的宽高
   * 不传会自动计算画布宽高
   */
  resize(width?: number, height?: number): void {
    this.graphModel.resize(width, height)
    this.options.width = this.graphModel.width
    this.options.height = this.graphModel.height
  }

  /**
   * 设置默认的边类型。
   * 也就是设置在节点直接有用户手动绘制的连线类型。
   * @param type Options.EdgeType
   */
  setDefaultEdgeType(type: LFOptions.EdgeType): void {
    this.graphModel.setDefaultEdgeType(type)
  }

  /**
   * 更新节点或边的文案
   * @param id 节点或者边id
   * @param value 文案内容
   */
  updateText(id: string, value: string) {
    this.graphModel.updateText(id, value)
  }

  /**
   * 删除元素，在不确定当前id是节点还是边时使用
   * @param id 元素id
   */
  deleteElement(id): boolean {
    const model = this.getModelById(id)
    if (!model) return false
    const callback = {
      [ElementType.NODE]: this.deleteNode,
      [ElementType.EDGE]: this.deleteEdge,
    }

    const { BaseType } = model
    return callback[BaseType]?.call(this, id) ?? false
  }

  /**
   * 获取节点或边对象
   * @param id id
   */
  getModelById(id: string): BaseNodeModel | BaseEdgeModel | undefined {
    return this.graphModel.getElement(id)
  }

  /**
   * 获取节点或边的数据
   * @param id id
   */
  getDataById(id: string): NodeConfig | EdgeConfig | undefined {
    return this.graphModel.getElement(id)?.getData()
  }

  /**
   * 修改指定节点类型
   * @param id 节点id
   * @param type 节点类型
   */
  changeNodeType(id: string, type: string): void {
    this.graphModel.changeNodeType(id, type)
  }

  /**
   * 切换边的类型
   * @param id 边Id
   * @param type 边类型
   */
  changeEdgeType(id: string, type: string): void {
    this.graphModel.changeEdgeType(id, type)
  }

  /**
   * 获取节点连接的所有边的model
   * @param nodeId 节点ID
   * @returns model数组
   */
  getNodeEdges(nodeId): BaseEdgeModel[] {
    return this.graphModel.getNodeEdges(nodeId)
  }

  /**
   * 添加节点
   * @param nodeConfig 节点配置
   * @param eventType 新增节点事件类型，默认EventType.NODE_ADD
   * @param e MouseEvent 事件
   */
  addNode(
    nodeConfig: NodeConfig,
    eventType: EventType = EventType.NODE_ADD,
    e?: MouseEvent,
  ): BaseNodeModel {
    return this.graphModel.addNode(nodeConfig, eventType, e)
  }

  /**
   * 删除节点
   * @param {string} nodeId 节点Id
   */
  deleteNode(nodeId: string): boolean {
    const Model = this.graphModel.getNodeModelById(nodeId)
    if (!Model) {
      return false
    }
    const data = Model.getData()
    const { guards } = this.options
    const enabledDelete =
      guards && guards.beforeDelete ? guards.beforeDelete(data) : true
    if (enabledDelete) {
      this.graphModel.deleteNode(nodeId)
    }
    return enabledDelete
  }

  /**
   * 克隆节点
   * @param nodeId 节点Id
   */
  cloneNode(nodeId: string): BaseNodeModel | undefined {
    const Model = this.graphModel.getNodeModelById(nodeId)
    const data = Model?.getData()
    if (!data) return

    const { guards } = this.options
    const enabledClone =
      guards && guards.beforeClone ? guards.beforeClone(data) : true
    if (enabledClone) {
      return this.graphModel.cloneNode(nodeId)
    }
  }

  /**
   * 修改节点的id， 如果不传新的id，会内部自动创建一个。
   * @param { string } oldId 将要被修改的id
   * @param { string } newId 可选，修改后的id
   * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
   */
  changeNodeId<T extends string>(oldId: string, newId?: T): T | string {
    return this.graphModel.changeNodeId(oldId, newId)
  }

  /**
   * 获取节点对象
   * @param nodeId 节点Id
   */
  getNodeModelById(nodeId: string): BaseNodeModel | undefined {
    return this.graphModel.getNodeModelById(nodeId)
  }

  /**
   * 获取节点数据
   * @param nodeId 节点
   */
  getNodeDataById(nodeId: string): NodeConfig | undefined {
    return this.graphModel.getNodeModelById(nodeId)?.getData()
  }

  /**
   * 给两个节点之间添加一条边
   * @example
   * lf.addEdge({
   *   type: 'polygon'
   *   sourceNodeId: 'node_id_1',
   *   targetNodeId: 'node_id_2',
   * })
   * @param {object} edgeConfig
   */
  addEdge(edgeConfig: EdgeConfig): BaseEdgeModel {
    return this.graphModel.addEdge(edgeConfig)
  }

  /**
   * 删除边
   * @param {string} edgeId 边Id
   */
  deleteEdge(edgeId: string): boolean {
    const { guards } = this.options
    const edge = this.graphModel.edgesMap[edgeId]
    if (!edge) {
      return false
    }
    const edgeData = edge.model.getData()
    const enabledDelete =
      guards && guards.beforeDelete ? guards.beforeDelete(edgeData) : true
    if (enabledDelete) {
      this.graphModel.deleteEdgeById(edgeId)
    }
    return enabledDelete
  }

  /**
   * 删除指定类型的边, 基于边起点和终点，可以只传其一。
   * @param config.sourceNodeId 边的起点节点ID
   * @param config.targetNodeId 边的终点节点ID
   */
  deleteEdgeByNodeId(config: {
    sourceNodeId?: string
    targetNodeId?: string
  }): void {
    const { sourceNodeId, targetNodeId } = config
    if (sourceNodeId && targetNodeId) {
      this.graphModel.deleteEdgeBySourceAndTarget(sourceNodeId, targetNodeId)
    } else if (sourceNodeId) {
      this.graphModel.deleteEdgeBySource(sourceNodeId)
    } else if (targetNodeId) {
      this.graphModel.deleteEdgeByTarget(targetNodeId)
    }
  }

  /**
   * 修改边的id， 如果不传新的id，会内部自动创建一个。
   * @param { string } oldId 将要被修改的id
   * @param { string } newId 可选，修改后的id
   * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
   */
  changeEdgeId<T extends string>(oldId: string, newId?: T): T | string {
    return this.graphModel.changeEdgeId(oldId, newId)
  }

  /**
   * 基于边Id获取边的model
   * @param edgeId 边的Id
   * @return model
   */
  getEdgeModelById(edgeId: string): BaseEdgeModel {
    const { edgesMap } = this.graphModel
    return edgesMap[edgeId]?.model
  }

  /**
   * 获取满足条件边的model
   * @param edgeFilter 过滤条件
   * @example
   * 获取所有起点为节点A的边的model
   * lf.getEdgeModels({
   *   sourceNodeId: 'nodeA_id'
   * })
   * 获取所有终点为节点B的边的model
   * lf.getEdgeModels({
   *   targetNodeId: 'nodeB_id'
   * })
   * 获取起点为节点A，终点为节点B的边
   * lf.getEdgeModels({
   *   sourceNodeId: 'nodeA_id',
   *   targetNodeId: 'nodeB_id'
   * })
   * @return model数组
   */
  getEdgeModels({
    sourceNodeId,
    targetNodeId,
  }: {
    sourceNodeId?: string
    targetNodeId?: string
  }): BaseEdgeModel[] {
    const { edges } = this.graphModel
    if (sourceNodeId && targetNodeId) {
      const result: BaseEdgeModel[] = []
      edges.forEach((edge) => {
        if (
          edge.sourceNodeId === sourceNodeId &&
          edge.targetNodeId === targetNodeId
        ) {
          result.push(edge)
        }
      })
      return result
    }
    if (sourceNodeId) {
      const result: BaseEdgeModel[] = []
      edges.forEach((edge) => {
        if (edge.sourceNodeId === sourceNodeId) {
          result.push(edge)
        }
      })
      return result
    }
    if (targetNodeId) {
      const result: BaseEdgeModel[] = []
      edges.forEach((edge) => {
        if (edge.targetNodeId === targetNodeId) {
          result.push(edge)
        }
      })
      return result
    }
    return []
  }

  /**
   * 基于id获取边数据
   * @param edgeId 边Id
   * @returns EdgeData
   */
  getEdgeDataById(edgeId: string): EdgeData {
    return this.getEdgeModelById(edgeId)?.getData()
  }

  /**
   * 获取所有以此节点为终点的边
   */
  getNodeIncomingEdge(nodeId) {
    return this.graphModel.getNodeIncomingEdge(nodeId)
  }

  /**
   * 获取所有以此节点为起点的边
   */
  getNodeOutgoingEdge(nodeId) {
    return this.graphModel.getNodeOutgoingEdge(nodeId)
  }

  /**
   * 获取节点连接到的所有起始节点
   */
  getNodeIncomingNode(nodeId) {
    return this.graphModel.getNodeIncomingNode(nodeId)
  }

  /**
   * 获取节点连接到的所有目标节点
   */
  getNodeOutgoingNode(nodeId) {
    return this.graphModel.getNodeOutgoingNode(nodeId)
  }

  /**
   * 显示节点、连线文本编辑框
   * @param id 元素id
   */
  editText(id: string): void {
    this.graphModel.editText(id)
  }

  /**
   * 设置元素的自定义属性
   * @see todo docs link
   * @param id 元素的id
   * @param properties 自定义属性
   */
  setProperties(id: string, properties: Record<string, unknown>): void {
    this.graphModel.getElement(id)?.setProperties(formatData(properties))
  }

  deleteProperty(id: string, key: string): void {
    this.graphModel.getElement(id)?.deleteProperty(key)
  }

  /**
   * 获取元素的自定义属性
   * @param id 元素的id
   * @returns 自定义属性
   */
  getProperties(id: string): Record<string, unknown> | undefined {
    return this.graphModel.getElement(id)?.getProperties()
  }

  /**
   * 将某个元素放置到顶部。
   * 如果堆叠模式为默认模式，则将原置顶元素重新恢复原有层级。
   * 如果堆叠模式为递增模式，则将需指定元素zIndex设置为当前最大zIndex + 1。
   * @see todo link 堆叠模式
   * @param id 元素Id
   */
  toFront(id) {
    this.graphModel.toFront(id)
  }

  /**
   * 设置元素的zIndex.
   * 注意：默认堆叠模式下，不建议使用此方法。
   * @see todo link 堆叠模式
   * @param id 元素id
   * @param zIndex zIndex的值，可以传数字，也支持传入 'top' 和 'bottom'
   */
  setElementZIndex(id: string, zIndex: number | 'top' | 'bottom') {
    return this.graphModel.setElementZIndex(id, zIndex)
  }

  /**
   * 添加多个元素, 包括边和节点。
   */
  // TODO: 解决下面 distance 变量未使用的问题。在 shortcut 中调用 addElements 时传了该参数，但实际无效
  addElements(
    { nodes, edges }: GraphConfigData,
    distance = 40,
  ): GraphElements | undefined {
    this._distance = distance // TODO: 移除该行代码，只为解决 ts 问题
    const nodeIdMap = {}
    const elements: GraphElements = {
      nodes: [],
      edges: [],
    }
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const preId = node.id
      const nodeModel = this.addNode(node)
      if (!nodeModel) return
      if (preId) nodeIdMap[preId] = nodeModel.id
      elements.nodes.push(nodeModel)
    }
    edges.forEach((edge) => {
      let sourceId = edge.sourceNodeId
      let targetId = edge.targetNodeId
      if (nodeIdMap[sourceId]) sourceId = nodeIdMap[sourceId]
      if (nodeIdMap[targetId]) targetId = nodeIdMap[targetId]
      const edgeModel = this.graphModel.addEdge({
        ...edge,
        sourceNodeId: sourceId,
        targetNodeId: targetId,
      })
      elements.edges.push(edgeModel)
    })
    return elements
  }

  /**
   * 获取指定区域内的所有元素，此区域必须是DOM层。
   * 例如鼠标绘制选区后，获取选区内的所有元素。
   * @see todo 分层
   * @param leftTopPoint 区域左上角坐标, dom层坐标
   * @param rightBottomPoint 区域右下角坐标，dom层坐标
   * @param wholeEdge
   * @param wholeNode
   * @param ignoreHideElement
   */
  getAreaElement(
    leftTopPoint: PointTuple,
    rightBottomPoint: PointTuple,
    wholeEdge = true,
    wholeNode = true,
    ignoreHideElement = false,
  ) {
    return this.graphModel
      .getAreaElement(
        leftTopPoint,
        rightBottomPoint,
        wholeEdge,
        wholeNode,
        ignoreHideElement,
      )
      .map((element: any) => element.getData()) // 确认 element 类型
  }

  /**
   * 获取选中的元素数据
   * @param isIgnoreCheck 是否包括sourceNode和targetNode没有被选中的边,默认包括。
   * 注意：复制的时候不能包括此类边, 因为复制的时候不允许悬空的边。
   */
  getSelectElements(isIgnoreCheck = true): GraphConfigData {
    return this.graphModel.getSelectElements(isIgnoreCheck)
  }

  /**
   * 将所有选中的元素设置为非选中
   */
  clearSelectElements() {
    this.graphModel.clearSelectElements()
  }

  /**
   * 获取流程绘图数据
   * 注意: getGraphData返回的数据受到adapter影响，所以其数据格式不一定是logicflow内部图数据格式。
   * 如果实现通用插件，请使用getGraphRawData
   */
  getGraphData(...params: any): GraphConfigData | any {
    const data = this.graphModel.modelToGraphData()
    if (this.adapterOut) {
      return this.adapterOut(data as GraphConfigData, ...params)
    }
    return data
  }

  /**
   * 获取流程绘图原始数据
   * 在存在adapter时，可以使用getGraphRawData获取图原始数据
   */
  getGraphRawData(): GraphConfigData {
    return this.graphModel.modelToGraphData()
  }

  /**
   * 清空画布
   */
  clearData() {
    this.graphModel.clearData()
  }

  /**
   * 更新流程图编辑相关设置
   * @param {object} config 编辑配置
   * @see todo docs link
   */
  updateEditConfig(config: EditConfigInterface) {
    const { editConfigModel, transformModel } = this.graphModel
    editConfigModel.updateEditConfig(config)
    if (config?.stopMoveGraph !== undefined) {
      transformModel.updateTranslateLimits(config.stopMoveGraph)
    }
    // 静默模式切换时，修改快捷键的启用状态
    config?.isSilentMode ? this.keyboard.disable() : this.keyboard.enable(true)
  }

  /**
   * 获取流程图当前编辑相关设置
   * @see todo docs link
   */
  getEditConfig() {
    return this.graphModel.editConfigModel.getConfig()
  }

  /**
   * 获取事件位置相对于画布左上角的坐标
   * 画布所在的位置可以是页面任何地方，原生事件返回的坐标是相对于页面左上角的，该方法可以提供以画布左上角为原点的准确位置。
   * @see todo link
   * @param {number} x 事件x坐标
   * @param {number} y 事件y坐标
   * @returns {object} Point 事件位置的坐标
   * @returns {object} Point.domOverlayPosition HTML层上的坐标
   * @returns {object} Point.canvasOverlayPosition SVG层上的坐标
   */
  getPointByClient(x: number, y: number) {
    return this.graphModel.getPointByClient({
      x,
      y,
    })
  }

  /**
   * 历史记录操作
   * 返回上一步
   */
  undo() {
    if (!this.history.undoAble()) return
    // formatData兼容vue数据
    const graphData = formatData(this.history.undo())
    this.clearSelectElements()
    this.graphModel.graphDataToModel(graphData)
  }

  /**
   * 历史记录操作
   * 恢复下一步
   */
  redo() {
    if (!this.history.redoAble()) return
    // formatData兼容vue数据
    const graphData = formatData(this.history.redo())
    this.clearSelectElements()
    this.graphModel.graphDataToModel(graphData)
  }

  /**
   * 放大缩小图形
   * @param zoomSize 放大缩小的值，支持传入0-n之间的数字。小于1表示缩小，大于1表示放大。也支持传入true和false按照内置的刻度放大缩小
   * @param point 缩放的原点
   * @returns {string} -放大缩小的比例
   */
  zoom(zoomSize?: ZoomParamType, point?: PointTuple): string {
    const { transformModel } = this.graphModel
    return transformModel.zoom(zoomSize, point)
  }

  /**
   * 重置图形的放大缩写比例为默认
   */
  resetZoom(): void {
    const { transformModel } = this.graphModel
    transformModel.resetZoom()
  }

  /**
   * 设置图形缩小时，能缩放到的最小倍数。参数为0-1自己。默认0.2
   * @param size 图形缩小的最小值
   */
  setZoomMiniSize(size: number): void {
    const { transformModel } = this.graphModel
    transformModel.setZoomMiniSize(size)
  }

  /**
   * 设置图形放大时，能放大到的最大倍数，默认16
   * @param size 图形放大的最大值
   */
  setZoomMaxSize(size: number): void {
    const { transformModel } = this.graphModel
    transformModel.setZoomMaxSize(size)
  }

  /**
   * 获取缩放的值和平移的值。
   */
  getTransform() {
    const {
      transformModel: { SCALE_X, SCALE_Y, TRANSLATE_X, TRANSLATE_Y },
    } = this.graphModel
    return {
      SCALE_X,
      SCALE_Y,
      TRANSLATE_X,
      TRANSLATE_Y,
    }
  }

  /**
   * 平移图
   * @param x 向x轴移动距离
   * @param y 向y轴移动距离
   */
  translate(x: number, y: number): void {
    const { transformModel } = this.graphModel
    transformModel.translate(x, y)
  }

  /**
   * 还原图形为初始位置
   */
  resetTranslate(): void {
    const { transformModel } = this.graphModel
    const { TRANSLATE_X, TRANSLATE_Y } = transformModel
    this.translate(-TRANSLATE_X, -TRANSLATE_Y)
  }

  /**
   * 图形画布居中显示
   */
  translateCenter(): void {
    this.graphModel.translateCenter()
  }

  /**
   * 图形适应屏幕大小
   * @param verticalOffset number 距离盒子上下的距离， 默认为20
   * @param horizontalOffset number 距离盒子左右的距离， 默认为20
   */
  fitView(verticalOffset?: number, horizontalOffset?: number): void {
    if (horizontalOffset === undefined) {
      horizontalOffset = verticalOffset // 兼容以前的只传一个参数的情况
    }
    this.graphModel.fitView(verticalOffset, horizontalOffset)
  }

  /**
   * 开启边的动画
   * @param edgeId any
   */
  openEdgeAnimation(edgeId: any): void {
    this.graphModel.openEdgeAnimation(edgeId)
  }

  /**
   * 关闭边的动画
   * @param edgeId any
   */
  closeEdgeAnimation(edgeId: any): void {
    this.graphModel.closeEdgeAnimation(edgeId)
  }

  // 事件系统----------------------------------------------
  /**
   * 监听事件
   * 事件详情见 @see todo
   * 支持同时监听多个事件
   * @example
   * lf.on('node:click,node:contextmenu', (data) => {
   * });
   */
  on(evt: string, callback: CallbackType) {
    this.graphModel.eventCenter.on(evt, callback)
  }

  /**
   * 撤销监听事件
   */
  off(evt: string, callback: CallbackType) {
    this.graphModel.eventCenter.off(evt, callback)
  }

  /**
   * 监听事件，只监听一次
   */
  once(evt: string, callback: CallbackType) {
    this.graphModel.eventCenter.once(evt, callback)
  }

  /**
   * 触发监听事件
   */
  emit(evt: string, arg: any) {
    this.graphModel.eventCenter.emit(evt, arg)
  }

  // 插件系统----------------------------------------------

  /**
   * 添加扩展, 待讨论，这里是不是静态方法好一些？
   * 重复添加插件的时候，把上一次添加的插件的销毁。
   * @param extension
   * @param props
   */
  static use(
    extension: ExtensionConstructor,
    props?: Record<string, unknown>,
  ): void {
    let { pluginName } = extension
    if (!pluginName) {
      console.warn(
        `请给插件${
          extension.name || extension.constructor.name
        }指定pluginName!`,
      )
      pluginName = extension.name // 兼容以前name的情况，1.0版本去掉。
    }
    // TODO: 应该在何时进行插件的销毁
    // const preExtension = this.extensions.get(pluginName)?.extension
    // preExtension?.destroy?.() // 该代码应该有问题，因为 preExtension 直接用的是 Constructor，没有实例化。无法访问实例方法 destroy

    this.extensions.set(pluginName, {
      [pluginFlag]: pluginFlag,
      extension,
      props,
    })
  }

  private initContainer(container) {
    const lfContainer = document.createElement('div')
    lfContainer.style.position = 'relative'
    lfContainer.style.width = '100%'
    lfContainer.style.height = '100%'
    container.innerHTML = ''
    container.appendChild(lfContainer)
    return lfContainer
  }

  private installPlugins(disabledPlugins: string[] = []) {
    // 安装插件，优先使用个性插件
    const extensions = this.plugins ?? LogicFlow.extensions
    extensions.forEach((ext: any) => {
      let extension: any
      let props = null
      if (ext[pluginFlag]) {
        extension = ext.extension
        props = ext.props
      } else {
        extension = ext
      }
      const pluginName = extension?.pluginName || extension?.name
      if (disabledPlugins.indexOf(pluginName) === -1) {
        this.installPlugin(extension, props)
      }
    })
  }

  /**
   * 加载插件-内部方法
   */
  private installPlugin(extension: Extension, props: any) {
    if (typeof extension === 'object') {
      const { pluginName, install, render: renderComponent } = extension
      if (pluginName) {
        install && install.call(extension, this, LogicFlow)
        renderComponent && this.components.push(renderComponent.bind(extension))
        this.extension[pluginName] = extension
      }
      return
    }
    const ExtensionCls = extension as ExtensionConstructor
    const extensionInstance = new ExtensionCls({
      lf: this,
      LogicFlow,
      options: this.options.pluginsOptions ?? {},
      props,
    })
    extensionInstance.render &&
      this.components.push(extensionInstance.render.bind(extensionInstance))
    this.extension[ExtensionCls.pluginName] = extensionInstance
  }

  /**
   * 修改对应元素 model 中的属性
   * 注意：此方法慎用，除非您对logicflow内部有足够的了解。
   * 大多数情况下，请使用setProperties、updateText、changeNodeId等方法。
   * 例如直接使用此方法修改节点的id,那么就是会导致连接到此节点的边的sourceNodeId出现找不到的情况。
   * @param {string} id 元素id
   * @param {object} attributes 需要更新的属性
   */
  updateAttributes(id: string, attributes: object) {
    this.graphModel.updateAttributes(id, attributes)
  }

  /**
   * 内部保留方法
   * 创建一个fakerNode，用于dnd插件拖动节点进画布的时候使用。
   */
  createFakerNode(nodeConfig) {
    const Model = this.graphModel.modelMap.get(nodeConfig.type)
    if (!Model) {
      console.warn(`不存在为${nodeConfig.type}类型的节点`)
      return
    }
    // * initNodeData区分是否为虚拟节点
    // TODO: 确认此处该如何处理，ts 类型。此处类型肯定是 BaseNodeModel，下面的 config 可以保证 new 成功
    // @ts-ignore
    const fakerNodeModel = new Model(
      {
        ...nodeConfig,
        virtual: true,
      },
      this.graphModel,
    )
    this.graphModel.setFakerNode(fakerNodeModel)
    return fakerNodeModel
  }

  /**
   * 内部保留方法
   * 移除fakerNode
   */
  removeFakerNode() {
    this.graphModel.removeFakerNode()
  }

  /**
   * 内部保留方法
   * 用于fakerNode显示对齐线
   */
  setNodeSnapLine(data) {
    if (this.snaplineModel) {
      this.snaplineModel.setNodeSnapLine(data)
    }
  }

  /**
   * 内部保留方法
   * 用于fakerNode移除对齐线
   */
  removeNodeSnapLine() {
    if (this.snaplineModel) {
      this.snaplineModel.clearSnapline()
    }
  }

  /**
   * 内部保留方法
   * 用于fakerNode移除对齐线
   */
  setView(type: string, component) {
    this.viewMap.set(type, component)
  }

  renderRawData(graphRawData) {
    this.graphModel.graphDataToModel(formatData(graphRawData))
    if (this.options.history !== false) {
      this.history.watch(this.graphModel)
    }
    render(
      <Graph
        getView={this.getView}
        tool={this.tool}
        options={this.options}
        dnd={this.dnd}
        snaplineModel={this.snaplineModel}
        graphModel={this.graphModel}
      />,
      this.container,
    )
    this.emit(EventType.GRAPH_RENDERED, this.graphModel.modelToGraphData())
  }

  /**
   * 渲染图
   * @example
   * lf.render({
   *   nodes: [
   *     {
   *       id: 'node_1',
   *       type: 'rect',
   *       x: 100,
   *       y: 100
   *     },
   *     {
   *       id: 'node_2',
   *       type: 'circle',
   *       x: 300,
   *       y: 200
   *     }
   *   ],
   *   edges: [
   *     {
   *       sourceNodeId: 'node_1',
   *       targetNodeId: 'node_2',
   *       type: 'polyline'
   *     }
   *   ]
   * })
   * @param graphData 图数据
   */
  render(graphData = {}) {
    if (this.adapterIn) {
      graphData = this.adapterIn(graphData)
    }
    this.renderRawData(graphData)
  }

  /**
   * 内部保留方法
   * 获取指定类型的view
   */
  getView = (type: string): Component | null => this.viewMap.get(type) ?? null
}

// Option
export namespace LogicFlow {
  export interface Options extends LFOptions.Common {}

  export interface GraphConfigData {
    nodes: NodeData[]
    edges: EdgeData[]
  }

  export type DomAttributes = {
    className?: string
    [key: string]: string | undefined
  }

  export type AttributesType = Record<string, unknown>
  export type EventArgsType = Record<string, unknown>

  export type OffsetData = {
    dx: number
    dy: number
  }
  export type Position = {
    x: number
    y: number
  }
  export type Point = {
    id?: string
    [key: string]: any
  } & Position
  export type PointTuple = [number, number]
  export type ClientPosition = {
    domOverlayPosition: Position
    canvasOverlayPosition: Position
  }

  export interface LineSegment {
    start: Point
    end: Point
  }

  export type Direction = 'vertical' | 'horizontal'
  export type RadiusCircleInfo = {
    r: number
  } & Position
  export type Vector = {
    id?: string
    x: number
    y: number
    z: 0
    [key: string]: any
  }
  export type RectSize = {
    width: number
    height: number
  }
  export type TextConfig = {
    value: string
    editable?: boolean
    draggable?: boolean
  } & Point

  export type AppendConfig = {
    startIndex: number
    endIndex: number
    direction: Direction
    draggable?: boolean
  } & LineSegment

  export type ArrowConfig = {
    markerStart: string
    markerEnd: string
  }

  export type ArrowInfo = {
    start: Point
    end: Point
    hover: boolean
    isSelected: boolean
  }

  export interface FakeNodeConfig {
    type: string
    text?: TextConfig | string
    properties?: Record<string, unknown>

    [key: string]: unknown
  }

  export interface NodeConfig {
    id?: string
    type: string
    x: number
    y: number
    text?: TextConfig | string
    zIndex?: number
    properties?: Record<string, unknown>
    virtual?: boolean // 是否虚拟节点
    rotate?: number

    [key: string]: any
  }

  export interface NodeData extends NodeConfig {
    id: string
    text?: TextConfig

    [key: string]: unknown
  }

  export interface NodeAttribute extends Partial<NodeConfig> {
    id: string
  }

  export interface EdgeConfig {
    id?: string
    type: string // TODO: 将所有类型选项列出来；LogicFlow 内部默认为 polyline

    sourceNodeId: string
    sourceAnchorId?: string
    targetNodeId: string
    targetAnchorId?: string

    startPoint?: Point
    endPoint?: Point
    text?: TextConfig | string
    pointsList?: Point[]
    zIndex?: number
    properties?: Record<string, unknown>
  }

  // TODO: 确认这种类型该如何定义（必需和非必需动态调整，优雅的处理方式）
  export interface EdgeData extends EdgeConfig {
    id: string
    type: string
    text?: TextConfig

    [key: string]: unknown
  }

  export interface EdgeAttribute extends Partial<EdgeConfig> {
    id: string
  }

  export interface MenuConfig {
    text?: string
    className?: string
    icon?: boolean
    callback: (id: string | number) => void
  }
}

// Theme
export namespace LogicFlow {
  export type NumberOrPercent = `${number}%` | number
  /**
   * 颜色 - CSS 属性用颜色
   * 如：#000000, rgba(0, 0, 0, 0), 如果是透明的，可以传 'none'
   */
  export type Color = string | 'none'
  /**
   * svg虚线
   * 格式为逗号分割字符串，如
   * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-dasharray
   */
  export type DashArray = string
  export type CommonTheme = {
    path?: string
    fill?: Color // 填充颜色
    stroke?: Color // 边框颜色
    strokeWidth?: number // 边框宽度 TODO: svg 实际可赋值类型：NumberOrPercent
    /**
     * 其他属性 - 我们会把你自定义的所有属性最终传递到 DOM 上
     * 详情请参考 svg 属性规范：
     * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute
     * 注意: 请不要在主题中设置“形状属性”，例如：x、y、width、height、radius、r、rx、ry
     * @see https://docs.logic-flow.cn/docs/#/zh/api/themeApi?id=%e5%bd%a2%e7%8a%b6%e5%b1%9e%e6%80%a7）
     */
    radius?: number
    rx?: number
    ry?: number
    [key: string]: unknown
  }
  export type CommonThemePropTypes = CommonTheme[keyof CommonTheme]

  export type AppendAttributes = {
    d: string
    fill: string
    stroke: Color
    strokeWidth: number
    strokeDasharray: DashArray
  }

  export type ContainerTheme = {
    width?: string
    height?: string
  }
  // 节点 Shape 类型
  /**
   * rect 节点主题
   * svg基础图形-矩形
   * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/rect
   */
  export type RectTheme = CommonTheme
  /**
   * circle 节点主题
   * svg基础图形-圆形
   * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/circle
   */
  export type CircleTheme = CommonTheme
  /**
   * polygon 节点主题
   * svg基础图形-多边形
   * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/polygon
   */
  export type PolygonTheme = CommonTheme
  /**
   * ellipse 节点主题
   * svg基础图形-椭圆
   * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/ellipse
   */
  export type EllipseTheme = CommonTheme
  // 锚点样式（svg 基础图形 - 圆）
  export type AnchorTheme = {
    r?: number
    hover?: {
      r?: number
    } & CommonTheme
  } & CommonTheme

  // 文本样式
  export type TextTheme = {
    color?: Color
    fontSize: number
    textWidth?: number
    lineHeight?: number
    textAnchor?: 'start' | 'middle' | 'end'
    dominantBaseline?:
      | 'auto'
      | 'text-bottom'
      | 'alphabetic'
      | 'ideographic'
      | 'middle'
      | 'central'
      | 'mathematical'
      | 'hanging'
      | 'text-top'
  } & CommonTheme

  // 文本节点样式
  export type TextNodeTheme = {
    background?: RectTheme
  } & TextTheme

  // 节点上文本样式
  export type NodeTextTheme = {
    /**
     * 文本超出指定宽度处理方式
     * default: 不特殊处理，允许超出
     * autoWrap: 超出自动换行
     * ellipsis: 超出省略
     */
    overflowMode?: 'default' | 'autoWrap' | 'ellipsis'
    background?: RectTheme
    /**
     * 背景区域 padding
     * wrapPadding: '5px,10px'
     */
    wrapPadding?: string
  } & TextTheme
  // 边上文本样式
  export type EdgeTextTheme = {
    textWidth: number
    background?: {
      /**
       * 背景区域 padding
       * wrapPadding: '5px,10px'
       */
      wrapPadding?: string
    } & RectTheme
    // hover状态下文本样式
    hover?: EdgeTextTheme
  } & NodeTextTheme &
    TextTheme

  // 边 Edge 主题
  export type EdgeTheme = CommonTheme
  export type EdgeBezierTheme = {
    // 贝塞尔调整线主题
    adjustLine?: EdgeTheme
    // 贝塞尔调整锚点主题
    adjustAnchor?: CircleTheme
  } & EdgeTheme
  export type EdgePolylineTheme = EdgeTheme
  export type EdgeAnimation = {
    stroke?: Color
    strokeDasharray?: string
    strokeDashoffset?: NumberOrPercent
    animationName?: string
    animationDuration?: `${number}s` | `${number}ms`
    animationIterationCount?: 'infinite' | number
    animationTimingFunction?: string
    animationDirection?: string
  }

  export type OutlineTheme = {
    hover?: CommonTheme
  } & CommonTheme &
    EdgeAnimation

  export type ArrowTheme = {
    /**
     * 箭头长度.
     * 以符号"->"为例, offset表示箭头大于号的宽度。
     */
    offset: number
    /**
     * 箭头垂直于边的距离
     * 以符号"->"为例, verticalLength表示箭头大于号的高度
     */
    refX?: number
    refY?: number
    verticalLength: number
  } & CommonTheme
  export type ArrowAttributesType = {
    d: string
  } & ArrowTheme

  export type AnchorLineTheme = EdgeTheme & EdgeAnimation

  export interface Theme {
    baseNode: CommonTheme // 所有节点的通用主题设置
    baseEdge: EdgeTheme // 所有边的通用主题设置

    /**
     * 基础图形节点相关主题
     */
    rect: RectTheme // 矩形样式
    circle: CircleTheme // 圆形样式
    diamond: PolygonTheme // 菱形样式
    ellipse: EllipseTheme // 椭圆样式
    polygon: PolygonTheme // 多边形样式

    /**
     * 基础图形线相关主题
     */
    line: EdgeTheme // 直线样式
    polyline: EdgePolylineTheme // 折现样式
    bezier: EdgeBezierTheme // 贝塞尔曲线样式
    anchorLine: AnchorLineTheme // 从锚点拉出的边的样式

    /**
     * 文本内容相关主题
     */
    text: TextNodeTheme // 文本节点样式
    nodeText: NodeTextTheme // 节点文本样式
    edgeText: EdgeTextTheme // 边文本样式
    inputText?: CommonTheme

    /**
     * 其他元素相关主题
     */
    anchor: AnchorTheme // 锚点样式
    arrow: ArrowTheme // 边上箭头的样式
    snapline: EdgeTheme // 对齐线样式
    rotateControl: CommonTheme // 节点旋转控制点样式

    /**
     * REMIND: 当开启了跳转边的起点和终点(adjustEdgeStartAndEnd:true)后
     * 边的两端会出现调整按钮
     * 边连段的调整点样式
     */
    edgeAdjust: CircleTheme
    outline: OutlineTheme // 节点选择状态下外侧的选框样式
    edgeAnimation: EdgeAnimation // 边动画样式
  }
}

// Render or Functions
export namespace LogicFlow {
  export type FocusOnParams = {
    id?: string
    coordinate?: Point
  }

  export type GraphElement = BaseNodeModel | BaseEdgeModel
  export type GraphElements = {
    nodes: BaseNodeModel[]
    edges: BaseEdgeModel[]
  }

  export type RegisterConfig = {
    type: string
    view: any // TODO: 确认 view 的类型
    model: any // TODO: 确认 model 的类型
    isObserverView?: boolean
  }
  export type RegisterElement = {
    view: any
    model: any
  }
  export type RegisterParam = {
    h: typeof h
    // 当前项目中定义的节点 or 连线的 View 或 Model
    // ...
    [key: string]: unknown
  }
  export type RegisterElementFunc = (params: RegisterParam) => RegisterElement

  export interface LogicFlowConstructor {
    new (options: LFOptions.Definition): LogicFlow
  }

  export type RegisteredExtension = {
    [pluginFlag]: symbol
    extension: ExtensionConstructor
    props?: Record<string, unknown>
  }

  export type ExtensionProps = {
    lf: LogicFlow
    LogicFlow?: LogicFlowConstructor
    options?: Record<string, unknown>
    props?: Record<string, unknown>
  }

  export interface ExtensionConstructor {
    pluginName: string

    new (props: ExtensionProps): Extension
  }

  export type ExtensionRender = (lf: LogicFlow, container: HTMLElement) => void

  export interface Extension {
    readonly pluginName?: string // 插件名称，只用用于插件覆盖和细粒度控制加载哪些插件
    install?: (lf: LogicFlow, logicFlow: LogicFlowConstructor) => void
    render: ExtensionRender
    destroy?: () => void
  }
}

// toStringTag
export namespace LogicFlow {
  export const toStringTag = `LF.${LogicFlow.name}`
}

export default LogicFlow
