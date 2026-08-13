/**
 * 基于DynamicGroup重新实现的泳池节点组件
 * 充分利用DynamicGroup的分组管理能力，实现完整的泳道功能
 */
import LogicFlow, { GraphModel } from '@logicflow/core'
import { computed, observable } from 'mobx'
import { forEach, merge, cloneDeep } from 'lodash-es'
import {
  DynamicGroupNodeModel,
  IGroupNodeProperties,
} from '../dynamic-group/model'
import { laneConfig, poolConfig, TitlePosition } from './constant'
import { getTitleLayout, resolvePoolTitlePosition } from './utils'

// import { LaneModel } from './NewLane'

import NodeConfig = LogicFlow.NodeConfig

export type LayoutLanesReason =
  | 'init'
  | 'add'
  | 'delete'
  | 'reorder'
  | 'resize'
  | 'collapse'
  | 'move-to-pool'

export type LayoutLanesOptions = {
  /** 记录触发布局的业务动作，便于调用方表达意图并扩展差异化处理。 */
  reason?: LayoutLanesReason
  /** resize 时只有被操作的 lane 可以决定交叉轴尺寸。 */
  resizedLaneId?: string
  resizedAxis?: 'width' | 'height'
  /** Core resize control index: 0 left-top, 1 right-top, 2 right-bottom, 3 left-bottom. */
  resizeIndex?: number
}

export type LaneDropIndicator = {
  laneId: string
  index: number
  /** 插入槽位左上角及尺寸，用于渲染拖拽 Lane 的预期占位框。 */
  x: number
  y: number
  width: number
  height: number
}

export class PoolModel extends DynamicGroupNodeModel {
  // 泳池特定属性
  // 标题区域大小：如果是垂直方向，指代的就是标题区的宽度，如果是水平方向，指代的就是标题区的高度
  titleSize: number = poolConfig.titleSize
  poolConfig: typeof poolConfig = poolConfig
  readonly isPool: boolean = true
  @observable laneDropIndicator?: LaneDropIndicator
  @observable isLaneDropTarget: boolean = false
  /** Pool 折叠/展开时由 Pool 统一收口布局，避免子 Lane toggle 时把容器尺寸抢先改回展开态。 */
  isSyncingPoolCollapse: boolean = false
  laneCollapseSnapshot: Map<string, boolean> = new Map()

  // 标记是否已创建默认泳道
  _defaultLaneCreated: boolean = false
  constructor(data: NodeConfig<IGroupNodeProperties>, graphModel: GraphModel) {
    super(data, graphModel)
  }

  @computed get isHorizontal() {
    return this.properties?.direction === 'horizontal'
  }

  getResolvedTitlePosition() {
    return resolvePoolTitlePosition(this.properties)
  }

  getTitleTextBox() {
    if (this.isCollapsed) {
      return { x: this.x, y: this.y, width: this.width, height: this.height }
    }
    return getTitleLayout(
      { x: this.x, y: this.y, width: this.width, height: this.height },
      this.getResolvedTitlePosition(),
      this.titleSize,
    ).titleBox
  }

  isTitleTextVerticallyCentered() {
    return true
  }

  getTitleRenderPosition(): TitlePosition {
    return this.isCollapsed ? 'top' : this.getResolvedTitlePosition()
  }

  /**
   * 标题边配置既影响 Pool 的内容区，也会影响继承该配置的 Lane 标题。
   * 统一在此刷新，避免调用方只更新 properties 后出现文字仍停留在旧标题区。
   */
  setProperties(properties: Partial<IGroupNodeProperties>) {
    const collapsedLaneTitlePositions = new Map(
      this.getOrderedLanes()
        .filter((lane: any) => lane.isCollapsed)
        .map((lane: any) => [lane.id, lane.getResolvedTitlePosition()]),
    )
    super.setProperties(properties)
    const hasPoolTitleChange = Object.prototype.hasOwnProperty.call(
      properties,
      'titlePosition',
    )
    const hasLaneTitleChange = Object.prototype.hasOwnProperty.call(
      properties,
      'laneConfig',
    )
    if (!hasPoolTitleChange && !hasLaneTitleChange) return

    if (hasPoolTitleChange && this.children?.size) {
      this.layoutLanesByOrder({ reason: 'resize' })
    }
    this.updateTextPosition()
    this.getOrderedLanes().forEach((lane: any) => {
      const previousTitlePosition = collapsedLaneTitlePositions.get(lane.id)
      if (previousTitlePosition) {
        lane.refreshCollapsedTitleBounds?.(previousTitlePosition)
      }
      lane.updateTextPosition?.()
    })
    if (collapsedLaneTitlePositions.size) {
      this.layoutLanesByOrder({ reason: 'collapse' })
    }
  }

  initNodeData(data: LogicFlow.NodeConfig<IGroupNodeProperties>) {
    super.initNodeData(data)
    if (data.properties) {
      // 泳池基础配置
      this.width = data.properties?.width || poolConfig.defaultWidth
      this.height = data.properties?.height || poolConfig.defaultHeight
    }
    // Pool 使用独立的较宽折叠默认值；显式配置仍优先于默认值。
    this.collapsedWidth =
      data.properties?.collapsedWidth ?? poolConfig.collapsedWidth
    this.collapsedHeight =
      data.properties?.collapsedHeight ?? poolConfig.collapsedHeight

    // 动态分组配置
    this.autoResize = false
    this.isRestrict = true
    this.transformWithContainer = true
    this.resizable = false
    this.rotatable = false
    this.autoToFront = false

    // 允许文本编辑
    this.text.editable = true

    // 初始化文本位置
    this.updateTextPosition()
    this.addEventListeners()
    this.layoutLanesByOrder({ reason: 'init' })
  }

  // 增加监听事件
  addEventListeners() {
    this.graphModel.eventCenter.on(
      'node:resize',
      ({ data, preData, index }) => {
        if (!this.children.has(data.id)) return
        const resizedNode = this.graphModel.getNodeModelById(data.id)
        if (!resizedNode || String(resizedNode.type) !== 'lane') return

        const widthChanged =
          data.properties?.width !== preData.properties?.width
        const heightChanged =
          data.properties?.height !== preData.properties?.height
        // 交叉轴变化需要同步给所有泳道；不能按 pool 方向固定判断，否则缩窄会被旧最大值回写。
        const resizedAxis = this.isHorizontal
          ? widthChanged
            ? 'width'
            : 'height'
          : heightChanged
            ? 'height'
            : 'width'

        this.layoutLanesByOrder({
          reason: 'resize',
          resizedLaneId: data.id,
          resizedAxis,
          resizeIndex: index,
        })
      },
    )
  }

  /**
   * 获取需要由 Pool 一起移动的直接子节点。
   *
   * @param groupModel 当前触发分组移动查询的容器模型。
   * @returns 未处于拖拽状态的直接子节点 id 列表。
   */
  getNodesInGroup(groupModel: DynamicGroupNodeModel): string[] {
    const nodeIds: string[] = []
    if (groupModel.isGroup) {
      forEach(Array.from(groupModel.children), (nodeId: string) => {
        const nodeModel = this.graphModel.getNodeModelById(nodeId)
        // 拖拽泳道时会触发泳池的getNodesInGroup，这时泳池再触发移动的子泳道里就需要剔除当前正在拖拽的泳道
        if (nodeModel && !nodeModel.isDragging) {
          nodeIds.push(nodeId)
        }
      })
    }
    return nodeIds
  }
  /**
   * 统一从标题几何中解析文本锚点，保证四边标题和旧数据兼容路径使用同一套结果。
   */
  setTextPosition() {
    if (!this.text) return

    // DynamicGroup 构造期间会提前调用该方法，此时 PoolModel 的字段还未完成初始化。
    const titleSize = this.titleSize || poolConfig.titleSize
    const titleBox = this.getTitleTextBox()
    const textAnchor = this.isCollapsed
      ? { x: titleBox.x, y: titleBox.y }
      : getTitleLayout(
          { x: this.x, y: this.y, width: this.width, height: this.height },
          this.getResolvedTitlePosition(),
          titleSize,
        ).textAnchor

    if (this.text.x !== textAnchor.x || this.text.y !== textAnchor.y) {
      this.text = {
        ...this.text,
        x: textAnchor.x,
        y: textAnchor.y,
      }
    }
  }

  private updateTextPosition() {
    this.setTextPosition()
  }

  /**
   * 根据子泳道自动调整泳池尺寸
   */
  resizePool() {
    this.layoutLanesByOrder({ reason: 'resize' })
  }

  /**
   * 重新调整所有泳道布局
   * @param newLanePosition 添加位置（可选）：'above'|'below'|'left'|'right'
   * @param newLaneId 新添加的泳道ID（可选）
   */
  resizeChildrenWithNewLane(
    newLanePosition?: 'above' | 'below' | 'left' | 'right',
    newLaneId?: string,
  ) {
    if (!newLanePosition || !newLaneId) return

    const ids = this.getOrderedLanes().map((lane: any) => lane.id)
    const newLaneIndex = ids.indexOf(newLaneId)
    if (newLaneIndex === -1) return

    ids.splice(newLaneIndex, 1)
    const referenceLaneId =
      this.graphModel.getNodeModelById(newLaneId)?.properties?.referenceLaneId
    const referenceIndex = referenceLaneId ? ids.indexOf(referenceLaneId) : -1
    const insertIndex =
      referenceIndex === -1
        ? 0
        : ['above', 'left'].includes(newLanePosition)
          ? referenceIndex
          : referenceIndex + 1
    ids.splice(insertIndex, 0, newLaneId)
    this.setLaneOrder(ids, { reason: 'add' })
  }

  /**
   * 将 Lane 移动到指定坐标，并同步其子节点与折叠态虚拟边。
   *
   * @param lane 需要移动的 Lane 模型。
   * @param newX Lane 的目标 x 坐标。
   * @param newY Lane 的目标 y 坐标。
   * @param moveChildren 是否同步移动 Lane 内的子节点，默认值为 true。
   * @returns {void}
   */
  moveLane(lane: any, newX: number, newY: number, moveChildren = true): void {
    const deltaX = newX - lane.x
    const deltaY = newY - lane.y
    const childPositions = lane.captureChildrenRelativePositions?.()

    // 布局移动绕过了普通拖拽事件，因此必须在这里显式同步 lane、子节点与虚拟边。
    lane.moveTo(newX, newY, true)
    // 泳道不会经过 GraphModel.moveNode，因此需同步直接挂在泳道上的折叠虚拟边。
    this.graphModel.moveEdge(lane.id, deltaX, deltaY)
    if (moveChildren && childPositions) {
      lane.restoreChildrenRelativePositions(childPositions)
    }
  }

  /**
   * 按当前 Lane 顺序重新计算所有 Lane 和 Pool 的几何布局。
   *
   * @returns {void}
   */
  resizeChildren() {
    this.layoutLanesByOrder({ reason: 'resize' })
  }

  /**
   * 获取当前 Pool 的有序 Lane 模型。
   *
   * @returns 按 Pool children 顺序排列的 Lane 模型列表。
   */
  getOrderedLanes(): any[] {
    return Array.from(this.children)
      .map((childId) => this.graphModel.getNodeModelById(childId))
      .filter((node: any) => node && String(node.type) === 'lane') as any[]
  }

  /**
   * 更新 Pool 的 Lane 顺序，并按需立即重排几何位置。
   *
   * @param laneIds 完整的 Lane id 顺序。
   * @param options 布局触发原因及特殊布局参数。
   * @returns {void}
   */
  setLaneOrder(laneIds: string[], options?: LayoutLanesOptions): void {
    this.children = new Set(laneIds)
    this.setProperties({ ...this.properties, children: laneIds })
    if (options) {
      this.layoutLanesByOrder(options)
    }
  }

  /**
   * 获取折叠 Lane 之间使用的主轴间距。
   *
   * @returns 当前 Pool 配置的折叠间距。
   */
  getCollapsedLaneGap(): number {
    const configuredGap = (
      this.properties?.laneConfig as { collapsedLaneGap?: number } | undefined
    )?.collapsedLaneGap
    return typeof configuredGap === 'number'
      ? configuredGap
      : laneConfig.collapsedLaneGap
  }

  /**
   * 相邻边界只要任一侧 Lane 折叠，就预留一份 gap。
   * 这样两个折叠 Lane 的共享边界也只会累计一次。
   *
   * @param index 当前 Lane 在有序列表中的下标。
   * @param lanes 参与计算的 Lane 列表，默认使用当前 Pool 的有序 Lane。
   * @returns 该 Lane 前方需要预留的折叠间距。
   */
  getCollapsedLaneGapBefore(
    index: number,
    lanes = this.getOrderedLanes(),
  ): number {
    if (index <= 0 || index >= lanes.length) return 0
    const previousLane = lanes[index - 1]
    const currentLane = lanes[index]
    if (!previousLane || !currentLane) return 0
    return previousLane.isCollapsed || currentLane.isCollapsed
      ? this.getCollapsedLaneGap()
      : 0
  }

  private getLaneAxisSize(lane: { width: number; height: number }) {
    return this.isHorizontal ? lane.height : lane.width
  }

  /**
   * Lane 折叠只收缩标题所在的轴，交叉轴仍需保留展开态尺寸。
   * 否则所有 Lane 都折叠时，Pool 会把标题条的长轴也错误缩短。
   */
  private getLaneCrossAxisSize(lane: {
    width: number
    height: number
    expandWidth?: number
    expandHeight?: number
    isCollapsed?: boolean
  }) {
    if (this.isHorizontal) {
      return lane.isCollapsed ? (lane.expandWidth ?? lane.width) : lane.width
    }
    return lane.isCollapsed ? (lane.expandHeight ?? lane.height) : lane.height
  }

  /** 折叠标题条在交叉轴贴合其标题边，展开 Lane 保持内容区居中。 */
  private getLaneCrossAxisCenter(
    lane: any,
    contentBox: { x: number; y: number; width: number; height: number },
  ) {
    if (!lane.isCollapsed) {
      return this.isHorizontal ? contentBox.x : contentBox.y
    }
    const titlePosition = lane.getResolvedTitlePosition?.()
    if (this.isHorizontal) {
      if (titlePosition === 'left') {
        return contentBox.x - contentBox.width / 2 + lane.width / 2
      }
      if (titlePosition === 'right') {
        return contentBox.x + contentBox.width / 2 - lane.width / 2
      }
      return contentBox.x
    }
    if (titlePosition === 'top') {
      return contentBox.y - contentBox.height / 2 + lane.height / 2
    }
    if (titlePosition === 'bottom') {
      return contentBox.y + contentBox.height / 2 - lane.height / 2
    }
    return contentBox.y
  }

  /**
   * 计算指定 Lane 槽位之前在主轴上累计占用的距离。
   *
   * 预览占位、drop indicator 和正式布局都使用该方法保持同一套折叠间隙规则。
   *
   * @param index 目标 Lane 在当前顺序中的槽位下标。
   * @param lanes 参与计算的 Lane 列表，默认使用当前 Pool 的有序 Lane。
   * @returns 目标槽位之前的主轴累计偏移。
   */
  getLaneAxisOffset(index: number, lanes = this.getOrderedLanes()) {
    let offset = 0
    for (let cursor = 0; cursor < index; cursor++) {
      offset += this.getLaneAxisSize(lanes[cursor])
      offset += this.getCollapsedLaneGapBefore(cursor + 1, lanes)
    }
    return offset
  }

  private getLaneAxisTotal(lanes = this.getOrderedLanes()) {
    return lanes.reduce(
      (total, lane, index) =>
        total +
        this.getCollapsedLaneGapBefore(index, lanes) +
        this.getLaneAxisSize(lane),
      0,
    )
  }

  /**
   * 根据指针坐标计算单 Lane 拖拽时的插入下标。
   *
   * 多选 Lane block 的下标修正由 lane-block.ts 处理。
   *
   * @param point 指针在画布中的坐标。
   * @returns 单 Lane 的目标插入下标。
   */
  getLaneInsertIndex(point: { x: number; y: number }): number {
    const lanes = this.getOrderedLanes()
    const axisValue = this.isHorizontal ? point.y : point.x

    for (let index = 0; index < lanes.length; index++) {
      const lane = lanes[index]
      const center = this.isHorizontal ? lane.y : lane.x
      if (axisValue < center) return index
    }

    return lanes.length
  }

  /**
   * 在当前 Pool 内按目标槽位重排单条 Lane。
   *
   * @param laneId 需要重排的 Lane id。
   * @param insertIndex 基于当前完整 Lane 顺序的目标插入下标。
   * @returns 顺序发生变化时返回 true，否则返回 false。
   */
  reorderLane(laneId: string, insertIndex: number): boolean {
    const ids = this.getOrderedLanes().map((lane: any) => lane.id)
    const originIndex = ids.indexOf(laneId)
    if (originIndex === -1) return false

    const normalizedIndex = Math.max(0, Math.min(insertIndex, ids.length))
    ids.splice(originIndex, 1)
    const nextIndex =
      normalizedIndex > originIndex ? normalizedIndex - 1 : normalizedIndex
    ids.splice(nextIndex, 0, laneId)

    const currentIds = this.getOrderedLanes().map((lane: any) => lane.id)
    if (ids.join('|') === currentIds.join('|')) return false

    this.setLaneOrder(ids, { reason: 'reorder' })
    return true
  }

  /**
   * 将当前 Pool 中的一条 Lane 移动到目标 Pool。
   *
   * 这是单 Lane 跨 Pool 拖拽的底层原子操作：更新两个 Pool 的 laneOrder，再改 Lane parent。
   *
   * @param laneId 待迁移的 Lane id。
   * @param targetPoolId 目标 Pool id。
   * @param insertIndex 目标 Pool 中的插入下标。
   * @returns 迁移成功时返回 true。
   */
  moveLaneToPool(
    laneId: string,
    targetPoolId: string,
    insertIndex: number,
  ): boolean {
    const targetPool = this.graphModel.getNodeModelById(targetPoolId) as any
    const lane = this.graphModel.getNodeModelById(laneId) as any
    if (!targetPool || String(targetPool.type) !== 'pool') return false
    if (!lane || String(lane.type) !== 'lane') return false
    if (!this.children.has(laneId)) return false

    if (targetPool.id === this.id) {
      return this.reorderLane(laneId, insertIndex)
    }

    if (!this.canRemoveLane(1)) return false

    const sourceIds = this.getOrderedLanes()
      .map((item: any) => item.id)
      .filter((id: string) => id !== laneId)
    this.setLaneOrder(sourceIds)

    const targetIds = targetPool.getOrderedLanes().map((item: any) => item.id)
    const nextIndex = Math.max(0, Math.min(insertIndex, targetIds.length))
    targetIds.splice(nextIndex, 0, laneId)
    targetPool.setLaneOrder(targetIds)

    lane.setProperties({
      ...lane.properties,
      parent: targetPool.id,
      direction: targetPool.properties?.direction,
      isHorizontal: targetPool.isHorizontal,
    })

    this.layoutLanesByOrder({ reason: 'move-to-pool' })
    targetPool.layoutLanesByOrder({ reason: 'move-to-pool' })
    return true
  }

  /**
   * Pool 内 Lane 布局的统一收口点。
   *
   * 新增、删除、resize、折叠、换序、跨池迁移最终都走这里，保证 Pool 尺寸、
   * Lane 坐标、标题位置和连线 title 恢复使用同一套规则。
   *
   * @param options 本次布局触发原因及 resize 上下文。
   */
  layoutLanesByOrder(options: LayoutLanesOptions = {}) {
    const lanes = this.getOrderedLanes()
    if (lanes.length === 0) return
    const edgeTextOffsets = this.captureLaneRelatedEdgeTextOffsets(lanes)
    const resizedLane = options.resizedLaneId
      ? lanes.find((lane: any) => lane.id === options.resizedLaneId)
      : undefined
    const titlePosition = this.getResolvedTitlePosition()
    const titleOnSide = titlePosition === 'left' || titlePosition === 'right'
    const titleOnTopOrBottom =
      titlePosition === 'top' || titlePosition === 'bottom'
    const keepResizeOppositeBoundary =
      options.reason === 'resize' && typeof options.resizeIndex === 'number'
    const resizeFromLeft =
      options.resizeIndex === 0 || options.resizeIndex === 3
    const resizeFromTop = options.resizeIndex === 0 || options.resizeIndex === 1

    // Pool 尺寸永远由当前有序 lane 列表推导，不能先按单条 lane 的中间尺寸更新。
    // 标题在四边时，泳道只能占用 contentBox，不能继续从 Pool 外框左上角起算。
    if (this.isHorizontal) {
      const contentWidth =
        options.resizedAxis === 'width' && resizedLane
          ? resizedLane.width
          : Math.max(
              ...lanes.map((lane: any) => this.getLaneCrossAxisSize(lane)),
            )
      const nextPoolWidth = contentWidth + (titleOnSide ? this.titleSize : 0)
      const nextPoolHeight =
        this.getLaneAxisTotal(lanes) + (titleOnTopOrBottom ? this.titleSize : 0)

      if (keepResizeOppositeBoundary) {
        this.x += ((resizeFromLeft ? -1 : 1) * (nextPoolWidth - this.width)) / 2
        this.y +=
          ((resizeFromTop ? -1 : 1) * (nextPoolHeight - this.height)) / 2
      }
      this.width = nextPoolWidth
      this.height = nextPoolHeight
      const contentBox = getTitleLayout(
        { x: this.x, y: this.y, width: this.width, height: this.height },
        titlePosition,
        this.titleSize,
      ).contentBox

      let top = contentBox.y - contentBox.height / 2
      lanes.forEach((lane: any, index: number) => {
        top += this.getCollapsedLaneGapBefore(index, lanes)
        // 折叠 Lane 的标题条尺寸必须保留，不能在统一布局时被展开态宽高覆盖。
        lane.width = lane.isCollapsed ? lane.collapsedWidth : contentBox.width
        this.moveLane(
          lane,
          this.getLaneCrossAxisCenter(lane, contentBox),
          top + lane.height / 2,
          lane.id !== options.resizedLaneId,
        )
        lane.setProperties({
          ...lane.properties,
          parent: this.id,
          width: lane.width,
          height: lane.height,
        })
        lane.updateTextPosition?.()
        top += lane.height
      })
    } else {
      const contentHeight =
        options.resizedAxis === 'height' && resizedLane
          ? resizedLane.height
          : Math.max(
              ...lanes.map((lane: any) => this.getLaneCrossAxisSize(lane)),
            )
      const nextPoolWidth =
        this.getLaneAxisTotal(lanes) + (titleOnSide ? this.titleSize : 0)
      const nextPoolHeight =
        contentHeight + (titleOnTopOrBottom ? this.titleSize : 0)

      if (keepResizeOppositeBoundary) {
        this.x += ((resizeFromLeft ? -1 : 1) * (nextPoolWidth - this.width)) / 2
        this.y +=
          ((resizeFromTop ? -1 : 1) * (nextPoolHeight - this.height)) / 2
      }
      this.width = nextPoolWidth
      this.height = nextPoolHeight
      const contentBox = getTitleLayout(
        { x: this.x, y: this.y, width: this.width, height: this.height },
        titlePosition,
        this.titleSize,
      ).contentBox

      let left = contentBox.x - contentBox.width / 2
      lanes.forEach((lane: any, index: number) => {
        left += this.getCollapsedLaneGapBefore(index, lanes)
        // 同上：折叠态只保留标题边，主布局不能把它重新拉回展开高度。
        lane.height = lane.isCollapsed
          ? lane.collapsedHeight
          : contentBox.height
        this.moveLane(
          lane,
          left + lane.width / 2,
          this.getLaneCrossAxisCenter(lane, contentBox),
          lane.id !== options.resizedLaneId,
        )
        lane.setProperties({
          ...lane.properties,
          parent: this.id,
          width: lane.width,
          height: lane.height,
        })
        lane.updateTextPosition?.()
        left += lane.width
      })
    }

    this.updateTextPosition()
    this.resetLaneRelatedEdgeTextPositions(edgeTextOffsets)
  }

  getLaneRelatedEdges(lanes: DynamicGroupNodeModel[]) {
    const childIds = new Set<string>()
    lanes.forEach((lane) => {
      lane.children.forEach((childId: string) => childIds.add(childId))
    })

    return this.graphModel.edges.filter((edge) => {
      return (
        edge.text?.value &&
        (childIds.has(edge.sourceNodeId) || childIds.has(edge.targetNodeId))
      )
    })
  }

  /**
   * 记录关联边 title 相对默认 textPosition 的偏移。
   *
   * layout 之后会重算边路径和默认 title 位置，再把这个偏移补回去，保留用户拖动过的 title。
   *
   * @param lanes 参与本次布局的 Lane。
   * @returns 每条关联边相对默认 title 位置的偏移。
   */
  captureLaneRelatedEdgeTextOffsets(lanes: DynamicGroupNodeModel[]) {
    return this.getLaneRelatedEdges(lanes).reduce(
      (offsets: Record<string, { x: number; y: number }>, edge) => {
        offsets[edge.id] = {
          x: edge.text.x - edge.textPosition.x,
          y: edge.text.y - edge.textPosition.y,
        }
        return offsets
      },
      {},
    )
  }

  resetLaneRelatedEdgeTextPositions(
    edgeTextOffsets: Record<string, { x: number; y: number }>,
  ) {
    // 跨泳道边会在多个泳道的中间布局中重复更新，最终统一按最终路径计算标题位置。
    Object.entries(edgeTextOffsets).forEach(([edgeId, offset]) => {
      const edge = this.graphModel.getEdgeModelById(edgeId)
      if (!edge?.text?.value) return
      edge.resetTextPosition()
      edge.moveText(offset.x, offset.y)
    })
  }

  /**
   * 获取子泳道
   *
   * @returns 当前 Pool 直接包含的 Lane 模型列表。
   */
  getLanes(): any[] {
    const children: any[] = []
    Array.from(this.children).forEach((childId) => {
      const childModel = this.graphModel.getNodeModelById(childId)
      if (childModel && String(childModel.type) === 'lane') {
        children.push(childModel)
      }
    })
    return children
  }

  /**
   * 添加泳道的公共方法
   *
   * @param position 添加位置：'above'|'below'|'left'|'right'。
   * @param laneData 泳道数据，可选。
   * @returns 新建的 Lane 数据。
   */
  addLane(position: 'above' | 'below' | 'left' | 'right', laneData?: any): any {
    const lanes = this.getLanes()
    if (lanes.length === 0) {
      return this.createDefaultLane(laneData)
    }

    // 计算初始位置
    let initialX = this.x
    let initialY = this.y
    // 参考泳道（用于定位）
    const referenceLane = lanes.find((lane) => lane.id === laneData?.id)
    // 用于确定新泳道尺寸的参考泳道，优先使用referenceLane，其次使用现有第一个泳道，最后回退到泳池尺寸
    const sizeLane = referenceLane || lanes[0]
    // 参考泳道处于折叠态时，当前宽高仅是标题区；新增泳道始终采用展开尺寸。
    const laneWidth = sizeLane?.expandWidth ?? sizeLane?.width ?? this.width
    const laneHeight = sizeLane?.expandHeight ?? sizeLane?.height ?? this.height

    if (this.isHorizontal && ['above', 'below'].includes(position)) {
      if (referenceLane) {
        initialY =
          position === 'above'
            ? referenceLane.y - referenceLane.height / 2 - laneHeight / 2
            : referenceLane.y + referenceLane.height / 2 + laneHeight / 2
        initialX = referenceLane.x
      }
    }
    if (!this.isHorizontal && ['left', 'right'].includes(position)) {
      if (referenceLane) {
        initialX =
          position === 'left'
            ? referenceLane.x - referenceLane.width / 2 - laneWidth / 2
            : referenceLane.x + referenceLane.width / 2 + laneWidth / 2
        initialY = referenceLane.y
      }
    }

    // 确保不将referenceLaneId作为parent或者其他可能引起递归引用的属性传入
    // laneData可能包含一些运行时属性，需要清理
    const cleanLaneData = cloneDeep(laneData)
    if (cleanLaneData) {
      delete cleanLaneData.id
      delete cleanLaneData.children
      delete cleanLaneData.properties?.parent
      delete cleanLaneData.properties?.children
      delete cleanLaneData.properties?.isCollapsed
      // DynamicGroup 初始化会优先读取 properties 中的运行时尺寸，不能复制折叠尺寸。
      delete cleanLaneData.properties?.width
      delete cleanLaneData.properties?.height
      delete cleanLaneData.properties?.collapsedWidth
      delete cleanLaneData.properties?.collapsedHeight
    }

    const nodeConfig = merge(
      cleanLaneData,
      {
        type: 'lane',
        x: initialX,
        y: initialY,
        width: laneWidth,
        height: laneHeight,
        text: '新泳道',
        properties: {
          parent: this.id, // 确保父节点始终指向泳池
          isCollapsed: false,
          position: position, // 记录添加位置，供resizeChildren使用
          referenceLaneId: referenceLane?.id, // 记录参考泳道ID
        },
        zIndex: this.zIndex,
      },
      this.properties.laneConfig,
    )
    // 新增泳道不继承参考泳道或默认配置的折叠状态。
    nodeConfig.properties.isCollapsed = false
    const newLane = this.graphModel.addNode(nodeConfig)
    this.setZIndex(this.zIndex - 1)
    this.addChild(newLane.id)

    // 调用优化后的resizeChildren，它会处理所有位置计算和泳池尺寸调整
    this.resizeChildrenWithNewLane(position, newLane.id)
    return newLane
  }

  setZIndex(zIndex: number) {
    // this.zIndex = zIndex
    this.zIndex = Math.min(zIndex, -100)
  }

  /**
   * 在上方添加泳道
   */
  addChildAbove(laneData?: any) {
    return this.addLane('above', laneData)
  }

  /**
   * 在下方添加泳道
   */
  addChildBelow(laneData?: any) {
    return this.addLane('below', laneData)
  }

  /**
   * 在左侧添加泳道
   */
  addChildLeft(laneData?: any) {
    return this.addLane('left', laneData)
  }

  /**
   * 在右侧添加泳道（纵向布局专用）
   */
  addChildRight(laneData?: any) {
    return this.addLane('right', laneData)
  }

  /**
   * 创建默认泳道
   * Pool 初次渲染时没有 children 才会调用，用于保证 Pool 至少有一个可操作 Lane。
   */
  createDefaultLane(laneConfig?: any) {
    let newLane: any = null
    // 只在没有子节点时创建默认泳道
    if (this.isHorizontal) {
      // 横向泳池：泳道垂直排列
      const laneWidth = this.width - poolConfig.titleSize
      const laneHeight = this.height
      newLane = this.graphModel.addNode(
        merge(
          {
            type: 'lane',
            x: this.x - this.width / 2 + poolConfig.titleSize + laneWidth / 2,
            y: this.y,
            width: laneWidth,
            height: laneHeight,
            text: {
              x: this.x - this.width / 2 + poolConfig.titleSize / 2,
              y: this.y,
              value: '泳道1',
            },
            properties: {
              parent: this.id,
              isHorizontal: this.isHorizontal,
            },
            zIndex: this.zIndex,
          },
          laneConfig,
        ),
      )
    } else {
      // 纵向泳池：泳道水平排列
      // 修复：初始泳道在泳池中心位置，与resizeChildren逻辑保持一致
      const laneWidth = this.width
      const laneHeight = this.height - poolConfig.titleSize
      newLane = this.graphModel.addNode(
        merge(
          {
            type: 'lane',
            x: this.x,
            y:
              this.y -
              this.height / 2 +
              poolConfig.titleSize +
              (this.height - poolConfig.titleSize) / 2,
            width: laneWidth,
            height: laneHeight,
            text: {
              x: this.x,
              y: this.y - this.height / 2 + poolConfig.titleSize / 2,
              value: '泳道1',
            },
            properties: {
              parent: this.id,
            },
            zIndex: this.zIndex,
          },
          laneConfig,
        ),
      )
    }
    this.setZIndex(this.zIndex - 1)
    this.addChild(newLane.id)
    this.layoutLanesByOrder({ reason: 'init' })
    this.updateTextPosition()
    return newLane
  }

  /**
   * 删除泳道
   */
  getPoolPlugin(): any {
    return this.graphModel.dynamicGroup
  }

  /**
   * 获取当前 Pool 的最小 Lane 数。
   *
   * 单个 Pool properties 优先，否则使用插件级默认值。
   *
   * @returns 当前 Pool 允许保留的最小 Lane 数。
   */
  getMinLaneCount(): number {
    const plugin = this.getPoolPlugin()
    if (typeof plugin?.getPoolMinLaneCount === 'function') {
      return plugin.getPoolMinLaneCount(this)
    }
    return (this.properties as any)?.minLaneCount ?? 1
  }

  /**
   * 判断删除指定数量的 Lane 后，当前 Pool 是否仍满足最小 Lane 数限制。
   *
   * @param count 准备删除的 Lane 数量，默认为 1。
   * @returns 满足最小 Lane 数限制时返回 true。
   */
  canRemoveLane(count = 1): boolean {
    return this.getLanes().length - count >= this.getMinLaneCount()
  }

  /**
   * 删除指定 Lane，并在删除前交给插件处理折叠态真实边和子节点释放/级联策略。
   *
   * @param childId 待删除的 Lane id。
   * @returns 删除成功时返回 true。
   */
  deleteChild(childId: string): boolean {
    if (!this.canRemoveLane()) return false

    const laneToDelete = this.getLanes().find((lane) => lane.id === childId)
    if (!laneToDelete) return false

    this.getPoolPlugin()?.prepareLaneForDeletion?.(laneToDelete)
    // 移除子节点
    this.removeChild(childId)
    this.graphModel.deleteNode(childId)

    // 重新调整泳池
    this.layoutLanesByOrder({ reason: 'delete' })
    return true
  }

  /**
   * 切换 Pool 折叠状态。
   *
   * Pool 折叠时记录每条 Lane 的折叠状态，展开后按原状态恢复，而不是全部展开。
   *
   * @param collapse 显式目标状态；省略时切换当前状态。
   */
  toggleCollapse(collapse?: boolean) {
    const plugin = this.getPoolPlugin()
    if (
      typeof plugin?.isCollapseAllowed === 'function' &&
      !plugin.isCollapseAllowed(this)
    ) {
      this.isCollapsed = false
      this.setProperties({ ...this.properties, isCollapsed: false })
      return
    }
    const next = typeof collapse === 'boolean' ? collapse : !this.isCollapsed
    if (next === this.isCollapsed) return

    const lanes = this.getOrderedLanes()
    if (next) {
      this.laneCollapseSnapshot = new Map(
        lanes.map((lane: any) => [lane.id, !!lane.isCollapsed]),
      )
    }

    this.isSyncingPoolCollapse = true
    try {
      super.toggleCollapse(next)

      if (!next) {
        lanes.forEach((lane: any) => {
          const previousState = this.laneCollapseSnapshot.get(lane.id)
          if (
            typeof previousState === 'boolean' &&
            lane.isCollapsed !== previousState
          ) {
            lane.toggleCollapse(previousState)
          }
        })
      }
    } finally {
      this.isSyncingPoolCollapse = false
    }

    if (!next) {
      this.layoutLanesByOrder({ reason: 'collapse' })
      this.laneCollapseSnapshot.clear()
    }
  }

  getNodeStyle() {
    const style = super.getNodeStyle()
    style.strokeWidth = 2
    return style
  }

  /**
   * 获取文本样式
   */
  getTextStyle() {
    const style = super.getTextStyle()
    const isVerticalTitle =
      this.getTitleRenderPosition() === 'left' ||
      this.getTitleRenderPosition() === 'right'

    style.overflowMode = 'ellipsis'
    style.strokeWidth = 2
    style.textWidth = isVerticalTitle
      ? this.getTitleTextBox().height
      : this.getTitleTextBox().width
    style.textHeight = isVerticalTitle
      ? this.getTitleTextBox().width
      : this.getTitleTextBox().height
    if (isVerticalTitle) {
      style.transform = 'rotate(-90deg)'
    } else if ('transform' in style) {
      delete style.transform
    }
    style.textAlign = 'center'
    return style
  }

  getData(): LogicFlow.NodeData {
    const data = super.getData()
    // const poolModel = this.getPoolModel()
    return {
      ...data,
      properties: {
        ...data.properties,
        width: this.width,
        height: this.height,
      },
    }
  }
}

export default {
  PoolModel,
}
