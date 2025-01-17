import { ComponentType, createElement as h, render } from 'preact/compat'
import { cloneDeep, forEach, indexOf, isNil } from 'lodash-es'
import { observer } from '.'
import { Options as LFOptions } from './options'
import * as _Model from './model'
import {
  BaseEdgeModel,
  BaseNodeModel,
  IEditConfigType,
  GraphModel,
  SnaplineModel,
  ZoomParamType,
} from './model'

import Graph from './view/Graph'
import * as _View from './view'
import { formatData } from './util'

import { Dnd, snapline } from './view/behavior'
import Tool from './tool'
import History from './history'
import Keyboard, { initDefaultShortcut } from './keyboard'
import { EventCallback, CallbackArgs, EventArgs } from './event/eventEmitter'
import { ElementType, EventType, SegmentDirection } from './constant'

import Extension = LogicFlow.Extension
import ExtensionConfig = LogicFlow.ExtensionConfig
import ExtensionConstructor = LogicFlow.ExtensionConstructor
import GraphConfigData = LogicFlow.GraphConfigData
import NodeConfig = LogicFlow.NodeConfig
import EdgeConfig = LogicFlow.EdgeConfig
import GraphData = LogicFlow.GraphData
import NodeData = LogicFlow.NodeData
import EdgeData = LogicFlow.EdgeData
import RegisterConfig = LogicFlow.RegisterConfig
import RegisterParam = LogicFlow.RegisterParam
import GraphElements = LogicFlow.GraphElements
import Position = LogicFlow.Position
import PointTuple = LogicFlow.PointTuple
import ExtensionRenderFunc = LogicFlow.ExtensionRenderFunc
import RegisterElementFunc = LogicFlow.RegisterElementFunc
import PropertiesType = LogicFlow.PropertiesType
import BaseNodeModelCtor = LogicFlow.BaseNodeModelCtor
import ClientPosition = LogicFlow.ClientPosition
import ExtensionDefinition = LogicFlow.ExtensionDefinition
import ExtensionType = LogicFlow.ExtensionType

const pluginFlag = Symbol('plugin registered by Logicflow.use')

export class LogicFlow {
  // 只读：logicflow实例挂载的容器。
  readonly container: HTMLElement
  // 只读：logicflow实例的配置
  readonly options: LFOptions.Definition
  // 只读：控制整个 LogicFlow 画布的model
  readonly graphModel: GraphModel

  viewMap: Map<string, ComponentType> = new Map()
  history: History
  keyboard: Keyboard
  dnd: Dnd
  tool: Tool
  snaplineModel?: SnaplineModel

  components: ExtensionRenderFunc[] = []
  // 个性配置的插件，覆盖全局配置的插件
  readonly plugins: ExtensionType[]
  // 全局配置的插件，所有的LogicFlow示例都会使用
  static extensions: Map<string, ExtensionConfig> = new Map()
  // 插件扩展方法
  extension: Record<string, Extension | ExtensionDefinition> = {}

  readonly width?: number // 只读：画布宽度
  readonly height?: number // 只读：画布高度
  /**
   * 自定义数据转换方法
   * 当接入系统格式和 LogicFlow 数据格式不一致时，可自定义此方法来进行数据格式转换
   * 详情请参考 adapter docs
   * 包括 adapterIn 和 adapterOut 两个方法
   */
  // TODO: 如何让用户执行时定义下面方法参数和返回值的类型
  adapterIn?: (data: unknown) => GraphData
  adapterOut?: (data: GraphData, ...rest: any) => unknown;

  // 支持插件在 LogicFlow 实例上增加自定义方法
  [propName: string]: any

  private initContainer(
    container: HTMLElement | HTMLDivElement,
    width?: number,
    height?: number,
  ) {
    // TODO: 确认是否需要，后续是否只要返回 container 即可（下面方法是为了解决事件绑定问题的）
    // fix: destroy keyboard events while destroy LogicFlow.(#1110)
    const lfContainer = document.createElement('div')
    lfContainer.style.position = 'relative'
    lfContainer.style.width = width ? `${width}px` : '100%'
    lfContainer.style.height = height ? `${height}px` : '100%'
    container.innerHTML = ''
    container.appendChild(lfContainer)
    return lfContainer
  }

  protected get [Symbol.toStringTag]() {
    return LogicFlow.toStringTag
  }

  constructor(options: LFOptions.Common) {
    const initOptions = LFOptions.get(options)
    const { container, width, height } = initOptions
    this.options = initOptions
    this.container = this.initContainer(container, width, height)
    this.graphModel = new GraphModel({
      ...initOptions,
      container: this.container, // TODO：测试该部分是否会有问题
    })

    this.plugins = initOptions.plugins ?? []

    const { eventCenter } = this.graphModel
    this.tool = new Tool(this)
    this.dnd = new Dnd({ lf: this })
    this.history = new History(eventCenter)
    this.keyboard = new Keyboard({
      lf: this,
      keyboard: initOptions.keyboard,
    })

    if (initOptions.snapline !== false) {
      this.snaplineModel = new SnaplineModel(this.graphModel)
      snapline(eventCenter, this.snaplineModel)
    }
    if (!initOptions.isSilentMode) {
      // 先初始化默认内置快捷键，自定义快捷键可以覆盖默认快捷键
      initDefaultShortcut(this, this.graphModel)
      // 然后再初始化自定义快捷键，自定义快捷键可以覆盖默认快捷键.
      // 插件最后初始化。方便插件强制覆盖内置快捷键
      this.keyboard.initShortcuts()
    }

    this.defaultRegister()
    this.installPlugins(initOptions.disabledPlugins)
  }

  /*********************************************************
   * Register 相关
   ********************************************************/
  private setView = (type: string, component: ComponentType) =>
    this.viewMap.set(type, component)
  // 根据 type 获取对应的 view
  private getView = (type: string): ComponentType | undefined =>
    this.viewMap.get(type)

  // register 方法重载
  register(element: RegisterConfig): void
  register(
    type: string,
    fn: RegisterElementFunc,
    isObserverView?: boolean,
  ): void
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
    element: string | RegisterConfig,
    fn?: RegisterElementFunc,
    isObserverView = true,
  ) {
    // 方式1
    if (typeof element !== 'string') {
      this.registerElement(element)
      return
    }

    // 方式2 TODO: 优化下面这段代码，没太看懂这一块的背景
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
      type: element,
    }
    // 为了能让后来注册的可以继承前面注册的
    // 例如我注册一个“开始节点”
    // 然后我再想注册一个“立即开始节点”
    // 注册传递参数改为动态。
    // TODO: 确定 extendKey 的作用
    this.viewMap.forEach((component) => {
      const key = (component as any).extendKey
      if (key) {
        registerParam[key] = component
      }
    })
    this.graphModel.modelMap.forEach((component) => {
      const key = (component as any).extendKey
      if (key) {
        registerParam[key as string] = component
      }
    })
    if (fn) {
      const { view: ViewClass, model: ModelClass } = fn(registerParam)
      let vClass = ViewClass as any // TODO: 确认 ViewClass 类型
      if (isObserverView && !vClass.isObserved) {
        vClass.isObserved = true
        vClass = observer(vClass)
      }
      this.setView(element, vClass)
      this.graphModel.setModel(element, ModelClass)
    }
  }

  /**
   * 注册元素（节点 or 边）
   * @param config 注册元素的配置项
   * @private
   */
  private registerElement(config: RegisterConfig) {
    let ViewComp = config.view

    if (config.isObserverView !== false && !ViewComp.isObserved) {
      ViewComp.isObserved = true
      ViewComp = observer(ViewComp)
    }

    this.setView(config.type, ViewComp)
    this.graphModel.setModel(config.type, config.model)
  }

  /**
   * 批量注册元素
   * @param elements 注册的元素
   */
  batchRegister(elements: RegisterConfig[] = []) {
    forEach(elements, (element) => {
      this.registerElement(element)
    })
  }

  private defaultRegister() {
    // LogicFlow default Nodes and Edges
    const defaultElements: RegisterConfig[] = [
      // Node
      {
        type: 'rect',
        view: _View.RectNode,
        model: _Model.RectNodeModel,
      },
      {
        type: 'circle',
        view: _View.CircleNode,
        model: _Model.CircleNodeModel,
      },
      {
        type: 'polygon',
        view: _View.PolygonNode,
        model: _Model.PolygonNodeModel,
      },
      {
        type: 'text',
        view: _View.TextNode,
        model: _Model.TextNodeModel,
      },
      {
        type: 'ellipse',
        view: _View.EllipseNode,
        model: _Model.EllipseNodeModel,
      },
      {
        type: 'diamond',
        view: _View.DiamondNode,
        model: _Model.DiamondNodeModel,
      },
      {
        type: 'html',
        view: _View.HtmlNode,
        model: _Model.HtmlNodeModel,
      },
      // Edge
      {
        type: 'line',
        view: _View.LineEdge,
        model: _Model.LineEdgeModel,
      },
      {
        type: 'polyline',
        view: _View.PolylineEdge,
        model: _Model.PolylineEdgeModel,
      },
      {
        type: 'bezier',
        view: _View.BezierEdge,
        model: _Model.BezierEdgeModel,
      },
    ]
    this.batchRegister(defaultElements)
  }

  /*********************************************************
   * Node 相关方法
   ********************************************************/
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
    const nodeModel = this.graphModel.getNodeModelById(nodeId)
    if (!nodeModel) return false

    const nodeData = nodeModel.getData()
    const { guards } = this.options
    const isEnableDelete = guards?.beforeDelete
      ? guards.beforeDelete(nodeData)
      : true
    if (isEnableDelete) {
      this.graphModel.deleteNode(nodeId)
    }
    return isEnableDelete
  }

  /**
   * 克隆节点
   * @param nodeId 节点Id
   */
  cloneNode(nodeId: string): NodeData | undefined {
    const nodeModel = this.graphModel.getNodeModelById(nodeId)
    const nodeData = nodeModel?.getData()

    if (nodeData) {
      const { guards } = this.options
      const isEnableClone = guards?.beforeClone
        ? guards.beforeClone(nodeData)
        : true
      if (isEnableClone) {
        return this.graphModel.cloneNode(nodeId)
      }
    }
  }

  /**
   * 修改节点的id，如果不传新的id，会内部自动创建一个。
   * @param { string } nodeId 将要被修改的id
   * @param { string } newId 可选，修改后的id
   * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
   */
  changeNodeId(nodeId: string, newId?: string): string {
    return this.graphModel.changeNodeId(nodeId, newId)
  }

  /**
   * 修改指定节点类型
   * @param nodeId 节点id
   * @param type 节点类型
   */
  changeNodeType(nodeId: string, type: string): void {
    this.graphModel.changeNodeType(nodeId, type)
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
  getNodeDataById(nodeId: string): NodeData | undefined {
    const nodeModel = this.getNodeModelById(nodeId)
    return nodeModel?.getData()
  }

  /**
   * 获取所有以此节点为终点的边
   * @param { string } nodeId
   */
  getNodeIncomingEdge(nodeId: string) {
    return this.graphModel.getNodeIncomingEdge(nodeId)
  }

  /**
   * 获取所有以此节点为起点的边
   * @param {string} nodeId
   */
  getNodeOutgoingEdge(nodeId: string) {
    return this.graphModel.getNodeOutgoingEdge(nodeId)
  }

  /**
   * 获取节点连接到的所有起始节点
   * @param {string} nodeId
   */
  getNodeIncomingNode(nodeId: string) {
    return this.graphModel.getNodeIncomingNode(nodeId)
  }

  /**
   * 获取节点连接到的所有目标节点
   * @param {string} nodeId
   */
  getNodeOutgoingNode(nodeId: string) {
    return this.graphModel.getNodeOutgoingNode(nodeId)
  }

  /**
   * 内部保留方法
   * 创建一个fakeNode，用于dnd插件拖动节点进画布的时候使用。
   */
  createFakeNode(nodeConfig: NodeConfig) {
    const Model = this.graphModel.modelMap.get(
      nodeConfig.type,
    ) as BaseNodeModelCtor
    if (!Model) {
      console.warn(`不存在为${nodeConfig.type}类型的节点`)
      return null
    }
    // * initNodeData区分是否为虚拟节点
    const fakeNodeModel = new Model(
      {
        ...nodeConfig,
        virtual: true,
      },
      this.graphModel,
    )
    this.graphModel.setFakeNode(fakeNodeModel)
    return fakeNodeModel
  }

  /**
   * 内部保留方法
   * 移除fakeNode
   */
  removeFakeNode() {
    this.graphModel.removeFakeNode()
  }

  /**
   * 内部保留方法
   * 用于fakeNode显示对齐线
   */
  setNodeSnapLine(data: NodeData) {
    this.snaplineModel?.setNodeSnapLine(data)
  }

  /**
   * 内部保留方法
   * 用于fakeNode移除对齐线
   */
  removeNodeSnapLine() {
    this.snaplineModel?.clearSnapline()
  }

  /*********************************************************
   * Edge 相关方法
   ********************************************************/
  /**
   * 设置默认的边类型。
   * 也就是设置在节点直接由用户手动绘制的连线类型。
   * @param type LFOptions.EdgeType
   */
  setDefaultEdgeType(type: LFOptions.EdgeType): void {
    this.graphModel.setDefaultEdgeType(type)
  }

  /**
   * 给两个节点之间添加一条边
   * @example
   * lf.addEdge({
   *   type: 'polygon'
   *   sourceNodeId: 'node_id_1',
   *   targetNodeId: 'node_id_2',
   * })
   * @param {EdgeConfig} edgeConfig
   */
  addEdge(edgeConfig: EdgeConfig): BaseEdgeModel {
    return this.graphModel.addEdge(edgeConfig)
  }

  /**
   * 基于id获取边数据
   * @param edgeId 边Id
   * @returns EdgeData
   */
  getEdgeDataById(edgeId: string): EdgeData | undefined {
    const edgeModel = this.getEdgeModelById(edgeId)
    return edgeModel?.getData()
  }

  /**
   * 基于边Id获取边的model
   * @param edgeId 边的Id
   * @return model
   */
  getEdgeModelById(edgeId: string): BaseEdgeModel | undefined {
    return this.graphModel.getEdgeModelById(edgeId)
  }

  /**
   * 获取满足条件边的model
   * @param edgeFilter 过滤条件
   * @example
   * 获取所有起点为节点 A 的边的 model
   * lf.getEdgeModels({
   *   sourceNodeId: 'nodeA_id'
   * })
   * 获取所有终点为节点 B 的边的 model
   * lf.getEdgeModels({
   *   targetNodeId: 'nodeB_id'
   * })
   * 获取起点为节点 A，终点为节点 B 的边
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
    const results: BaseEdgeModel[] = []
    const { edges } = this.graphModel
    if (sourceNodeId && targetNodeId) {
      forEach(edges, (edge) => {
        if (
          edge.sourceNodeId === sourceNodeId &&
          edge.targetNodeId === targetNodeId
        ) {
          results.push(edge)
        }
      })
    } else if (sourceNodeId) {
      forEach(edges, (edge) => {
        if (edge.sourceNodeId === sourceNodeId) {
          results.push(edge)
        }
      })
    } else if (targetNodeId) {
      forEach(edges, (edge) => {
        if (edge.targetNodeId === targetNodeId) {
          results.push(edge)
        }
      })
    }
    return results
  }

  /**
   * 修改边的id， 如果不传新的id，会内部自动创建一个。
   * @param { string } edgeId 将要被修改的id
   * @param { string } newId 可选，修改后的id
   * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
   */
  changeEdgeId(edgeId: string, newId?: string): string {
    return this.graphModel.changeEdgeId(edgeId, newId)
  }

  /**
   * 切换边的类型
   * @param edgeId 边Id
   * @param type 边类型
   */
  changeEdgeType(edgeId: string, type: LFOptions.EdgeType): void {
    this.graphModel.changeEdgeType(edgeId, type)
  }

  /**
   * 删除边
   * @param {string} edgeId 边Id
   */
  deleteEdge(edgeId: string): boolean {
    const edgeModel = this.graphModel.getEdgeModelById(edgeId)
    if (!edgeModel) return false

    const edgeData = edgeModel.getData()
    const { guards } = this.options
    const isEnableDelete = guards?.beforeDelete
      ? guards.beforeDelete(edgeData)
      : true
    if (isEnableDelete) {
      this.graphModel.deleteEdgeById(edgeId)
    }
    return isEnableDelete
  }

  /**
   * 基于给定节点（作为边起点或终点，可以只传其一），删除对应的边
   * @param sourceNodeId 边的起点节点ID
   * @param targetNodeId 边的终点节点ID
   */
  deleteEdgeByNodeId({
    sourceNodeId,
    targetNodeId,
  }: {
    sourceNodeId?: string
    targetNodeId?: string
  }): void {
    // TODO: 将下面方法从 this.graphModel 解构，并测试代码功能是否正常（需要确认 this 指向是否有异常）
    if (sourceNodeId && targetNodeId) {
      this.graphModel.deleteEdgeBySourceAndTarget(sourceNodeId, targetNodeId)
    } else if (sourceNodeId) {
      this.graphModel.deleteEdgeBySource(sourceNodeId)
    } else if (targetNodeId) {
      this.graphModel.deleteEdgeByTarget(targetNodeId)
    }
  }

  /**
   * 获取节点连接的所有边的model
   * @param nodeId 节点ID
   * @returns model数组
   */
  getNodeEdges(nodeId: string): BaseEdgeModel[] {
    return this.graphModel.getNodeEdges(nodeId)
  }

  /*********************************************************
   * Element 相关方法
   ********************************************************/
  /**
   * 添加多个元素, 包括边和节点。
   * @param nodes
   * @param edges
   * @param distance
   */
  addElements({ nodes, edges }: GraphConfigData, distance = 40): GraphElements {
    // TODO: 1. 解决下面方法中 distance 传参缺未使用的问题；该方法在快捷键中有调用
    // TODO: 2. review 一下本函数代码逻辑，确认 nodeIdMap 的作用，看是否有优化的空间
    console.log('distance', distance)
    const nodeIdMap: Record<string, string> = {}
    const elements: GraphElements = {
      nodes: [],
      edges: [],
    }
    forEach(nodes, (node) => {
      const nodeId = node.id
      const nodeModel = this.addNode(node)
      if (nodeId) nodeIdMap[nodeId] = nodeModel.id
      elements.nodes.push(nodeModel)
    })
    forEach(edges, (edge) => {
      let { sourceNodeId, targetNodeId } = edge
      if (nodeIdMap[sourceNodeId]) sourceNodeId = nodeIdMap[sourceNodeId]
      if (nodeIdMap[targetNodeId]) targetNodeId = nodeIdMap[targetNodeId]
      const edgeModel = this.graphModel.addEdge({
        ...edge,
        sourceNodeId,
        targetNodeId,
      })
      elements.edges.push(edgeModel)
    })
    return elements
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
   * 获取选中的元素数据
   * @param isIgnoreCheck 是否包括sourceNode和targetNode没有被选中的边,默认包括。
   * 注意：复制的时候不能包括此类边, 因为复制的时候不允许悬空的边。
   */
  getSelectElements(isIgnoreCheck = true): GraphData {
    return this.graphModel.getSelectElements(isIgnoreCheck)
  }

  /**
   * 将所有选中的元素设置为非选中
   */
  clearSelectElements() {
    this.graphModel.clearSelectElements()
  }

  /**
   * 获取节点或边对象
   * @param id id
   */
  getModelById(id: string): LogicFlow.GraphElement | undefined {
    return this.graphModel.getElement(id)
  }

  /**
   * 获取节点或边的数据
   * @param id id
   */
  getDataById(id: string): NodeData | EdgeData | undefined {
    return this.graphModel.getElement(id)?.getData()
  }

  /**
   * 删除元素，在不确定当前id是节点还是边时使用
   * @param id 元素id
   */
  deleteElement(id: string): boolean {
    const model = this.getModelById(id)
    if (!model) return false

    const callback = {
      [ElementType.NODE]: this.deleteNode,
      [ElementType.EDGE]: this.deleteEdge,
    }
    return callback[model.BaseType]?.call(this, id) ?? false
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
      .map((element) => element.getData())
  }

  /**
   * 设置元素的自定义属性
   * @see todo docs link
   * @param id 元素的id
   * @param properties 自定义属性
   */
  setProperties(id: string, properties: PropertiesType): void {
    this.graphModel.getElement(id)?.setProperties(formatData(properties))
  }

  /**
   * 获取元素的自定义属性
   * @param id 元素的id
   * @returns 自定义属性
   */
  getProperties(id: string): PropertiesType | undefined {
    return this.graphModel.getElement(id)?.getProperties()
  }

  deleteProperty(id: string, key: string): void {
    this.graphModel.getElement(id)?.deleteProperty(key)
  }

  /**
   * FBI WARNING !!! 慎用 === 不要用
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

  /*********************************************************
   * Text 相关方法
   ********************************************************/
  /**
   * 显示节点、连线文本编辑框
   * @param id 元素id
   */
  editText(id: string): void {
    this.graphModel.editText(id)
  }

  /**
   * 更新节点或边的文案
   * @param id 节点或者边id
   * @param value 文案内容
   */
  updateText(id: string, value: string) {
    this.graphModel.updateText(id, value)
  }

  /*********************************************************
   * EditConfig 相关方法
   ********************************************************/
  /**
   * 更新流程图编辑相关设置
   * @param {object} config 编辑配置
   * @see todo docs link
   */
  updateEditConfig(config: Partial<IEditConfigType>) {
    const { editConfigModel, transformModel } = this.graphModel
    const currentSnapGrid = editConfigModel.snapGrid

    editConfigModel.updateEditConfig(config)
    if (config?.stopMoveGraph !== undefined) {
      transformModel.updateTranslateLimits(config.stopMoveGraph)
    }

    // 静默模式切换时，修改快捷键的启用状态
    config?.isSilentMode ? this.keyboard.disable() : this.keyboard.enable(true)

    // 切换网格对齐状态时，修改网格尺寸
    if (!isNil(config?.snapGrid) && config.snapGrid !== currentSnapGrid) {
      const {
        grid: { size = 1 },
      } = this.graphModel
      this.graphModel.updateGridSize(config.snapGrid ? size : 1)
    }
  }

  /**
   * 获取流程图当前编辑相关设置
   * @see todo docs link
   */
  getEditConfig() {
    return this.graphModel.editConfigModel.getConfig()
  }

  /*********************************************************
   * Graph 相关方法
   ********************************************************/
  /**
   * 设置主题样式
   * @param { object } style 自定义主题样式
   * todo docs link
   */
  setTheme(style: Partial<LogicFlow.Theme>): void {
    this.graphModel.setTheme(style)
  }

  private focusByElement(id: string) {
    let coordinate: Position | undefined = undefined
    const nodeModel = this.getNodeModelById(id)
    if (nodeModel) {
      const { x, y } = nodeModel.getData()
      coordinate = {
        x,
        y,
      }
    }
    const edgeModel = this.getEdgeModelById(id)
    if (edgeModel) {
      const { x, y } = edgeModel.textPosition
      coordinate = {
        x,
        y,
      }
    }

    if (coordinate) {
      this.focusByCoordinate(coordinate)
    }
  }

  private focusByCoordinate(coordinate: Position) {
    const { transformModel, width, height } = this.graphModel
    const { x, y } = coordinate
    transformModel.focusOn(x, y, width, height)
  }

  /**
   * 定位到画布视口中心
   * 支持用户传入图形当前的坐标或id，可以通过type来区分是节点还是边的id，也可以不传（兜底）
   * @param focusOnArgs.id 如果传入的是id, 则画布视口中心移动到此id的元素中心点。
   * @param focusOnArgs.coordinate 如果传入的是坐标，则画布视口中心移动到此坐标。
   * TODO: 测试下面代码，重构了一下逻辑，重载 api 定义
   */
  focusOn(id: string): void
  focusOn(coordinate: Position): void
  focusOn(focusOnArgs: LogicFlow.FocusOnArgsType): void
  focusOn(focusOnArgs: string | Position | LogicFlow.FocusOnArgsType): void {
    if (typeof focusOnArgs === 'string') {
      // string focusOnArgs -> id
      this.focusByElement(focusOnArgs)
    } else if ('x' in focusOnArgs && 'y' in focusOnArgs) {
      // Position focusOnArgs -> coordinate
      this.focusByCoordinate(focusOnArgs)
    } else {
      // FocusOnArgsType
      const { id, coordinate } = focusOnArgs
      if (id) {
        this.focusByElement(id)
      }
      if (coordinate) {
        this.focusByCoordinate(coordinate)
      }
    }
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
   * 将某个元素放置到顶部。
   * 如果堆叠模式为默认模式，则将原置顶元素重新恢复原有层级。
   * 如果堆叠模式为递增模式，则将需指定元素zIndex设置为当前最大zIndex + 1。
   * @see todo link 堆叠模式
   * @param id 元素Id
   */
  toFront(id: string) {
    this.graphModel.toFront(id)
  }

  /**
   * 获取事件位置相对于画布左上角的坐标
   * 画布所在的位置可以是页面任何地方，原生事件返回的坐标是相对于页面左上角的，该方法可以提供以画布左上角为原点的准确位置。
   * @param {number} x
   * @param {number} y
   * @returns {object} Point 事件位置的坐标
   * @returns {object} Point.domOverlayPosition HTML层上的坐标
   * @returns {object} Point.canvasOverlayPosition SVG层上的坐标
   */
  getPointByClient(x: number, y: number): ClientPosition
  getPointByClient(point: Position): ClientPosition
  getPointByClient(
    x: number | Position,
    y?: number,
  ): ClientPosition | undefined {
    if (typeof x === 'object') {
      return this.graphModel.getPointByClient(x)
    } else if (typeof y === 'number') {
      return this.graphModel.getPointByClient({
        x,
        y,
      })
    }
  }

  /**
   * 获取流程绘图数据
   * 注意: getGraphData返回的数据受到adapter影响，所以其数据格式不一定是logicflow内部图数据格式。
   * 如果实现通用插件，请使用getGraphRawData
   */
  getGraphData(...params: any): GraphData | unknown {
    const data = this.getGraphRawData()
    if (this.adapterOut) {
      return this.adapterOut(data, ...params)
    }
    return data
  }

  /**
   * 获取流程绘图原始数据
   * 在存在adapter时，可以使用getGraphRawData获取图原始数据
   */
  getGraphRawData(): GraphData {
    return this.graphModel.modelToGraphData()
  }

  /**
   * 清空画布
   */
  clearData() {
    this.graphModel.clearData()
    // 强制刷新数据, 让 preact 清除对已删除节点的引用
    this.render({})
  }

  /*********************************************************
   * LogicFlow Render方法
   ********************************************************/
  renderRawData(graphRawData: GraphConfigData) {
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
    this.emit(EventType.GRAPH_RENDERED, {
      data: this.graphModel.modelToGraphData(),
      graphModel: this.graphModel,
    })
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
  render(graphData: GraphConfigData) {
    let graphRawData = cloneDeep(graphData)
    if (this.adapterIn) {
      graphRawData = this.adapterIn(graphRawData)
    }
    this.renderRawData(graphRawData)
  }

  /*********************************************************
   * History/Resize 相关方法
   ********************************************************/
  /**
   * 历史记录操作
   * 返回上一步
   */
  undo() {
    if (!this.history.undoAble()) return
    // formatData兼容vue数据
    const graphData = formatData(this.history.undo()!)
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
    const graphData = formatData(this.history.redo()!)
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
   * @param edgeId string
   */
  openEdgeAnimation(edgeId: string): void {
    this.graphModel.openEdgeAnimation(edgeId)
  }

  /**
   * 关闭边的动画
   * @param edgeId string
   */
  closeEdgeAnimation(edgeId: string): void {
    this.graphModel.closeEdgeAnimation(edgeId)
  }

  /*********************************************************
   * 事件系统方法
   ********************************************************/
  /**
   * 监听事件
   * 事件详情见 @see todo
   * 支持同时监听多个事件
   * @example
   * lf.on('node:click,node:contextmenu', (data) => {
   * });
   */
  on<T extends keyof EventArgs>(evt: T, callback: EventCallback<T>): void
  on<T extends string>(evt: T, callback: EventCallback<T>): void
  on(evt: string, callback: EventCallback) {
    this.graphModel.eventCenter.on(evt, callback)
  }

  /**
   * 撤销监听事件
   */
  off<T extends keyof EventArgs>(evt: T, callback: EventCallback<T>): void
  off<T extends string>(evt: T, callback: EventCallback<T>): void
  off(evt: string, callback: EventCallback) {
    this.graphModel.eventCenter.off(evt, callback)
  }

  /**
   * 监听事件，只监听一次
   */
  once<T extends keyof EventArgs>(evt: T, callback: EventCallback<T>): void
  once<T extends string>(evt: T, callback: EventCallback<T>): void
  once(evt: string, callback: EventCallback) {
    this.graphModel.eventCenter.once(evt, callback)
  }

  /**
   * 触发监听事件
   */
  emit<T extends keyof EventArgs>(evts: T, eventArgs: CallbackArgs<T>): void
  emit<T extends string>(evts: T, eventArgs: CallbackArgs<T>): void
  emit(evt: string, arg: EventArgs) {
    this.graphModel.eventCenter.emit(evt, arg)
  }

  /*********************************************************
   * 插件系统方法
   ********************************************************/
  /**
   * 添加扩展, 待讨论，这里是不是静态方法好一些？
   * 重复添加插件的时候，把上一次添加的插件的销毁。
   * @param extension
   * @param props
   */
  static use(
    extension: ExtensionConstructor | ExtensionDefinition,
    props?: Record<string, unknown>,
  ): void {
    const { pluginName } = extension
    if (!pluginName) {
      throw new Error(`请给插件指定 pluginName!`)
    }
    // TODO: 应该在何时进行插件的销毁？？？
    // const preExtension = this.extensions.get(pluginName)?.extension
    // preExtension?.destroy?.() // 该代码应该有问题，因为 preExtension 直接用的是 Constructor，没有实例化。无法访问实例方法 destroy

    this.extensions.set(pluginName, {
      [pluginFlag]: pluginFlag,
      extension,
      props,
    })
  }

  private installPlugins(disabledPlugins: string[] = []) {
    const extensionsAddByUse = Array.from(
      LogicFlow.extensions,
      ([, extension]) => extension,
    )
    // 安装插件，优先使用个性插件
    const extensions = [...this.plugins, ...extensionsAddByUse]
    forEach(extensions, (ext) => {
      let extension: ExtensionConstructor | ExtensionDefinition
      let props: Record<string, any> | undefined

      if (pluginFlag in ext) {
        extension = ext.extension
        props = ext.props
      } else {
        extension = ext
      }

      const pluginName = extension?.pluginName

      if (indexOf(disabledPlugins, pluginName) === -1) {
        this.installPlugin(extension, props)
      }
    })
  }

  /**
   * 加载插件-内部方法
   */
  private installPlugin(
    extension: ExtensionConstructor | ExtensionDefinition,
    props?: Record<string, any>,
  ) {
    if ('pluginName' in extension && 'install' in extension) {
      const { pluginName, install, render } = extension
      if (pluginName) {
        install && install.call(extension, this, LogicFlow)
        render && this.components.push(render.bind(extension))
        this.extension[pluginName] = extension
      }
      return
    }

    const ExtensionCtor = extension as ExtensionConstructor
    const pluginName = ExtensionCtor.pluginName
    const extensionIns = new ExtensionCtor({
      lf: this,
      LogicFlow,
      props,
      // TODO: 这里的 options 应该传入插件对应的 options，而不是全局的 options
      // 所以应该这么写 this.options.pluginsOptions[ExtensionCtor.pluginName] ?? {}
      options: this.options.pluginsOptions?.[pluginName] ?? {},
    })
    extensionIns.render &&
      this.components.push(extensionIns.render.bind(extensionIns))
    this.extension[pluginName] = extensionIns
  }

  /** 销毁当前实例 */
  destroy() {
    this.clearData()
    render(null, this.container)
    this.keyboard.destroy()
    this.graphModel.destroy()
    this.tool.destroy()
    this.history.destroy()
    for (const extensionName in this.extension) {
      const extensionInstance = this.extension[extensionName]
      if ('destroy' in extensionInstance) {
        extensionInstance.destroy?.()
      }
    }
  }
}

// Option
export namespace LogicFlow {
  /**
   * LogicFlow init Options
   */
  export interface Options extends LFOptions.Common {}

  export type DomAttributes = {
    className?: string
    [key: string]: string | undefined
  }

  export interface PropertiesType {
    width?: number
    height?: number
    rx?: number
    ry?: number

    style?: LogicFlow.CommonTheme
    textStyle?: LogicFlow.CommonTheme

    [key: string]: any
  }
  export type AttributesType = Record<string, any>

  export type VectorData = {
    deltaX: number
    deltaY: number
  }
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
    [key: string]: any // TODO: 确认这个属性是干什么的呢？是有可以移除
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

  export type Direction = SegmentDirection
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
    x: number
    y: number
    editable?: boolean
    draggable?: boolean
    // 直接在这儿设置文本模式
    // overflowMode?: 'default' | 'autoWrap' | 'ellipsis'
  }

  // label数据类型声明
  export type LabelConfig = {
    id?: string // label唯一标识
    type?: string
    x: number
    y: number
    content?: string // 富文本内容
    value: string // 纯文本内容
    rotate?: number // 旋转角度
    // 样式属性
    style?: h.JSX.CSSProperties // label自定义样式

    // 编辑状态属性
    editable?: boolean
    draggable?: boolean
    labelWidth?: number
    textOverflowMode?: 'ellipsis' | 'wrap' | 'clip' | 'nowrap' | 'default'

    // 当前 Label 是否渲染纵向文本
    vertical?: boolean
  }

  export type LabelOption = {
    // 节点的所有 Label 是否纵向展示
    isVertical: boolean
    // 是否支持多个 label
    isMultiple: boolean
    // 允许设置多个 label 时最大个数
    maxCount?: number
  }

  export interface LabelData extends LabelConfig {
    id: string
    x: number
    y: number
    content: string
    value: string
  }

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

  export interface GraphConfigData {
    nodes?: NodeConfig[]
    edges?: EdgeConfig[]
  }

  export interface GraphData {
    nodes: NodeData[]
    edges: EdgeData[]
  }

  export interface FakeNodeConfig {
    type: string
    text?: TextConfig | string
    properties?: PropertiesType

    [key: string]: unknown
  }

  // DnD 拖拽插件使用的 NodeConfig
  export type OnDragNodeConfig = {
    type: string
    text?: TextConfig | string
    properties?: Record<string, unknown>
    [key: string]: any
  }

  export interface NodeConfig<P extends PropertiesType = PropertiesType> {
    id?: string
    type: string
    x: number
    y: number
    text?: TextConfig | string
    zIndex?: number
    properties?: P
    virtual?: boolean // 是否虚拟节点
    rotate?: number

    rotatable?: boolean // 节点是否可旋转
    resizable?: boolean // 节点是否可缩放

    [key: string]: any
  }

  export interface NodeData extends NodeConfig {
    id: string
    text?: TextConfig
    [key: string]: unknown
  }

  export interface EdgeConfig<P extends PropertiesType = PropertiesType> {
    id?: string
    type?: string // TODO: 将所有类型选项列出来；LogicFlow 内部默认为 polyline

    sourceNodeId: string
    sourceAnchorId?: string
    targetNodeId: string
    targetAnchorId?: string
    startPoint?: Point
    endPoint?: Point
    text?: TextConfig | string
    pointsList?: Point[]
    zIndex?: number
    properties?: P
  }

  export interface EdgeData extends EdgeConfig {
    id: string
    type: string
    text?: TextConfig
    startPoint: Point
    endPoint: Point

    [key: string]: unknown
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
    width?: number
    height?: number
    path?: string
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
    textWidth?: number
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
    resizeControl: CommonTheme // 节点旋转控制点样式
    resizeOutline: CommonTheme // 节点调整大小时的外框样式

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
  type FocusOnById = {
    id: string
    coordinate?: never
  }
  type FocusOnByCoordinate = {
    id?: string
    coordinate: Position
  }
  export type FocusOnArgsType = FocusOnById | FocusOnByCoordinate

  export type BaseNodeModelCtor = typeof BaseNodeModel<PropertiesType>
  export type BaseEdgeModelCtor = typeof BaseEdgeModel<PropertiesType>

  export type GraphElementCtor = BaseNodeModelCtor | BaseEdgeModelCtor
  export type GraphElement = BaseNodeModel | BaseEdgeModel
  export type GraphElements = {
    nodes: BaseNodeModel[]
    edges: BaseEdgeModel[]
  }

  export type RegisterConfig = {
    type: string
    // TODO: 确认 View 类型中 props 类型该如何动态获取真实组件的 props
    view: ComponentType<any> & {
      isObserved?: boolean
    }
    model: GraphElementCtor // TODO: 确认 model 的类型
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

  /**
   * Extension 插件类型
   */
  export type ExtensionType = ExtensionConstructor | ExtensionDefinition
  export type ExtensionConfig = {
    [pluginFlag]: symbol
    extension: ExtensionType
    props?: Record<string, any> // TODO: 看这类型是否可以更精确
  }

  export type IExtensionProps = {
    lf: LogicFlow
    LogicFlow: LogicFlowConstructor
    props?: Record<string, unknown>
    options: Record<string, unknown>
  }

  export interface ExtensionConstructor {
    pluginName: string
    new (props: IExtensionProps): Extension
  }

  export type ExtensionRenderFunc = (
    lf: LogicFlow,
    container: HTMLElement,
  ) => void

  // 对象形式定义的插件
  export type ExtensionDefinition = {
    pluginName: string
    install?: (lf: LogicFlow, LFCtor: LogicFlowConstructor) => void
    render?: ExtensionRenderFunc
  }

  export interface Extension {
    render: ExtensionRenderFunc
    destroy?: () => void // TODO: 确认插件销毁函数参数类型
  }
}

// toStringTag
export namespace LogicFlow {
  export const toStringTag = `LF.${LogicFlow.name}`
}

export default LogicFlow
