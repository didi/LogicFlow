import LogicFlow, { BaseEdgeModel, BaseNodeModel } from '@logicflow/core'
import { filter } from 'lodash-es'
import { LaneModel } from './LaneModel'
import { PoolModel } from './PoolModel'

/**
 * 单个 Lane 拖拽链路的纯逻辑集合。
 *
 * PoolElements 负责监听 LogicFlow 事件和提供上下文能力，本文件只处理：
 * 1. 拖拽开始时记录快照；
 * 2. 拖拽过程中的目标 Pool、插入槽位和视觉反馈；
 * 3. drop 时换序、跨 Pool 迁移或失败归位。
 */

export type LaneSlotBounds = {
  laneId: string
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export type LaneDragState = {
  /** 当前正在拖拽的 Lane。 */
  laneId: string
  /** 拖拽开始时 Lane 所属 Pool，用于失败归位和最小泳道数校验。 */
  sourcePoolId: string
  /** 拖拽预览阶段命中的目标 Pool；drop 时优先复用，避免鼠标抬起瞬间重新命中偏差。 */
  targetPoolId?: string
  /** 预览阶段计算出的插入位置；drop 时优先复用。 */
  insertIndex?: number
  /** 上一次指针所在主轴坐标，用于跨 Pool 拖入时判断插在目标槽位前还是后。 */
  previousAxis: number
  /** 拖拽期间会临时抬高 Lane、子节点和边，结束后按这里恢复。 */
  originalRaisedElementZIndices: Record<string, number>
  /** 无效 drop 归位时恢复边/节点文本位置，避免连线 title 被布局重算带偏。 */
  originalTextPositions: Record<string, { x: number; y: number }>
  /** 在预览布局改变泳道位置前记录槽位边界，命中判断不能依赖预览后的坐标。 */
  slotBoundsByPool: Record<string, LaneSlotBounds[]>
}

const LANE_RETURN_ANIMATION_DURATION = 160
const LANE_DRAG_CURSOR_CLASSES = [
  'lf-pool-lane-drag-not-allowed',
  'lf-pool-lane-drag-allowed',
]

export type PoolLaneDragContext = {
  /**
   * lane-drag 不直接持有 PoolElements 实例，只通过上下文调用宿主能力。
   * 这样单 Lane 拖拽可以被 index.ts 薄包装复用，也避免把事件监听代码搬进工具层。
   */
  lf: LogicFlow
  getLaneDragState(): LaneDragState | undefined
  setLaneDragState(state?: LaneDragState): void
  resolvePoolById(poolId?: unknown): PoolModel | undefined
  getPoolByPoint(
    point: { x: number; y: number },
    nodeData: LogicFlow.NodeData | LogicFlow.NodeConfig,
  ): PoolModel | undefined
  getPoolByBounds(
    bounds: any,
    nodeData: LogicFlow.NodeData | LogicFlow.NodeConfig,
  ): PoolModel | undefined
  moveLaneToPool(
    laneId: string,
    targetPoolId: string,
    insertIndex: number,
  ): boolean
  emitLaneMoveNotAllowed(lane: LaneModel, reason: string): void
  getLaneBlockPreviewOrder(
    pool: PoolModel,
    lanes: LaneModel[],
    insertIndex: number,
  ): string[]
  setLaneBlockDropIndicator(
    pool: PoolModel,
    lanes: LaneModel[],
    insertIndex: number,
  ): void
  previewLaneBlockOrder(
    pool: PoolModel,
    lanes: LaneModel[],
    insertIndex: number,
  ): void
}

/**
 * 捕获 Pool 当前所有 Lane 的槽位边界。
 *
 * @param pool 需要记录槽位几何信息的 Pool。
 * @returns 当前 Pool 内每个 Lane 的原始边界快照。
 */
export function captureLaneSlotBounds(pool: PoolModel): LaneSlotBounds[] {
  return pool.getOrderedLanes().map((lane: LaneModel) => {
    const { minX, minY, maxX, maxY } = lane.getBounds()
    return { laneId: lane.id, minX, minY, maxX, maxY }
  })
}

/**
 * 获取一次拖拽内稳定的 Pool 槽位边界。
 *
 * 每个 Pool 的槽位在一次拖拽内只采集一次，后续预览移动 Lane 不会污染命中区。
 *
 * @param context 单 Lane 拖拽所需的宿主能力和状态访问器。
 * @param pool 当前需要命中的 Pool。
 * @returns 本次拖拽使用的稳定槽位边界。
 */
export function getLaneSlotBounds(
  context: PoolLaneDragContext,
  pool: PoolModel,
): LaneSlotBounds[] {
  const state = context.getLaneDragState()
  if (!state) return captureLaneSlotBounds(pool)
  if (!state.slotBoundsByPool[pool.id]) {
    state.slotBoundsByPool[pool.id] = captureLaneSlotBounds(pool)
  }
  return state.slotBoundsByPool[pool.id]
}

/**
 * 获取单 Lane 拖拽时需要作为可视整体抬层的节点。
 *
 * @param context LogicFlow 宿主上下文。
 * @param lane 当前拖拽的 Lane。
 * @returns Lane 本身及其直接子节点。
 */
export function getLaneDragMembers(
  context: PoolLaneDragContext,
  lane: LaneModel,
): BaseNodeModel[] {
  return ([lane] as BaseNodeModel[]).concat(
    Array.from(lane.children)
      .map((childId) => context.lf.getNodeModelById(childId))
      .filter(Boolean) as BaseNodeModel[],
  )
}

/**
 * 获取与 Lane 直接子节点相连的边。
 *
 * @param context LogicFlow 宿主上下文。
 * @param lane 当前 Lane。
 * @returns 与 Lane 子节点相连的业务边。
 */
export function getLaneRelatedEdges(
  context: PoolLaneDragContext,
  lane: LaneModel,
): BaseEdgeModel[] {
  const childIds = new Set(lane.children)
  return filter(context.lf.graphModel.edges, (edge) => {
    return childIds.has(edge.sourceNodeId) || childIds.has(edge.targetNodeId)
  })
}

/**
 * 抬高 Lane、关联边和子节点层级，避免拖拽时被 Pool/Lane 背景遮挡。
 *
 * @param context LogicFlow 宿主上下文。
 * @param lane 需要抬层的 Lane。
 */
export function raiseLaneRelatedElements(
  context: PoolLaneDragContext,
  lane: LaneModel,
) {
  const topZIndex = Math.max(
    ...[...context.lf.graphModel.nodes, ...context.lf.graphModel.edges].map(
      (element) => element.zIndex,
    ),
  )

  // 泳道是子节点的背景。关联边置于背景之上，子节点再高一层，避免两者被背景遮挡。
  lane.setZIndex(topZIndex + 1)
  getLaneRelatedEdges(context, lane).forEach((edge) =>
    edge.setZIndex(topZIndex + 2),
  )
  getLaneDragMembers(context, lane)
    .slice(1)
    .forEach((member) => member.setZIndex(topZIndex + 3))
}

/**
 * 将新增或拖拽中的 Lane 子节点同步到正确层级。
 *
 * @param context LogicFlow 宿主上下文。
 * @param lane 子节点所属 Lane。
 * @param childId 需要同步层级的子节点 id。
 */
export function syncLaneChildZIndex(
  context: PoolLaneDragContext,
  lane: LaneModel,
  childId: string,
) {
  const child = context.lf.getNodeModelById(childId)
  if (!child) return

  const relatedEdges = getLaneRelatedEdges(context, lane)
  const edgeZIndex = Math.max(
    lane.zIndex + 1,
    ...relatedEdges.map((edge) => edge.zIndex),
  )
  relatedEdges.forEach((edge) => {
    if (edge.zIndex < edgeZIndex) {
      edge.setZIndex(edgeZIndex)
    }
  })
  const siblingChildLayer = getLaneDragMembers(context, lane)
    .slice(1)
    .filter((member) => member.id !== childId)
    .map((member) => member.zIndex)
  const targetZIndex = Math.max(
    edgeZIndex + 1,
    child.zIndex,
    ...siblingChildLayer,
  )

  if (child.zIndex < targetZIndex) {
    child.setZIndex(targetZIndex)
  }
}

/**
 * 创建或复用单 Lane 拖拽快照。
 *
 * 同一次拖拽的后续 mousemove 复用首帧快照，不能被预览布局反复刷新。
 *
 * @param context 单 Lane 拖拽上下文。
 * @param lane 当前拖拽的 Lane。
 * @param sourcePool Lane 开始拖拽时所属的 Pool。
 * @param previousAxis 指针在 Pool 主轴上的初始坐标。
 * @returns 当前拖拽状态快照。
 */
export function createLaneDragState(
  context: PoolLaneDragContext,
  lane: LaneModel,
  sourcePool: PoolModel,
  previousAxis: number,
) {
  const existingState = context.getLaneDragState()
  if (existingState) return existingState

  const members = getLaneDragMembers(context, lane)
  const relatedEdges = getLaneRelatedEdges(context, lane)
  const raisedElements: Array<BaseNodeModel | BaseEdgeModel> = [
    ...members,
    ...relatedEdges,
  ]
  const originalRaisedElementZIndices = raisedElements.reduce(
    (indices: Record<string, number>, element) => {
      indices[element.id] = element.zIndex
      return indices
    },
    {},
  )
  const originalTextPositions = raisedElements.reduce(
    (positions: Record<string, { x: number; y: number }>, element) => {
      positions[element.id] = { x: element.text.x, y: element.text.y }
      return positions
    },
    {},
  )

  const state: LaneDragState = {
    laneId: lane.id,
    sourcePoolId: sourcePool.id,
    previousAxis,
    originalRaisedElementZIndices,
    originalTextPositions,
    slotBoundsByPool: {
      [sourcePool.id]: captureLaneSlotBounds(sourcePool),
    },
  }
  context.setLaneDragState(state)
  raiseLaneRelatedElements(context, lane)
  return state
}

/**
 * 将拖拽开始前记录的文本坐标恢复到节点/边上。
 *
 * @param context LogicFlow 宿主上下文。
 * @param state 当前 Lane 拖拽快照。
 */
export function restoreLaneTextPositions(
  context: PoolLaneDragContext,
  state: LaneDragState,
) {
  Object.entries(state.originalTextPositions).forEach(([id, position]) => {
    const element =
      context.lf.getNodeModelById(id) ?? context.lf.getEdgeModelById(id)
    if (!element) return
    element.moveText(position.x - element.text.x, position.y - element.text.y)
  })
}

/**
 * 设置 Lane 拖拽时的全局 cursor 反馈样式。
 *
 * @param context LogicFlow 宿主上下文。
 * @param cursor 允许、禁止，或清除状态。
 */
export function setLaneDragCursor(
  context: PoolLaneDragContext,
  cursor?: 'not-allowed' | 'allowed',
) {
  context.lf.container.classList.remove(...LANE_DRAG_CURSOR_CLASSES)
  if (cursor) {
    context.lf.container.classList.add(`lf-pool-lane-drag-${cursor}`)
  }
}

/**
 * 清理 Pool 上的 Lane drop 目标态和 indicator。
 *
 * @param pool 需要清理的目标 Pool；为空时不执行操作。
 */
export function clearLaneDropTarget(pool?: PoolModel) {
  if (!pool) return
  pool.isLaneDropTarget = false
  pool.laneDropIndicator = undefined
  pool.setAllowAppendChild(false)
}

/**
 * 判断单 Lane 是否可以从 sourcePool 投放到 targetPool。
 *
 * @param sourcePool Lane 当前所属的 Pool。
 * @param targetPool 指针命中的目标 Pool。
 * @returns 是否允许当前迁移或同池换序。
 */
export function canDropLaneIntoPool(
  sourcePool: PoolModel,
  targetPool: PoolModel,
) {
  return targetPool.id === sourcePool.id || sourcePool.canRemoveLane(1)
}

/**
 * 根据指针所在槽位计算单 Lane 的目标插入下标。
 *
 * @param context 单 Lane 拖拽上下文。
 * @param pool 指针命中的目标 Pool。
 * @param lane 当前拖拽的 Lane。
 * @param point 当前指针的画布坐标。
 * @param previousAxis 上一次指针在 Pool 主轴上的坐标。
 * @param slotBounds 本次拖拽开始时记录的槽位边界。
 * @returns 目标 Pool 中的插入下标。
 */
export function getLanePointerInsertIndex(
  context: PoolLaneDragContext,
  pool: PoolModel,
  lane: LaneModel,
  point: { x: number; y: number },
  previousAxis: number,
  slotBounds: LaneSlotBounds[],
): number {
  const lanes = pool.getOrderedLanes() as LaneModel[]
  const axis = pool.isHorizontal ? point.y : point.x
  const target = slotBounds.find((slot) => {
    if (slot.laneId === lane.id) return false
    return (
      point.x >= slot.minX &&
      point.x <= slot.maxX &&
      point.y >= slot.minY &&
      point.y <= slot.maxY
    )
  })

  if (target) {
    const targetIndex = lanes.findIndex(
      (candidate) => candidate.id === target.laneId,
    )

    const sourcePoolId = context.getLaneDragState()?.sourcePoolId
    if (sourcePoolId === pool.id) {
      // 同一泳池内以前的槽位顺序决定前后关系，指针在目标槽位内轻微移动不能反转预览顺序。
      const sourceIndex = slotBounds.findIndex(
        (slot) => slot.laneId === lane.id,
      )
      const targetSlotIndex = slotBounds.findIndex(
        (slot) => slot.laneId === target.laneId,
      )
      return sourceIndex < targetSlotIndex ? targetIndex + 1 : targetIndex
    }

    return axis >= previousAxis ? targetIndex + 1 : targetIndex
  }

  const bounds = pool.getBounds()
  const minAxis = pool.isHorizontal ? bounds.minY : bounds.minX
  const maxAxis = pool.isHorizontal ? bounds.maxY : bounds.maxX
  if (axis <= minAxis) return 0
  if (axis >= maxAxis) return lanes.length
  return lanes.findIndex((candidate) => candidate.id === lane.id)
}

/**
 * 获取单 Lane 预览时的 Lane 顺序。
 *
 * @param context 单 Lane 拖拽上下文。
 * @param pool 目标 Pool。
 * @param laneId 当前拖拽的 Lane id。
 * @param insertIndex 目标插入下标。
 * @returns 预览状态下的 Lane id 顺序。
 */
export function getLanePreviewOrder(
  context: PoolLaneDragContext,
  pool: PoolModel,
  laneId: string,
  insertIndex: number,
): string[] {
  const lane = context.lf.getNodeModelById(laneId) as LaneModel
  return lane ? context.getLaneBlockPreviewOrder(pool, [lane], insertIndex) : []
}

/**
 * 设置单 Lane drop indicator。
 *
 * @param context 单 Lane 拖拽上下文。
 * @param pool 目标 Pool。
 * @param laneId 当前拖拽的 Lane id。
 * @param insertIndex 目标插入下标。
 */
export function setLaneDropIndicator(
  context: PoolLaneDragContext,
  pool: PoolModel,
  laneId: string,
  insertIndex: number,
) {
  const lane = context.lf.getNodeModelById(laneId) as LaneModel
  if (!lane) return
  context.setLaneBlockDropIndicator(pool, [lane], insertIndex)
}

/**
 * 预览单 Lane 在目标 Pool 中的排序效果。
 *
 * @param context 单 Lane 拖拽上下文。
 * @param pool 目标 Pool。
 * @param laneId 当前拖拽的 Lane id。
 * @param insertIndex 目标插入下标。
 */
export function previewLaneOrder(
  context: PoolLaneDragContext,
  pool: PoolModel,
  laneId: string,
  insertIndex: number,
) {
  const lane = context.lf.getNodeModelById(laneId) as LaneModel
  if (!lane) return
  // 预览与最终布局必须从同一个内容区起算，不能继续假设标题永远在左/上。
  context.previewLaneBlockOrder(pool, [lane], insertIndex)
}

/**
 * 根据 node:drag 的指针位置更新单 Lane 拖拽预览。
 *
 * 该阶段只更新预览状态，不真正修改 Lane 归属。
 *
 * @param context 单 Lane 拖拽上下文。
 * @param laneId 当前拖拽的 Lane id。
 * @param point 当前指针的画布坐标。
 */
export function updateLaneDragPreview(
  context: PoolLaneDragContext,
  laneId: string,
  point: { x: number; y: number },
) {
  const lane = context.lf.getNodeModelById(laneId) as LaneModel
  if (!lane || String(lane.type) !== 'lane') return

  const sourcePool = context.resolvePoolById(lane.properties?.parent)
  if (!sourcePool) return

  const axis = sourcePool.isHorizontal ? point.y : point.x
  const current = createLaneDragState(context, lane, sourcePool, axis)
  const targetPool = context.getPoolByPoint(point, lane.getData())
  if (current?.targetPoolId && current.targetPoolId !== targetPool?.id) {
    const previousPool = context.resolvePoolById(current.targetPoolId)
    clearLaneDropTarget(previousPool)
  }

  if (!targetPool || !canDropLaneIntoPool(sourcePool, targetPool)) {
    // 离开合法目标后不能继续使用上一次的目标，否则 drop 会误判为有效放置。
    current.targetPoolId = undefined
    current.insertIndex = undefined
    setLaneDragCursor(context, 'not-allowed')
    return
  }

  setLaneDragCursor(
    context,
    targetPool.id === sourcePool.id ? undefined : 'allowed',
  )
  targetPool.isLaneDropTarget = targetPool.id !== sourcePool.id
  targetPool.setAllowAppendChild(targetPool.isLaneDropTarget)

  const previousAxis =
    context.getLaneDragState()!.previousAxis ??
    (sourcePool.isHorizontal ? lane.y : lane.x)
  const insertIndex = getLanePointerInsertIndex(
    context,
    targetPool,
    lane,
    point,
    previousAxis,
    getLaneSlotBounds(context, targetPool),
  )

  const state = context.getLaneDragState()!
  state.targetPoolId = targetPool.id
  state.insertIndex = insertIndex
  state.previousAxis = axis
  setLaneDropIndicator(context, targetPool, laneId, insertIndex)
  if (targetPool.id === sourcePool.id) {
    previewLaneOrder(context, targetPool, laneId, insertIndex)
  }
}

/**
 * 清理单 Lane 拖拽预览，并恢复拖拽前的层级。
 *
 * @param context 单 Lane 拖拽上下文。
 */
export function clearLaneDragPreview(context: PoolLaneDragContext) {
  const state = context.getLaneDragState()
  if (!state) return

  Object.entries(state.originalRaisedElementZIndices).forEach(
    ([id, zIndex]) => {
      const element =
        context.lf.getNodeModelById(id) ?? context.lf.getEdgeModelById(id)
      element?.setZIndex(zIndex)
    },
  )

  const pools = [state.sourcePoolId, state.targetPoolId]
  pools.forEach((poolId) => {
    if (!poolId) return
    const pool = context.resolvePoolById(poolId)
    if (!pool) return
    clearLaneDropTarget(pool)
    pool.getOrderedLanes().forEach((item: LaneModel) => {
      item.isLaneReordering = false
    })
  })
  context.setLaneDragState(undefined)
}

/**
 * 将无效投放的 Lane 归位到来源 Pool。
 *
 * @param context 单 Lane 拖拽上下文。
 * @param lane 需要归位的 Lane。
 * @param sourcePool Lane 原本所属的 Pool。
 * @param state 当前拖拽快照，用于恢复 title 和其他临时状态。
 */
export function returnLaneToSourcePool(
  context: PoolLaneDragContext,
  lane: LaneModel,
  sourcePool: PoolModel,
  state?: LaneDragState,
) {
  // 先渲染归位样式，再在下一帧回到固定槽位，避免无效放置时出现同步跳变。
  lane.isLaneReturning = true
  const layout = () => {
    sourcePool.layoutLanesByOrder({ reason: 'reorder' })
    if (state) restoreLaneTextPositions(context, state)
    setTimeout(() => {
      lane.isLaneReturning = false
    }, LANE_RETURN_ANIMATION_DURATION)
  }

  if (
    typeof window !== 'undefined' &&
    typeof window.requestAnimationFrame === 'function'
  ) {
    window.requestAnimationFrame(layout)
    return
  }
  setTimeout(layout, 0)
}

/**
 * node:drop 的单 Lane 落位出口。
 *
 * 根据拖拽预览快照决定同池换序、跨 Pool 迁移或失败归位。
 *
 * @param context 单 Lane 拖拽上下文。
 * @param node drop 事件携带的节点数据。
 * @returns 是否完成了有效落位。
 */
export function finalizeLaneDrop(
  context: PoolLaneDragContext,
  node?: LogicFlow.NodeData,
): boolean {
  if (!node || String(node.type) !== 'lane') return false

  const lane = context.lf.getNodeModelById(node.id) as LaneModel
  if (!lane || String(lane.type) !== 'lane') return false

  const sourcePool = context.resolvePoolById(lane.properties?.parent)
  if (!sourcePool) return false

  const state = context.getLaneDragState()
  const targetPool =
    context.resolvePoolById(state?.targetPoolId) ??
    context.getPoolByBounds(lane.getBounds(), lane.getData()) ??
    context.getPoolByPoint({ x: lane.x, y: lane.y }, lane.getData())
  if (!targetPool) {
    returnLaneToSourcePool(context, lane, sourcePool, state)
    context.emitLaneMoveNotAllowed(lane, 'invalid-target-pool')
    return false
  }

  const insertIndex =
    state?.laneId === lane.id && typeof state.insertIndex === 'number'
      ? state.insertIndex
      : targetPool.getLaneInsertIndex({ x: lane.x, y: lane.y })
  if (targetPool.id === sourcePool.id) {
    const reordered = sourcePool.reorderLane(lane.id, insertIndex)
    if (!reordered) sourcePool.layoutLanesByOrder({ reason: 'reorder' })
    return true
  }

  const moved = context.moveLaneToPool(lane.id, targetPool.id, insertIndex)
  if (!moved) sourcePool.layoutLanesByOrder({ reason: 'reorder' })
  return moved
}
