import LogicFlow from '@logicflow/core'
import { LaneModel } from './LaneModel'
import type { LaneChildRelativePositions } from './LaneModel'
import { PoolModel } from './PoolModel'

/**
 * Lane block 是“多选 Lane 作为连续块移动”的公共计算层。
 *
 * 单 Lane 拖拽也会复用其中的预览顺序和 drop indicator 计算，所以这里不关心
 * 事件来源是 node:drag 还是 selection:drag，只根据 Pool、Lane 列表和插入下标
 * 产出稳定的顺序/位置结果。
 */

export type LaneSnapshot = {
  /** 拖拽开始时 Lane 的坐标，用于跨 Pool 多选时按用户看到的顺序排序。 */
  x: number
  y: number
  /** 拖拽开始时子节点相对 Lane 的位置，用于跨池迁移或失败归位后恢复。 */
  children: LaneChildRelativePositions
}

export type PoolLaneBlockContext = {
  /** 由 PoolElements 注入宿主能力，避免工具函数直接依赖插件实例。 */
  lf: LogicFlow
  resolvePoolById(poolId?: unknown): PoolModel | undefined
  getPoolContentBox(pool: PoolModel): {
    x: number
    y: number
    width: number
    height: number
  }
}

/**
 * 根据 selection 快照中的 id 解析当前仍存在的 Lane 模型。
 *
 * @param context Lane block 宿主上下文。
 * @param laneIds 需要解析的 Lane id 列表。
 * @returns 当前仍存在且类型为 lane 的模型列表。
 */
export function getLaneModelsByIds(
  context: PoolLaneBlockContext,
  laneIds: string[],
): LaneModel[] {
  return laneIds
    .map((laneId) => context.lf.getNodeModelById(laneId))
    .filter((node): node is LaneModel => String(node?.type) === 'lane')
}

/**
 * 根据 Pool id 列表解析当前仍存在的来源 Pool。
 *
 * @param context Lane block 宿主上下文。
 * @param poolIds 需要解析的 Pool id 列表。
 * @returns 当前仍存在的 Pool 模型列表。
 */
export function getSourcePoolsByIds(
  context: PoolLaneBlockContext,
  poolIds: string[],
): PoolModel[] {
  return poolIds
    .map((poolId) => context.resolvePoolById(poolId))
    .filter((pool): pool is PoolModel => !!pool)
}

/**
 * 按来源 Pool 对选中的 Lane 分组。
 *
 * 跨多个来源 Pool 时，每个来源都要独立校验 minLaneCount 和最终收敛布局。
 *
 * @param context Lane block 宿主上下文。
 * @param lanes 当前选中的 Lane。
 * @returns 按来源 Pool id 分组的 Lane 映射。
 */
export function groupLanesBySourcePool(
  context: PoolLaneBlockContext,
  lanes: LaneModel[],
) {
  const lanesBySourcePool = new Map<string, LaneModel[]>()
  lanes.forEach((lane) => {
    const poolId = context.resolvePoolById(lane.properties?.parent)?.id
    if (!poolId) return
    const items = lanesBySourcePool.get(poolId) ?? []
    items.push(lane)
    lanesBySourcePool.set(poolId, items)
  })
  return lanesBySourcePool
}

/**
 * 判断 Lane block 是否可以整体迁移到目标 Pool。
 *
 * @param sourcePools 选中 Lane 所属的来源 Pool。
 * @param lanesBySourcePool 每个来源 Pool 中被选中的 Lane。
 * @param targetPool 即将接收 Lane block 的目标 Pool。
 * @returns 是否所有来源 Pool 都满足迁移约束。
 */
export function canMoveLaneBlock(
  sourcePools: PoolModel[],
  lanesBySourcePool: Map<string, LaneModel[]>,
  targetPool: PoolModel,
) {
  return sourcePools.every((sourcePool) => {
    const selected = lanesBySourcePool.get(sourcePool.id) ?? []
    return (
      sourcePool.id === targetPool.id ||
      sourcePool.canRemoveLane(selected.length)
    )
  })
}

/**
 * 计算 Lane block 预览或最终落位后的目标顺序。
 *
 * 输入 insertIndex 基于“原始完整槽位”，这里转换成移除选中块后的真实插入顺序。
 *
 * @param pool 目标 Pool。
 * @param lanes 当前选中的 Lane block。
 * @param insertIndex 基于原始 Lane 顺序的插入下标。
 * @returns 预览或落位后的 Lane id 顺序。
 */
export function getLaneBlockPreviewOrder(
  pool: PoolModel,
  lanes: LaneModel[],
  insertIndex: number,
): string[] {
  const selectedIds = new Set(lanes.map((lane) => lane.id))
  const ids = pool.getOrderedLanes().map((lane: LaneModel) => lane.id)
  const blockIds = ids.filter((id) => selectedIds.has(id))
  if (blockIds.length === 0) {
    // 跨泳池预览时，目标池不含选中 lane，直接保留选中块的既有顺序。
    blockIds.push(...lanes.map((lane) => lane.id))
  }
  const remainingIds = ids.filter((id) => !selectedIds.has(id))
  const selectedBeforeInsert = ids
    .slice(0, insertIndex)
    .filter((id) => selectedIds.has(id)).length
  // insertIndex 基于完整槽位，先扣除块自身占用的前置槽位再插入剩余列表。
  const adjustedIndex = Math.max(0, insertIndex - selectedBeforeInsert)
  remainingIds.splice(
    Math.min(adjustedIndex, remainingIds.length),
    0,
    ...blockIds,
  )
  return remainingIds
}

/**
 * 预览 Lane block 在目标 Pool 中的占位效果。
 *
 * @param context Lane block 宿主上下文。
 * @param pool 目标 Pool。
 * @param lanes 当前选中的 Lane block。
 * @param insertIndex 目标插入下标。
 */
export function previewLaneBlockOrder(
  context: PoolLaneBlockContext,
  pool: PoolModel,
  lanes: LaneModel[],
  insertIndex: number,
) {
  const selectedIds = new Set(lanes.map((lane) => lane.id))
  const order = getLaneBlockPreviewOrder(pool, lanes, insertIndex)
  const previewLanes = order.map(
    (laneId) => context.lf.getNodeModelById(laneId) as LaneModel,
  )
  const contentBox = context.getPoolContentBox(pool)
  // 预览位置必须与正式布局使用同一个 contentBox，否则标题移动到右/下时会错位。
  let cursor = pool.isHorizontal
    ? contentBox.y - contentBox.height / 2
    : contentBox.x - contentBox.width / 2

  order.forEach((laneId, index) => {
    const lane = context.lf.getNodeModelById(laneId) as LaneModel
    if (!lane) return
    const size = pool.isHorizontal ? lane.height : lane.width
    cursor += pool.getCollapsedLaneGapBefore(index, previewLanes)
    if (!selectedIds.has(laneId)) {
      lane.isLaneReordering = true
      pool.moveLane(
        lane,
        pool.isHorizontal ? contentBox.x : cursor + lane.width / 2,
        pool.isHorizontal ? cursor + lane.height / 2 : contentBox.y,
      )
    }
    cursor += size
  })
}

/**
 * 设置 Lane block 的 drop indicator。
 *
 * indicator 标的是整个 Lane block 的占位范围，而不是单条分隔线。
 *
 * @param context Lane block 宿主上下文。
 * @param pool 目标 Pool。
 * @param lanes 当前选中的 Lane block。
 * @param insertIndex 目标插入下标。
 */
export function setLaneBlockDropIndicator(
  context: PoolLaneBlockContext,
  pool: PoolModel,
  lanes: LaneModel[],
  insertIndex: number,
) {
  if (lanes.length === 0) return

  const order = getLaneBlockPreviewOrder(pool, lanes, insertIndex)
  const firstLaneId = lanes[0].id
  const firstLaneIndex = order.indexOf(firstLaneId)
  const contentBox = context.getPoolContentBox(pool)
  const previewLanes = order.map(
    (laneId) => context.lf.getNodeModelById(laneId) as LaneModel,
  )
  const beforeSize = pool.getLaneAxisOffset(firstLaneIndex, previewLanes)
  // 选中的 Lane 在预览顺序中连续排列，因此该区间就是整个块的占位尺寸。
  const blockSize =
    pool.getLaneAxisOffset(firstLaneIndex + lanes.length, previewLanes) -
    beforeSize
  pool.laneDropIndicator = {
    laneId: firstLaneId,
    index: insertIndex,
    ...(pool.isHorizontal
      ? {
          x: contentBox.x - contentBox.width / 2,
          y: contentBox.y - contentBox.height / 2 + beforeSize,
          width: contentBox.width,
          height: blockSize,
        }
      : {
          x: contentBox.x - contentBox.width / 2 + beforeSize,
          y: contentBox.y - contentBox.height / 2,
          width: blockSize,
          height: contentBox.height,
        }),
  }
}

/**
 * 获取同一来源 Pool 内选中 Lane 的视觉顺序。
 *
 * @param lanes 当前选中的 Lane。
 * @param sourcePool 来源 Pool。
 * @returns 按 sourcePool laneOrder 排列后的 Lane block。
 */
export function getSelectionLaneBlock(
  lanes: LaneModel[],
  sourcePool: PoolModel,
): LaneModel[] {
  const laneIds = new Set(lanes.map((lane) => lane.id))
  return sourcePool
    .getOrderedLanes()
    .filter((lane: LaneModel) => laneIds.has(lane.id)) as LaneModel[]
}

/**
 * 在同一 Pool 内重排 Lane block。
 *
 * @param pool 来源 Pool。
 * @param lanes 当前选中的 Lane block。
 * @param insertIndex 目标插入下标。
 */
export function reorderLaneBlock(
  pool: PoolModel,
  lanes: LaneModel[],
  insertIndex: number,
) {
  const laneIds = new Set(lanes.map((lane) => lane.id))
  const orderedIds = pool.getOrderedLanes().map((lane: LaneModel) => lane.id)
  const blockIds = orderedIds.filter((id: string) => laneIds.has(id))
  const idsBeforeTarget = orderedIds.slice(0, insertIndex)
  const adjustedIndex = Math.max(
    0,
    insertIndex - idsBeforeTarget.filter((id) => laneIds.has(id)).length,
  )
  const remainingIds = orderedIds.filter((id: string) => !laneIds.has(id))
  remainingIds.splice(
    Math.min(adjustedIndex, remainingIds.length),
    0,
    ...blockIds,
  )

  pool.setLaneOrder(remainingIds, { reason: 'reorder' })
}

/**
 * 获取跨 Pool 合并时选中 Lane 的视觉顺序。
 *
 * 跨 Pool 没有共同 laneOrder，使用拖拽开始时的视觉坐标决定块内顺序。
 *
 * @param lanes 当前选中的 Lane。
 * @param targetPool 目标 Pool，用于确定水平/垂直主轴。
 * @param laneSnapshots 拖拽开始时记录的 Lane 坐标快照。
 * @returns 按目标 Pool 方向排序后的 Lane block。
 */
export function getSelectionLaneVisualOrder(
  lanes: LaneModel[],
  targetPool: PoolModel,
  laneSnapshots: Record<string, LaneSnapshot>,
) {
  return lanes.slice().sort((left, right) => {
    const leftSnapshot = laneSnapshots[left.id] ?? left
    const rightSnapshot = laneSnapshots[right.id] ?? right
    const primaryDelta = targetPool.isHorizontal
      ? leftSnapshot.y - rightSnapshot.y
      : leftSnapshot.x - rightSnapshot.x
    if (primaryDelta !== 0) return primaryDelta

    return targetPool.isHorizontal
      ? leftSnapshot.x - rightSnapshot.x
      : leftSnapshot.y - rightSnapshot.y
  })
}

/**
 * 恢复 Lane block 中子节点相对 Lane 的位置。
 *
 * @param lanes 需要恢复子节点位置的 Lane。
 * @param laneSnapshots 拖拽开始时记录的子节点相对位置快照。
 */
export function restoreLaneBlockChildPositions(
  lanes: LaneModel[],
  laneSnapshots: Record<string, LaneSnapshot>,
) {
  lanes.forEach((lane) => {
    const snapshot = laneSnapshots[lane.id]
    if (!snapshot) return
    lane.restoreChildrenRelativePositions(snapshot.children)
  })
}
