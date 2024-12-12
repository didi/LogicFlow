import {
  find,
  forEach,
  map,
  merge,
  isBoolean,
  debounce,
  isNil,
} from 'lodash-es'
import { action, computed, observable } from 'mobx'
import {
  BaseEdgeModel,
  BaseNodeModel,
  EditConfigModel,
  Model,
  PolylineEdgeModel,
  TransformModel,
} from '.'
import {
  DEFAULT_VISIBLE_SPACE,
  ELEMENT_MAX_Z_INDEX,
  ElementState,
  ElementType,
  EventType,
  ModelType,
  OverlapMode,
  TextMode,
} from '../constant'
import LogicFlow from '../LogicFlow'
import { Options as LFOptions } from '../options'
import {
  createEdgeGenerator,
  createUuid,
  formatData,
  getClosestPointOfPolyline,
  getMinIndex,
  getNodeAnchorPosition,
  getNodeBBox,
  getZIndex,
  isPointInArea,
  setupAnimation,
  setupTheme,
  snapToGrid,
  updateTheme,
} from '../util'
import EventEmitter from '../event/eventEmitter'
import { Grid } from '../view/overlay'
import Position = LogicFlow.Position
import PointTuple = LogicFlow.PointTuple
import GraphData = LogicFlow.GraphData
import NodeConfig = LogicFlow.NodeConfig
import BaseNodeModelCtor = LogicFlow.BaseNodeModelCtor
import BaseEdgeModelCtor = LogicFlow.BaseEdgeModelCtor

export class GraphModel {
  /**
   * LogicFlow画布挂载元素
   * 也就是初始化LogicFlow实例时传入的container
   */
  public readonly rootEl: HTMLElement
  readonly flowId?: string // 流程图 ID
  @observable width: number // 画布宽度
  @observable height: number // 画布高度

  // 流程图主题配置
  theme: LogicFlow.Theme
  // 网格配置
  @observable grid: Grid.GridOptions
  // 事件中心
  readonly eventCenter: EventEmitter
  // 维护所有节点和边类型对应的 model
  readonly modelMap: Map<string, LogicFlow.GraphElementCtor> = new Map()
  /**
   * 位于当前画布顶部的元素
   * 此元素只在堆叠模式为默认模式下存在
   * 用于在默认模式下将之前的顶部元素回复初始高度
   */
  topElement?: BaseNodeModel | BaseEdgeModel
  // 控制是否开启动画
  animation?: boolean | LFOptions.AnimationConfig
  // 自定义全局 id 生成器
  idGenerator?: (type?: string) => string | undefined
  // 节点间连线、连线变更时的边的生成规则
  edgeGenerator: LFOptions.Definition['edgeGenerator']

  // Remind：用于记录当前画布上所有节点和边的 model 的 Map
  // 现在的处理方式，用 this.nodes.map 生成的方式，如果在 new Model 的过程中依赖于其它节点的 model，会出现找不到的情况
  // eg: new DynamicGroupModel 时，需要获取当前 children 的 model，根据 groupModel 的 isCollapsed 状态更新子节点的 visible
  nodeModelMap: Map<string, BaseNodeModel> = new Map()
  edgeModelMap: Map<string, BaseEdgeModel> = new Map()
  elementsModelMap: Map<string, BaseNodeModel | BaseEdgeModel> = new Map()

  /**
   * 节点移动规则判断
   * 在节点移动的时候，会触发此数组中的所有规则判断
   */
  nodeMoveRules: Model.NodeMoveRule[] = []
  /**
   * 节点resize规则判断
   * 在节点resize的时候，会触发此数组中的所有规则判断
   */
  nodeResizeRules: Model.NodeResizeRule[] = []

  /**
   * 获取自定义连线轨迹
   */
  customTrajectory: LFOptions.Definition['customTrajectory']

  /**
   * 判断是否使用的是容器的宽度
   */
  isContainerWidth: boolean
  /**
   * 判断是否使用的是容器的高度
   */
  isContainerHeight: boolean

  // 在图上操作创建边时，默认使用的边类型.
  @observable edgeType: string
  // 当前图上所有节点的model
  @observable nodes: BaseNodeModel[] = []
  // 当前图上所有边的model
  @observable edges: BaseEdgeModel[] = []
  // 外部拖动节点进入画布的过程中，用fakeNode来和画布上正是的节点区分开
  @observable fakeNode?: BaseNodeModel | null

  /**
   * 元素重合时堆叠模式：
   * - DEFAULT（默认模式）：节点和边被选中，会被显示在最上面。当取消选中后，元素会恢复之前的层级
   * - INCREASE（递增模式）：节点和边被选中，会被显示在最上面。当取消选中后，元素会保持当前层级
   */
  @observable overlapMode = OverlapMode.DEFAULT
  // 背景配置
  @observable background?: boolean | LFOptions.BackgroundConfig
  // 网格大小
  @observable gridSize: number = 1
  // 控制画布的缩放、平移
  @observable transformModel: TransformModel
  // 控制流程图编辑相关配置项 Model
  @observable editConfigModel: EditConfigModel
  // 控制是否开启局部渲染
  @observable partial: boolean = false;

  // 用户自定义属性
  [propName: string]: any

  private waitCleanEffects: (() => void)[] = []

  constructor(options: LFOptions.Common) {
    const {
      container,
      partial,
      background = {},
      grid,
      idGenerator,
      edgeGenerator,
      animation,
      customTrajectory,
    } = options
    this.rootEl = container
    this.partial = !!partial
    this.background = background
    if (typeof grid === 'object' && options.snapGrid) {
      // 开启网格对齐时才根据网格尺寸设置步长
      // TODO：需要让用户设置成 0 吗？后面可以讨论一下
      this.gridSize = grid.size || 1 // 默认 gridSize 设置为 1
    }
    this.theme = setupTheme(options.style)
    this.grid = Grid.getGridOptions(grid ?? false)
    this.edgeType = options.edgeType || 'polyline'
    this.animation = setupAnimation(animation)
    this.overlapMode = options.overlapMode || OverlapMode.DEFAULT

    this.width = options.width ?? this.rootEl.getBoundingClientRect().width
    this.isContainerWidth = isNil(options.width)
    this.height = options.height ?? this.rootEl.getBoundingClientRect().height
    this.isContainerHeight = isNil(options.height)

    const resizeObserver = new ResizeObserver(
      debounce(
        ((entries) => {
          for (const entry of entries) {
            if (entry.target === this.rootEl) {
              this.resize()
              this.eventCenter.emit('graph:resize', {
                target: this.rootEl,
                contentRect: entry.contentRect,
              })
            }
          }
        }) as ResizeObserverCallback,
        16,
      ),
    )
    resizeObserver.observe(this.rootEl)
    this.waitCleanEffects.push(() => {
      resizeObserver.disconnect()
    })

    this.eventCenter = new EventEmitter()
    this.editConfigModel = new EditConfigModel(options)
    this.transformModel = new TransformModel(this.eventCenter, options)

    this.flowId = createUuid()
    this.idGenerator = idGenerator
    this.edgeGenerator = createEdgeGenerator(this, edgeGenerator)
    this.customTrajectory = customTrajectory
  }

  @computed get nodesMap(): GraphModel.NodesMapType {
    return this.nodes.reduce((nMap, model, index) => {
      nMap[model.id] = {
        index,
        model,
      }
      return nMap
    }, {} as GraphModel.NodesMapType)
  }

  @computed get edgesMap(): GraphModel.EdgesMapType {
    return this.edges.reduce((eMap, model, index) => {
      eMap[model.id] = {
        index,
        model,
      }
      return eMap
    }, {})
  }

  @computed get modelsMap(): GraphModel.ModelsMapType {
    return [...this.nodes, ...this.edges].reduce((eMap, model) => {
      eMap[model.id] = model
      return eMap
    }, {})
  }

  /**
   * 基于zIndex对元素进行排序。
   * todo: 性能优化
   */
  @computed get sortElements() {
    const elements = [...this.nodes, ...this.edges].sort(
      (a, b) => a.zIndex - b.zIndex,
    )

    // 只显示可见区域的节点和边
    const visibleElements: (BaseNodeModel | BaseEdgeModel)[] = []
    // TODO: 缓存，优化计算效率 by xutao. So how?
    const visibleLt: PointTuple = [
      -DEFAULT_VISIBLE_SPACE,
      -DEFAULT_VISIBLE_SPACE,
    ]
    const visibleRb: PointTuple = [
      this.width + DEFAULT_VISIBLE_SPACE,
      this.height + DEFAULT_VISIBLE_SPACE,
    ]
    for (let i = 0; i < elements.length; i++) {
      const currentItem = elements[i]
      // 如果节点不在可见区域，且不是全元素显示模式，则隐藏节点。
      if (
        currentItem.visible &&
        (!this.partial ||
          currentItem.isSelected ||
          this.isElementInArea(currentItem, visibleLt, visibleRb, false, false))
      ) {
        visibleElements.push(currentItem)
      }
    }
    return visibleElements
  }

  /**
   * 当前编辑的元素，低频操作，先循环找。
   */
  @computed get textEditElement() {
    const textEditNode = this.nodes.find(
      (node) => node.state === ElementState.TEXT_EDIT,
    )
    const textEditEdge = this.edges.find(
      (edge) => edge.state === ElementState.TEXT_EDIT,
    )
    return textEditNode || textEditEdge
  }

  /**
   * 当前画布所有被选中的元素
   */
  @computed get selectElements() {
    const elements = new Map<string, BaseNodeModel | BaseEdgeModel>()
    this.nodes.forEach((node) => {
      if (node.isSelected) {
        elements.set(node.id, node)
      }
    })
    this.edges.forEach((edge) => {
      if (edge.isSelected) {
        elements.set(edge.id, edge)
      }
    })
    return elements
  }

  @computed get selectNodes() {
    const nodes: BaseNodeModel[] = []
    this.nodes.forEach((node) => {
      if (node.isSelected) {
        nodes.push(node)
      }
    })
    return nodes
  }

  /**
   * 获取指定区域内的所有元素
   * @param leftTopPoint 表示区域左上角的点
   * @param rightBottomPoint 表示区域右下角的点
   * @param wholeEdge 是否要整个边都在区域内部
   * @param wholeNode 是否要整个节点都在区域内部
   * @param ignoreHideElement 是否忽略隐藏的节点
   */
  // TODO: rename getAreaElement to getElementsInArea or getAreaElements
  getAreaElement(
    leftTopPoint: PointTuple,
    rightBottomPoint: PointTuple,
    wholeEdge = true,
    wholeNode = true,
    ignoreHideElement = false,
  ) {
    const areaElements: LogicFlow.GraphElement[] = []
    forEach([...this.nodes, ...this.edges], (element) => {
      const isElementInArea = this.isElementInArea(
        element,
        leftTopPoint,
        rightBottomPoint,
        wholeEdge,
        wholeNode,
      )
      if ((!ignoreHideElement || element.visible) && isElementInArea) {
        areaElements.push(element)
      }
    })
    return areaElements
  }

  /**
   * 获取指定类型元素对应的Model
   */
  getModel(type: string) {
    return this.modelMap.get(type)
  }

  /**
   * 基于Id获取节点的model
   */
  getNodeModelById(nodeId: string): BaseNodeModel | undefined {
    if (this.fakeNode && nodeId === this.fakeNode.id) {
      return this.fakeNode
    }
    return this.nodesMap[nodeId]?.model
  }

  /**
   * 因为流程图所在的位置可以是页面任何地方
   * 当内部事件需要获取触发事件时，其相对于画布左上角的位置
   * 需要事件触发位置减去画布相对于client的位置
   */
  getPointByClient({
    x: x1,
    y: y1,
  }: LogicFlow.Point): LogicFlow.ClientPosition {
    const bbox = this.rootEl.getBoundingClientRect()
    const domOverlayPosition: Position = {
      x: x1 - bbox.left,
      y: y1 - bbox.top,
    }
    const [x, y] = this.transformModel.HtmlPointToCanvasPoint([
      domOverlayPosition.x,
      domOverlayPosition.y,
    ])
    const canvasOverlayPosition: Position = { x, y }
    return {
      domOverlayPosition,
      canvasOverlayPosition,
    }
  }

  /**
   * 判断一个元素是否在指定矩形区域内。
   * @param element 节点或者边
   * @param lt 左上角点
   * @param rb 右下角点
   * @param wholeEdge 边的起点和终点都在区域内才算
   * @param wholeNode 节点的box都在区域内才算
   */
  isElementInArea(
    element: BaseEdgeModel | BaseNodeModel,
    lt: PointTuple,
    rb: PointTuple,
    wholeEdge = true,
    wholeNode = true,
  ) {
    if (element.BaseType === ElementType.NODE) {
      element = element as BaseNodeModel
      // 节点是否在选区内，判断逻辑为如果节点的bbox的四个角上的点都在选区内，则判断节点在选区内
      const { minX, minY, maxX, maxY } = getNodeBBox(element)
      const bboxPointsList: Position[] = [
        {
          x: minX,
          y: minY,
        },
        {
          x: maxX,
          y: minY,
        },
        {
          x: maxX,
          y: maxY,
        },
        {
          x: minX,
          y: maxY,
        },
      ]
      let inArea = wholeNode
      for (let i = 0; i < bboxPointsList.length; i++) {
        let { x, y } = bboxPointsList[i]
        ;[x, y] = this.transformModel.CanvasPointToHtmlPoint([x, y])
        if (isPointInArea([x, y], lt, rb) !== wholeNode) {
          inArea = !wholeNode
          break
        }
      }
      return inArea
    }
    if (element.BaseType === ElementType.EDGE) {
      element = element as BaseEdgeModel
      const { startPoint, endPoint } = element
      const startHtmlPoint = this.transformModel.CanvasPointToHtmlPoint([
        startPoint.x,
        startPoint.y,
      ])
      const endHtmlPoint = this.transformModel.CanvasPointToHtmlPoint([
        endPoint.x,
        endPoint.y,
      ])
      const isStartInArea = isPointInArea(startHtmlPoint, lt, rb)
      const isEndInArea = isPointInArea(endHtmlPoint, lt, rb)
      return wholeEdge
        ? isStartInArea && isEndInArea
        : isStartInArea || isEndInArea
    }
    return false
  }

  /**
   * 使用新的数据重新设置整个画布的元素
   * 注意：将会清除画布上所有已有的节点和边
   * @param { object } graphData 图数据
   */
  graphDataToModel(graphData: Partial<LogicFlow.GraphConfigData>) {
    // 宽度必然存在，取消重新计算
    // if (!this.width || !this.height) {
    //   this.resize()
    // }
    if (!graphData) {
      this.clearData()
      return
    }
    this.elementsModelMap.clear()
    this.nodeModelMap.clear()
    this.edgeModelMap.clear()

    if (graphData.nodes) {
      this.nodes = map(graphData.nodes, (node: NodeConfig) => {
        const nodeModel = this.getModelAfterSnapToGrid(node)
        this.elementsModelMap.set(nodeModel.id, nodeModel)
        this.nodeModelMap.set(nodeModel.id, nodeModel)
        return nodeModel
      })
    } else {
      this.nodes = []
    }
    if (graphData.edges) {
      const currEdgeType = this.edgeType
      this.edges = map(graphData.edges, (edge) => {
        const Model = this.getModel(
          edge.type ?? currEdgeType,
        ) as BaseEdgeModelCtor
        if (!Model) {
          throw new Error(`找不到${edge.type}对应的边。`)
        }
        const edgeModel = new Model(edge, this)
        this.edgeModelMap.set(edgeModel.id, edgeModel)
        this.elementsModelMap.set(edgeModel.id, edgeModel)

        return edgeModel
      })
    } else {
      this.edges = []
    }
  }

  /**
   * 获取画布数据
   */
  modelToGraphData(): GraphData {
    const edges: LogicFlow.EdgeData[] = []
    this.edges.forEach((edge) => {
      const data = edge.getData()
      if (data && !edge.virtual) edges.push(data)
    })
    const nodes: LogicFlow.NodeData[] = []
    this.nodes.forEach((node) => {
      const data = node.getData()
      if (data && !node.virtual) nodes.push(data)
    })
    return {
      nodes,
      edges,
    }
  }

  // 用户history记录的数据，忽略拖拽过程中的数据变更
  modelToHistoryData(): GraphData | false {
    let nodeDragging = false
    const nodes: LogicFlow.NodeData[] = []
    // 如果有节点在拖拽中，不更新history
    for (let i = 0; i < this.nodes.length; i++) {
      const nodeModel = this.nodes[i]
      if (nodeModel.isDragging) {
        nodeDragging = true
        break
      } else {
        nodes.push(nodeModel.getHistoryData())
      }
    }
    if (nodeDragging) {
      return false
    }
    // 如果有边在拖拽中，不更新history
    let edgeDragging = false
    const edges: LogicFlow.EdgeData[] = []
    for (let j = 0; j < this.edges.length; j++) {
      const edgeMode = this.edges[j]
      if (edgeMode.isDragging) {
        edgeDragging = true
        break
      } else {
        edges.push(edgeMode.getHistoryData())
      }
    }
    if (edgeDragging) {
      return false
    }
    return {
      nodes,
      edges,
    }
  }

  /**
   * 获取边的model
   */
  getEdgeModelById(edgeId: string): BaseEdgeModel | undefined {
    return this.edgesMap[edgeId]?.model
  }

  /**
   * 获取节点或者边的model
   */
  getElement(id: string): BaseNodeModel | BaseEdgeModel | undefined {
    return this.modelsMap[id]
  }

  /**
   * 所有节点上所有边的model
   */
  getNodeEdges(nodeId: string): BaseEdgeModel[] {
    const edges: BaseEdgeModel[] = []
    for (let i = 0; i < this.edges.length; i++) {
      const edgeModel = this.edges[i]
      const nodeAsSource = edgeModel.sourceNodeId === nodeId
      const nodeAsTarget = edgeModel.targetNodeId === nodeId
      if (nodeAsSource || nodeAsTarget) {
        edges.push(edgeModel)
      }
    }
    return edges
  }

  /**
   * 获取选中的元素数据
   * @param isIgnoreCheck 是否包括sourceNode和targetNode没有被选中的边,默认包括。
   * 复制的时候不能包括此类边, 因为复制的时候不允许悬空的边
   */
  getSelectElements(isIgnoreCheck = true): GraphData {
    const elements = this.selectElements
    const graphData: GraphData = {
      nodes: [],
      edges: [],
    }
    elements.forEach((element) => {
      if (element.BaseType === ElementType.NODE) {
        graphData.nodes.push(element.getData())
      }
      if (element.BaseType === ElementType.EDGE) {
        const edgeData = element.getData()
        const isNodeSelected =
          elements.get(edgeData.sourceNodeId) &&
          elements.get(edgeData.targetNodeId)

        if (isIgnoreCheck || isNodeSelected) {
          graphData.edges.push(edgeData)
        }
      }
    })
    return graphData
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
    const element = this.getElement(id)
    element?.updateAttributes(attributes)
  }

  /**
   * 修改节点的id， 如果不传新的id，会内部自动创建一个。
   * @param { string } nodeId 将要被修改的id
   * @param { string } newId 可选，修改后的id
   * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
   */
  changeNodeId(nodeId: string, newId?: string): string {
    if (!newId) {
      newId = createUuid()
    }
    if (this.nodesMap[newId]) {
      console.warn(`当前流程图已存在节点${newId}, 修改失败`)
      return ''
    }
    if (!this.nodesMap[nodeId]) {
      console.warn(`当前流程图找不到节点${nodeId}, 修改失败`)
      return ''
    }
    this.edges.forEach((edge) => {
      if (edge.sourceNodeId === nodeId) {
        edge.sourceNodeId = newId as string
      }
      if (edge.targetNodeId === nodeId) {
        edge.targetNodeId = newId as string
      }
    })
    this.nodesMap[nodeId].model.id = newId
    this.nodesMap[newId] = this.nodesMap[nodeId]
    return newId
  }

  /**
   * 修改边的id， 如果不传新的id，会内部自动创建一个。
   * @param { string } oldId 将要被修改的id
   * @param { string } newId 可选，修改后的id
   * @returns 修改后的节点id, 如果传入的oldId不存在，返回空字符串
   */
  changeEdgeId<T extends string>(oldId: string, newId?: string): T | string {
    if (!newId) {
      newId = createUuid()
    }
    if (this.edgesMap[newId]) {
      console.warn(`当前流程图已存在边: ${newId}, 修改失败`)
      return ''
    }
    if (!this.edgesMap[oldId]) {
      console.warn(`当前流程图找不到边: ${newId}, 修改失败`)
      return ''
    }
    this.edges.forEach((edge) => {
      if (edge.id === oldId) {
        // edge.id = newId
        edge.changeEdgeId(newId as string)
      }
    })
    return newId
  }

  /**
   * 获取元素的文本模式
   * @param model
   */
  getTextModel(model: BaseNodeModel): TextMode | undefined {
    const { textMode, nodeTextMode, edgeTextMode } = this.editConfigModel

    // textMode 的优先级：
    // 元素自身 model.textMode > editConfigModel.node(edge)TextMode > editConfigModel.textMode
    if (model.BaseType === ElementType.NODE) {
      return model.textMode || nodeTextMode || textMode || TextMode.TEXT
    }

    // 同上
    if (model.BaseType === ElementType.EDGE) {
      return model.textMode || edgeTextMode || textMode || TextMode.TEXT
    }
  }

  /**
   * 更新元素的文本模式
   * @param mode
   * @param model
   */
  @action
  setTextMode(mode: TextMode, model?: BaseNodeModel | BaseEdgeModel) {
    // 如果有传入 model，则直接更新 model 的 textMode
    if (model) {
      // model.updateTextMode(mode)
    }
    // 调用 editConfigModel 的方法更新 textMode
    this.editConfigModel.updateEditConfig({ textMode: mode })
  }

  /**
   * 内部保留方法，请勿直接使用
   */
  @action
  setFakeNode(nodeModel: BaseNodeModel) {
    this.fakeNode = nodeModel
  }

  /**
   * 内部保留方法，请勿直接使用
   */
  @action
  removeFakeNode() {
    this.fakeNode = null
  }

  /**
   * 设置指定类型的Model,请勿直接使用
   */
  @action
  setModel(type: string, ModelClass: LogicFlow.GraphElementCtor) {
    return this.modelMap.set(type, ModelClass)
  }

  /**
   * 将某个元素放置到顶部。
   * 如果堆叠模式为默认模式，则将原置顶元素重新恢复原有层级。
   * 如果堆叠模式为递增模式，则将需指定元素zIndex设置为当前最大zIndex + 1。
   * @see todo link 堆叠模式
   * @param id 元素Id
   */
  @action
  toFront(id: string) {
    const element = this.nodesMap[id]?.model || this.edgesMap[id]?.model
    if (element) {
      if (this.overlapMode === OverlapMode.DEFAULT) {
        this.topElement?.setZIndex()
        element.setZIndex(ELEMENT_MAX_Z_INDEX)
        this.topElement = element
      }
      if (this.overlapMode === OverlapMode.INCREASE) {
        this.setElementZIndex(id, 'top')
      }
    }
  }

  /**
   * 设置元素的zIndex.
   * 注意：默认堆叠模式下，不建议使用此方法。
   * @see todo link 堆叠模式
   * @param id 元素id
   * @param zIndex zIndex的值，可以传数字，也支持传入 'top' 和 'bottom'
   */
  @action
  setElementZIndex(id: string, zIndex: number | 'top' | 'bottom') {
    const element = this.nodesMap[id]?.model || this.edgesMap[id]?.model
    if (element) {
      let index: number
      if (typeof zIndex === 'number') {
        index = zIndex
      } else {
        if (zIndex === 'top') {
          index = getZIndex()
        }
        if (zIndex === 'bottom') {
          index = getMinIndex()
        }
      }
      element.setZIndex(index!)
    }
  }

  /**
   * 删除节点
   * @param {string} nodeId 节点Id
   */
  @action
  deleteNode(nodeId: string) {
    const nodeModel = this.nodesMap[nodeId].model
    const nodeData = nodeModel.getData()
    this.deleteEdgeBySource(nodeId)
    this.deleteEdgeByTarget(nodeId)
    this.nodes.splice(this.nodesMap[nodeId].index, 1)
    this.eventCenter.emit(EventType.NODE_DELETE, {
      data: nodeData,
      model: nodeModel,
    })
  }

  /**
   * 添加节点
   * @param nodeConfig 节点配置
   * @param eventType 新增节点事件类型，默认EventType.NODE_ADD, 在Dnd拖拽时，会传入EventType.NODE_DND_ADD
   * @param event MouseEvent 鼠标事件
   */
  @action
  addNode(
    nodeConfig: NodeConfig,
    eventType: EventType = EventType.NODE_ADD,
    event?: MouseEvent,
  ) {
    const originNodeData = formatData(nodeConfig)
    // 添加节点的时候，如果这个节点 id 已经存在，则采用新 id
    const { id } = originNodeData
    if (id && this.nodesMap[id]) {
      delete originNodeData.id
    }
    const nodeModel = this.getModelAfterSnapToGrid(originNodeData)
    this.nodes.push(nodeModel)
    const nodeData = nodeModel.getData()
    const eventData: Record<string, any> = { data: nodeData }
    if (event) {
      eventData.e = event
    }
    this.eventCenter.emit(eventType, eventData)
    return nodeModel
  }

  /**
   * 将node节点位置进行grid修正
   * 同时处理node内文字的偏移量
   * 返回一个位置修正过的复制节点NodeModel
   * @param node
   */
  getModelAfterSnapToGrid(node: NodeConfig) {
    const Model = this.getModel(node.type) as BaseNodeModelCtor
    const { snapGrid } = this.editConfigModel
    if (!Model) {
      throw new Error(
        `找不到${node.type}对应的节点，请确认是否已注册此类型节点。`,
      )
    }
    const { x: nodeX, y: nodeY } = node
    // 根据 grid 修正节点的 x, y
    if (nodeX && nodeY) {
      node.x = snapToGrid(nodeX, this.gridSize, snapGrid)
      node.y = snapToGrid(nodeY, this.gridSize, snapGrid)
      if (typeof node.text === 'object' && node.text !== null) {
        // 原来的处理是：node.text.x -= getGridOffset(nodeX, this.gridSize)
        // 由于snapToGrid()使用了Math.round()四舍五入的做法，因此无法判断需要执行
        // node.text.x = node.text.x + getGridOffset()
        // 还是
        // node.text.x = node.text.x - getGridOffset()
        // 直接改为node.x - nodeX就可以满足上面的要求
        node.text.x += node.x - nodeX
        node.text.y += node.y - nodeY
      }
    }
    const nodeModel = new Model(node, this)
    this.nodeModelMap.set(nodeModel.id, nodeModel)
    this.elementsModelMap.set(nodeModel.id, nodeModel)

    return nodeModel
  }

  /**
   * 克隆节点
   * @param nodeId 节点Id
   */
  @action
  cloneNode(nodeId: string) {
    const targetNode = this.getNodeModelById(nodeId)
    const data = targetNode?.getData()
    if (data) {
      data.x += 30
      data.y += 30
      data.id = ''
      if (typeof data.text === 'object' && data.text !== null) {
        data.text.x += 30
        data.text.y += 30
      }
      const nodeModel = this.addNode(data)
      nodeModel.setSelected(true)
      targetNode?.setSelected(false)
      return nodeModel.getData()
    }
  }

  /**
   * 移动节点-相对位置
   * @param nodeId 节点Id
   * @param deltaX X轴移动距离
   * @param deltaY Y轴移动距离
   * @param isIgnoreRule 是否忽略移动规则限制
   */
  @action
  moveNode(
    nodeId: string,
    deltaX: number,
    deltaY: number,
    isIgnoreRule = false,
  ) {
    // 1) 移动节点
    const node = this.nodesMap[nodeId]
    if (!node) {
      console.warn(`不存在id为${nodeId}的节点`)
      return
    }
    const nodeModel = node.model
    ;[deltaX, deltaY] = nodeModel.getMoveDistance(deltaX, deltaY, isIgnoreRule)
    // 2) 移动边
    this.moveEdge(nodeId, deltaX, deltaY)
  }

  /**
   * 移动节点-绝对位置
   * @param nodeId 节点Id
   * @param x X轴目标位置
   * @param y Y轴目标位置
   * @param isIgnoreRule 是否忽略条件，默认为 false
   */
  @action
  moveNode2Coordinate(
    nodeId: string,
    x: number,
    y: number,
    isIgnoreRule = false,
  ) {
    // 1) 移动节点
    const node = this.nodesMap[nodeId]
    if (!node) {
      console.warn(`不存在id为${nodeId}的节点`)
      return
    }
    const nodeModel = node.model
    const { x: originX, y: originY } = nodeModel
    const deltaX = x - originX
    const deltaY = y - originY
    this.moveNode(nodeId, deltaX, deltaY, isIgnoreRule)
  }

  /**
   * 显示节点、连线文本编辑框
   * @param id 节点 or 连线 id
   */
  @action
  editText(id: string) {
    this.setElementStateById(id, ElementState.TEXT_EDIT)
  }

  /**
   * 给两个节点之间添加一条边
   * @param {object} edgeConfig
   */
  @action
  addEdge(edgeConfig: LogicFlow.EdgeConfig): BaseEdgeModel {
    const edgeOriginData = formatData(edgeConfig)
    // 边的类型优先级：自定义>全局>默认
    let { type } = edgeOriginData
    if (!type) {
      type = this.edgeType
    }
    if (edgeOriginData.id && this.edgesMap[edgeOriginData.id]) {
      delete edgeOriginData.id
    }
    const Model = this.getModel(type) as BaseEdgeModelCtor
    if (!Model) {
      throw new Error(`找不到${type}对应的边，请确认是否已注册此类型边。`)
    }
    const edgeModel = new Model(
      {
        ...edgeOriginData,
        type,
      },
      this,
    )
    this.edgeModelMap.set(edgeModel.id, edgeModel)
    this.elementsModelMap.set(edgeModel.id, edgeModel)

    const edgeData = edgeModel.getData()
    this.edges.push(edgeModel)
    this.eventCenter.emit(EventType.EDGE_ADD, { data: edgeData })
    return edgeModel
  }

  /**
   * 移动边，内部方法，请勿直接使用
   */
  @action
  moveEdge(nodeId: string, deltaX: number, deltaY: number) {
    /* 更新相关边位置 */
    for (let i = 0; i < this.edges.length; i++) {
      const edgeModel = this.edges[i]
      const { x, y } = edgeModel.textPosition
      const nodeAsSource = this.edges[i].sourceNodeId === nodeId
      const nodeAsTarget = this.edges[i].targetNodeId === nodeId
      if (nodeAsSource) {
        edgeModel.moveStartPoint(deltaX, deltaY)
      }
      if (nodeAsTarget) {
        edgeModel.moveEndPoint(deltaX, deltaY)
      }
      // 如果有文案了，当节点移动引起文案位置修改时，找出当前文案位置与最新边距离最短距离的点
      // 最大程度保持节点位置不变且在边上
      if (nodeAsSource || nodeAsTarget) {
        this.handleEdgeTextMove(edgeModel, x, y)
      }
    }
  }

  /**
   * 如果有文案了，当节点移动引起文案位置修改时，找出当前文案位置与最新边距离最短距离的点
   * 最大程度保持节点位置不变且在边上
   * @param edgeModel 边的数据管理类
   * @param x X轴移动距离
   * @param y Y轴移动距离
   */
  handleEdgeTextMove(edgeModel: BaseEdgeModel, x: number, y: number) {
    // todo: 找到更好的边位置移动处理方式
    // 如果是自定义边文本位置，则移动节点的时候重新计算其位置
    if (edgeModel.customTextPosition) {
      edgeModel.resetTextPosition()
      return
    }
    if (
      edgeModel.modelType === ModelType.POLYLINE_EDGE &&
      edgeModel.text?.value
    ) {
      const textPosition = edgeModel.text
      const newPoint = getClosestPointOfPolyline(textPosition, edgeModel.points)
      edgeModel.moveText(
        newPoint.x - textPosition.x,
        newPoint.y - textPosition.y,
      )
    }
    const { x: x1, y: y1 } = edgeModel.textPosition
    edgeModel.moveText(x1 - x, y1 - y)
  }

  /**
   * 删除两节点之间的边
   * @param sourceNodeId 边的起始节点
   * @param targetNodeId 边的目的节点
   */
  @action
  deleteEdgeBySourceAndTarget(sourceNodeId: string, targetNodeId: string) {
    for (let i = 0; i < this.edges.length; i++) {
      if (
        this.edges[i].sourceNodeId === sourceNodeId &&
        this.edges[i].targetNodeId === targetNodeId
      ) {
        const edgeData = this.edges[i].getData()
        this.edges.splice(i, 1)
        i--
        this.eventCenter.emit(EventType.EDGE_DELETE, { data: edgeData })
      }
    }
  }

  /**
   * 基于边Id删除边
   */
  @action
  deleteEdgeById(id: string) {
    const edge = this.edgesMap[id]
    if (!edge) {
      return
    }
    const idx = this.edgesMap[id].index
    const edgeData = this.edgesMap[id].model.getData()
    this.edges.splice(idx, 1)
    this.eventCenter.emit(EventType.EDGE_DELETE, { data: edgeData })
  }

  /**
   * 删除以节点Id为起点的所有边
   */
  @action
  deleteEdgeBySource(sourceNodeId: string) {
    for (let i = 0; i < this.edges.length; i++) {
      if (this.edges[i].sourceNodeId === sourceNodeId) {
        const edgeData = this.edges[i].getData()
        this.edges.splice(i, 1)
        i--
        this.eventCenter.emit(EventType.EDGE_DELETE, { data: edgeData })
      }
    }
  }

  /**
   * 删除以节点Id为终点的所有边
   */
  @action
  deleteEdgeByTarget(targetNodeId: string) {
    for (let i = 0; i < this.edges.length; i++) {
      if (this.edges[i].targetNodeId === targetNodeId) {
        const edgeData = this.edges[i].getData()
        this.edges.splice(i, 1)
        i--
        this.eventCenter.emit(EventType.EDGE_DELETE, { data: edgeData })
      }
    }
  }

  /**
   * 设置元素的状态，在需要保证整个画布上所有的元素只有一个元素拥有此状态时可以调用此方法。
   * 例如文本编辑、菜单显示等。
   * additionStateData: 传递的额外值，如菜单显示的时候，需要传递期望菜单显示的位置。
   */
  @action
  setElementStateById(
    id: string,
    state: ElementState,
    additionStateData?: Model.AdditionStateDataType,
  ) {
    this.nodes.forEach((node) => {
      if (node.id === id) {
        node.setElementState(state, additionStateData)
      } else {
        node.setElementState(ElementState.DEFAULT)
      }
    })
    this.edges.forEach((edge) => {
      if (edge.id === id) {
        edge.setElementState(state, additionStateData)
      } else {
        edge.setElementState(ElementState.DEFAULT)
      }
    })
  }

  /**
   * 更新节点或边的文案
   * @param id 节点或者边id
   * @param value 文案内容
   */
  @action
  updateText(id: string, value: string) {
    const element = find(
      [...this.nodes, ...this.edges],
      (item) => item.id === id,
    )
    element?.updateText(value)
  }

  /**
   * 选中节点
   * @param id 节点Id
   * @param multiple 是否为多选，如果为多选，则不去掉原有已选择节点的选中状态
   */
  @action selectNodeById(id: string, multiple = false) {
    if (!multiple) {
      this.clearSelectElements()
    }
    const selectElement = this.nodesMap[id]?.model
    selectElement?.setSelected(true)
  }

  /**
   * 选中边
   * @param id 边Id
   * @param multiple 是否为多选，如果为多选，则不去掉原已选中边的状态
   */
  @action selectEdgeById(id: string, multiple = false) {
    if (!multiple) {
      this.clearSelectElements()
    }
    const selectElement = this.edgesMap[id]?.model
    selectElement?.setSelected(true)
  }

  /**
   * 将图形选中
   * @param id 选择元素ID
   * @param multiple 是否允许多选，如果为true，不会将上一个选中的元素重置
   */
  @action
  selectElementById(id: string, multiple = false) {
    if (!multiple) {
      this.clearSelectElements()
    }
    const selectElement = this.getElement(id)
    selectElement?.setSelected(true)
  }

  /**
   * 将所有选中的元素设置为非选中
   */
  @action
  clearSelectElements() {
    this.selectElements.forEach((element) => {
      element?.setSelected(false)
    })
    this.selectElements.clear()
    /**
     * 如果堆叠模式为默认模式，则将置顶元素重新恢复原有层级
     */
    if (this.overlapMode === OverlapMode.DEFAULT) {
      this.topElement?.setZIndex()
    }
  }

  /**
   * 批量移动节点，节点移动的时候，会动态计算所有节点与未移动节点的边位置
   * 移动的节点之间的边会保持相对位置
   */
  @action
  moveNodes(
    nodeIds: string[],
    deltaX: number,
    deltaY: number,
    isIgnoreRule = false,
  ) {
    // FIX: https://github.com/didi/LogicFlow/issues/1015
    // 如果节点之间存在连线，则只移动连线一次。
    const nodeIdMap: Record<string, [number, number]> = nodeIds.reduce(
      (acc, cur) => {
        const nodeModel = this.nodesMap[cur]?.model
        if (nodeModel) {
          acc[cur] = nodeModel.getMoveDistance(deltaX, deltaY, isIgnoreRule)
        }
        return acc
      },
      {},
    )
    for (let i = 0; i < this.edges.length; i++) {
      const edgeModel = this.edges[i]
      const { x, y } = edgeModel.textPosition
      const sourceMoveDistance = nodeIdMap[edgeModel.sourceNodeId]
      const targetMoveDistance = nodeIdMap[edgeModel.targetNodeId]
      let textDistanceX: number
      let textDistanceY: number
      if (
        sourceMoveDistance &&
        targetMoveDistance &&
        edgeModel.modelType === ModelType.POLYLINE_EDGE
      ) {
        // 移动框选区时，如果边polyline在框选范围内，则边的轨迹pointsList也要整体移动
        ;[textDistanceX, textDistanceY] = sourceMoveDistance
        ;(edgeModel as PolylineEdgeModel).updatePointsList(
          textDistanceX,
          textDistanceY,
        )
      } else {
        if (sourceMoveDistance) {
          ;[textDistanceX, textDistanceY] = sourceMoveDistance
          edgeModel.moveStartPoint(textDistanceX, textDistanceY)
        }
        if (targetMoveDistance) {
          ;[textDistanceX, textDistanceY] = targetMoveDistance
          edgeModel.moveEndPoint(textDistanceX, textDistanceY)
        }
      }
      if (sourceMoveDistance || targetMoveDistance) {
        // https://github.com/didi/LogicFlow/issues/1191
        // moveNode()跟moveNodes()没有统一处理方式，moveNodes()缺失了下面的逻辑
        // moveNode()：当节点移动引起文案位置修改时，找出当前文案位置与最新边距离最短距离的点，最大程度保持节点位置不变且在边上
        // 因此将moveNode()处理边文字的逻辑抽离出来，统一moveNode()跟moveNodes()的处理逻辑
        this.handleEdgeTextMove(edgeModel, x, y)
      }
    }
  }

  /**
   * 添加节点移动限制规则，在节点移动的时候触发。
   * 如果方法返回false, 则会阻止节点移动。
   * @param fn function
   * @example
   *
   * graphModel.addNodeMoveRules((nodeModel, x, y) => {
   *   if (nodeModel.properties.disabled) {
   *     return false
   *   }
   *   return true
   * })
   *
   */
  addNodeMoveRules(fn: Model.NodeMoveRule) {
    if (!this.nodeMoveRules.includes(fn)) {
      this.nodeMoveRules.push(fn)
    }
  }

  addNodeResizeRules(fn: Model.NodeResizeRule) {
    if (!this.nodeResizeRules.includes(fn)) {
      this.nodeResizeRules.push(fn)
    }
  }

  /**
   * 设置默认的边类型
   * 也就是设置在节点直接有用户手动绘制的连线类型。
   * @param type LFOptions.EdgeType
   */
  @action
  setDefaultEdgeType(type: LFOptions.EdgeType): void {
    this.edgeType = type
  }

  /**
   * 修改指定节点类型
   * @param id 节点id
   * @param type 节点类型
   */
  @action
  changeNodeType(id: string, type: string): void {
    const nodeModel = this.getNodeModelById(id)
    if (!nodeModel) {
      console.warn(`找不到id为${id}的节点`)
      return
    }
    const data = nodeModel.getData()
    data.type = type
    const Model = this.getModel(type) as BaseNodeModelCtor
    if (!Model) {
      throw new Error(`找不到${type}对应的节点，请确认是否已注册此类型节点。`)
    }
    const newNodeModel = new Model(data, this)
    this.nodes.splice(this.nodesMap[id].index, 1, newNodeModel)
    // 微调边
    const edgeModels = this.getNodeEdges(id)
    edgeModels.forEach((edge) => {
      if (edge.sourceNodeId === id) {
        const point = getNodeAnchorPosition(
          newNodeModel,
          edge.startPoint,
          newNodeModel.width,
          newNodeModel.height,
        )
        edge.updateStartPoint(point)
      }
      if (edge.targetNodeId === id) {
        const point = getNodeAnchorPosition(
          newNodeModel,
          edge.endPoint,
          newNodeModel.width,
          newNodeModel.height,
        )
        edge.updateEndPoint(point)
      }
    })
  }

  /**
   * 切换边的类型
   * @param id 边Id
   * @param type 边类型
   */
  @action changeEdgeType(id: string, type: LFOptions.EdgeType) {
    const edgeModel = this.getEdgeModelById(id)
    if (!edgeModel) {
      console.warn(`找不到id为${id}的边`)
      return
    }
    if (edgeModel.type === type) {
      return
    }
    const data = edgeModel.getData()
    data.type = type
    const Model = this.getModel(type) as BaseEdgeModelCtor
    if (!Model) {
      throw new Error(`找不到${type}对应的节点，请确认是否已注册此类型节点。`)
    }
    // 为了保持切换类型时不复用上一个类型的轨迹
    delete data.pointsList
    const newEdgeModel = new Model(data, this)
    this.edges.splice(this.edgesMap[id].index, 1, newEdgeModel)
  }

  /**
   * 获取所有以此节点为终点的边
   */
  @action getNodeIncomingEdge(nodeId: string) {
    const edges: BaseEdgeModel[] = []
    this.edges.forEach((edge) => {
      if (edge.targetNodeId === nodeId) {
        edges.push(edge)
      }
    })
    return edges
  }

  /**
   * 获取所有以此节点为起点的边
   */
  @action getNodeOutgoingEdge(nodeId: string) {
    const edges: BaseEdgeModel[] = []
    this.edges.forEach((edge) => {
      if (edge.sourceNodeId === nodeId) {
        edges.push(edge)
      }
    })
    return edges
  }

  /**
   * 获取所有以此锚点为终点的边
   */
  @action getAnchorIncomingEdge(anchorId?: string) {
    const edges: BaseEdgeModel[] = []
    this.edges.forEach((edge) => {
      if (edge.targetAnchorId === anchorId) {
        edges.push(edge)
      }
    })
    return edges
  }

  /**
   * 获取所有以此锚点为起点的边
   */
  @action getAnchorOutgoingEdge(anchorId?: string) {
    const edges: BaseEdgeModel[] = []
    this.edges.forEach((edge) => {
      if (edge.sourceAnchorId === anchorId) {
        edges.push(edge)
      }
    })
    return edges
  }

  /**
   * 获取节点连接到的所有起始节点
   */
  @action getNodeIncomingNode(nodeId?: string) {
    const nodes: BaseNodeModel[] = []
    this.edges.forEach((edge) => {
      if (edge.targetNodeId === nodeId) {
        nodes.push(this.nodesMap[edge.sourceNodeId]?.model)
      }
    })
    return nodes
  }

  /**
   * 获取节点所有的下一级节点
   */
  @action getNodeOutgoingNode(nodeId?: string) {
    const nodes: BaseNodeModel[] = []
    this.edges.forEach((edge) => {
      if (edge.sourceNodeId === nodeId) {
        nodes.push(this.nodesMap[edge.targetNodeId].model)
      }
    })
    return nodes
  }

  /**
   * 设置主题
   * todo docs link
   */
  @action setTheme(style: Partial<LogicFlow.Theme>) {
    this.theme = updateTheme({ ...this.theme, ...style })
  }

  /**
   * 更新网格配置
   */
  updateGridOptions(options: Partial<Grid.GridOptions>) {
    merge(this.grid, options)
  }

  /**
   * 更新网格尺寸
   */
  updateGridSize(size: number) {
    this.gridSize = size
  }

  /**
   * 更新背景配置
   */
  updateBackgroundOptions(
    options: boolean | Partial<LFOptions.BackgroundConfig>,
  ) {
    if (isBoolean(options) || isBoolean(this.background)) {
      this.background = options
    } else {
      this.background = {
        ...this.background,
        ...options,
      }
    }
  }

  /**
   * 重新设置画布的宽高
   */
  @action resize(width?: number, height?: number): void {
    this.width = width ?? this.rootEl.getBoundingClientRect().width
    this.isContainerWidth = isNil(width)
    this.height = height ?? this.rootEl.getBoundingClientRect().height
    this.isContainerHeight = isNil(height)

    if (!this.width || !this.height) {
      console.warn(
        '渲染画布的时候无法获取画布宽高，请确认在container已挂载到DOM。@see https://github.com/didi/LogicFlow/issues/675',
      )
    }
  }

  /**
   * 清空画布
   */
  @action clearData(): void {
    this.nodes = []
    this.edges = []

    // 清除对已清除节点的引用
    this.edgeModelMap.clear()
    this.nodeModelMap.clear()
    this.elementsModelMap.clear()
  }

  /**
   * 获取图形区域虚拟矩型的尺寸和中心坐标
   * @returns
   */
  getVirtualRectSize(): GraphModel.VirtualRectProps {
    const { nodes } = this
    let nodesX: number[] = []
    let nodesY: number[] = []
    // 获取所有节点组成的x，y轴最大最小值，这里考虑了图形的长宽和边框
    nodes.forEach((node) => {
      const { x, y, width, height } = node
      const { strokeWidth = 0 } = node.getNodeStyle()
      const maxX = x + width / 2 + strokeWidth
      const minX = x - width / 2 - strokeWidth
      const maxY = y + height / 2 + strokeWidth
      const minY = y - height / 2 - strokeWidth
      nodesX = nodesX.concat([maxX, minX].filter((num) => !Number.isNaN(num)))
      nodesY = nodesY.concat([maxY, minY].filter((num) => !Number.isNaN(num)))
    })

    const minX = Math.min(...nodesX)
    const maxX = Math.max(...nodesX)
    const minY = Math.min(...nodesY)
    const maxY = Math.max(...nodesY)

    const virtualRectWidth = maxX - minX || 0
    const virtualRectHeight = maxY - minY || 0

    // 获取虚拟矩型的中心坐标
    const virtualRectCenterPositionX = minX + virtualRectWidth / 2
    const virtualRectCenterPositionY = minY + virtualRectHeight / 2

    return {
      width: virtualRectWidth,
      height: virtualRectHeight,
      x: virtualRectCenterPositionX,
      y: virtualRectCenterPositionY,
    }
  }

  /**
   * 将图形整体移动到画布中心
   */
  @action translateCenter(): void {
    const { nodes, width, height, rootEl, transformModel } = this
    if (!nodes.length) {
      return
    }

    const containerWidth = width || rootEl.clientWidth
    const containerHeight = height || rootEl.clientHeight

    const { x: virtualRectCenterPositionX, y: virtualRectCenterPositionY } =
      this.getVirtualRectSize()

    // 将虚拟矩型移动到画布中心
    transformModel.focusOn(
      virtualRectCenterPositionX,
      virtualRectCenterPositionY,
      containerWidth,
      containerHeight,
    )
  }

  /**
   * 画布图形适应屏幕大小
   * @param verticalOffset number 距离盒子上下的距离， 默认为20
   * @param horizontalOffset number 距离盒子左右的距离， 默认为20
   */
  @action fitView(verticalOffset = 20, horizontalOffset = 20): void {
    const { nodes, width, height, rootEl, transformModel } = this
    if (!nodes.length) {
      return
    }
    const containerWidth = width || rootEl.clientWidth
    const containerHeight = height || rootEl.clientHeight

    const {
      width: virtualRectWidth,
      height: virtualRectHeight,
      x: virtualRectCenterPositionX,
      y: virtualRectCenterPositionY,
    } = this.getVirtualRectSize()

    const zoomRatioX = (virtualRectWidth + horizontalOffset) / containerWidth
    const zoomRatioY = (virtualRectHeight + verticalOffset) / containerHeight
    const zoomRatio = 1 / Math.max(zoomRatioX, zoomRatioY)

    const point: PointTuple = [containerWidth / 2, containerHeight / 2]
    // 适应画布大小
    transformModel.zoom(zoomRatio, point)
    // 将虚拟矩型移动到画布中心
    transformModel.focusOn(
      virtualRectCenterPositionX,
      virtualRectCenterPositionY,
      containerWidth,
      containerHeight,
    )
  }

  /**
   * 开启边的动画
   * @param edgeId string
   */
  @action openEdgeAnimation(edgeId: string): void {
    const edgeModel = this.getEdgeModelById(edgeId)
    edgeModel?.openEdgeAnimation()
  }

  /**
   * 关闭边的动画
   * @param edgeId string
   */
  @action closeEdgeAnimation(edgeId: string): void {
    const edgeModel = this.getEdgeModelById(edgeId)
    edgeModel?.closeEdgeAnimation()
  }

  /**
   * 获取当前局部渲染模式
   * @returns boolean
   */
  getPartial(): boolean {
    return this.partial
  }

  /**
   * 设置是否开启局部渲染模式
   * @param partial boolean
   * @returns
   */
  @action setPartial(partial: boolean): void {
    this.partial = partial
  }

  /** 销毁当前实例 */
  destroy() {
    try {
      this.waitCleanEffects.forEach((fn) => {
        fn()
      })
    } catch (err) {
      console.warn('error on destroy GraphModel', err)
    }
    this.waitCleanEffects.length = 0
    this.eventCenter.destroy()
  }
}

export namespace GraphModel {
  export type NodesMapType = Record<
    string,
    {
      index: number
      model: BaseNodeModel
    }
  >
  export type EdgesMapType = Record<
    string,
    {
      index: number
      model: BaseEdgeModel
    }
  >

  export type ModelsMapType = Record<string, BaseNodeModel | BaseEdgeModel>

  // 虚拟矩阵信息类型
  export type VirtualRectProps = {
    width: number
    height: number
    x: number
    y: number
  }
}

export default GraphModel
