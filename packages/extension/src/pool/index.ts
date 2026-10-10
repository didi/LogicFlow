import LogicFlow, {
  CallbackArgs,
  Model,
  BaseNodeModel,
  BaseEdgeModel,
  EventType,
  h,
} from '@logicflow/core'
import { render } from 'preact'
import { assign, filter, forEach } from 'lodash-es'
import {
  ExtensionEventType,
  NODE_ADD_DROP_DND_EVENTS,
  NODE_DRAG_EVENTS,
} from '../constant/events'
import { PoolModel } from './PoolModel'
export type { LayoutLanesOptions, LayoutLanesReason } from './PoolModel'
import { PoolView } from './PoolView'
import { LaneModel } from './LaneModel'
import { LaneView } from './LaneView'
import PoolLaneDragOverlay from './PoolLaneDragOverlay'
import { POOL_STYLE_ID, poolStyleContent } from './style'
import { getTitleLayout, isAllowMoveTo, isBoundsInLane } from './utils'
import {
  getChildrenBounds,
  isGroupBoundsContainsChildren,
} from '../dynamic-group/utils'
import { poolBehaviorConfig } from './constant'
import { createPoolAddElements } from './paste'
import {
  canMoveLaneBlock,
  getLaneBlockPreviewOrder,
  getLaneModelsByIds,
  getSelectionLaneBlock,
  getSelectionLaneVisualOrder,
  getSourcePoolsByIds,
  groupLanesBySourcePool,
  previewLaneBlockOrder,
  reorderLaneBlock,
  restoreLaneBlockChildPositions,
  setLaneBlockDropIndicator,
  type LaneSnapshot,
  type PoolLaneBlockContext,
} from './lane-block'
import {
  captureLaneSlotBounds,
  clearLaneDragPreview,
  clearLaneDropTarget,
  canDropLaneIntoPool,
  createLaneDragState,
  getLaneDragMembers,
  getLanePointerInsertIndex,
  getLanePreviewOrder,
  getLaneRelatedEdges,
  getLaneSlotBounds,
  previewLaneOrder,
  raiseLaneRelatedElements,
  restoreLaneTextPositions,
  returnLaneToSourcePool,
  setLaneDragCursor,
  setLaneDropIndicator,
  syncLaneChildZIndex,
  updateLaneDragPreview,
  finalizeLaneDrop,
  type LaneDragState,
  type LaneSlotBounds,
  type PoolLaneDragContext,
} from './lane-drag'

import NodeData = LogicFlow.NodeData
import BoxBoundsPoint = Model.BoxBoundsPoint

type SelectionLaneDragState = {
  /** 被框选的 lane；拖拽期间只以这份快照作为块成员。 */
  laneIds: string[]
  /** 拖拽开始时的来源 pool，用于统一做 minLaneCount 校验和归位。 */
  sourcePoolIds: string[]
  /** 当前预览命中的目标及插入槽位；drop 时复用，避免鼠标抬起瞬间重新计算。 */
  targetPoolId?: string
  insertIndex?: number
  /** 来源 pool 的初始槽位，不受框选拖拽移动后的模型坐标影响。 */
  sourceSlotsByPool: Record<
    string,
    {
      laneIds: string[]
      slots: LaneSlotBounds[]
    }
  >
  laneSnapshots: Record<string, LaneSnapshot>
  /** Pool 与独立 Lane 混选时，Lane 不能脱离原有 Pool 参与泳道迁移。 */
  mixedPoolSelection: boolean
}

let poolStyleRefCount = 0

function ensurePoolStyle() {
  if (typeof document === 'undefined') return
  if (!document.getElementById(POOL_STYLE_ID)) {
    const style = document.createElement('style')
    style.id = POOL_STYLE_ID
    style.textContent = poolStyleContent
    document.head.appendChild(style)
  }
  poolStyleRefCount++
}

function releasePoolStyle() {
  if (typeof document === 'undefined') return
  poolStyleRefCount = Math.max(0, poolStyleRefCount - 1)
  if (poolStyleRefCount > 0) return
  document.getElementById(POOL_STYLE_ID)?.remove()
}

export const PoolNode = {
  type: 'pool',
  view: PoolView,
  model: PoolModel,
}

export const LaneNode = {
  type: 'lane',
  view: LaneView,
  model: LaneModel,
}

export class PoolElements {
  static pluginName = 'PoolElements'
  private lf: LogicFlow
  cascadeDeleteChildren: boolean = poolBehaviorConfig.cascadeDeleteChildren
  minLaneCount: number = poolBehaviorConfig.minLaneCount
  collapse: { pool: boolean; lane: boolean } = poolBehaviorConfig.collapse
  // 激活态的泳道节点（支持多泳道同时高亮）
  private activeGroups: Set<LaneModel> = new Set()
  // 存储节点与 group 的映射关系
  nodeLaneMap: Map<string, string> = new Map()
  /** 折叠态虚拟边 id 到泳道及真实边的映射。 */
  collapsedVirtualEdges: Map<string, { groupId: string; realEdgeId: string }> =
    new Map()
  /** 折叠隐藏的真实边 id 到所属泳道的映射。 */
  collapsedRealEdgeToGroup: Map<string, string> = new Map()
  laneDragState?: LaneDragState
  selectionLaneDragState?: SelectionLaneDragState
  private originDeleteNode?: LogicFlow['deleteNode']
  private dragOverlayContainer?: HTMLElement

  constructor({ lf, options }: LogicFlow.IExtensionProps) {
    lf.register(PoolNode)
    lf.register(LaneNode)
    this.lf = lf
    assign(this, options)
    ensurePoolStyle()
    // 初始化插件，从监听事件开始及设置规则开始
    this.init()
  }

  /**
   * 获取节点所属的泳道
   * @param nodeId
   */
  getLaneByNodeId(nodeId: string) {
    const laneId = this.nodeLaneMap.get(nodeId)
    if (laneId) {
      return this.lf.getNodeModelById(laneId)
    }
  }

  resolvePoolById(poolId?: unknown): PoolModel | undefined {
    if (typeof poolId !== 'string') return undefined
    const pool = this.lf.getNodeModelById(poolId) as PoolModel | undefined
    return String(pool?.type) === 'pool' ? pool : undefined
  }

  getParentContainerByNodeId(nodeId: string) {
    return this.getLaneByNodeId(nodeId)
  }

  getAncestorContainersByNodeId(nodeId: string) {
    const ancestors: (PoolModel | LaneModel)[] = []
    const visited = new Set<string>()
    let parent = this.getParentContainerByNodeId(nodeId) as
      | PoolModel
      | LaneModel
      | undefined

    while (parent && !visited.has(parent.id)) {
      ancestors.push(parent)
      visited.add(parent.id)
      parent = this.getParentContainerByNodeId(parent.id) as
        | PoolModel
        | LaneModel
        | undefined
    }

    return ancestors
  }

  getDescendantNodeIds(containerId: string, visited = new Set<string>()) {
    const container = this.lf.getNodeModelById(containerId) as
      | PoolModel
      | LaneModel
      | undefined
    if (!container?.children || visited.has(containerId)) return []

    visited.add(containerId)
    const descendantIds: string[] = []
    forEach(Array.from(container.children), (childId: string) => {
      descendantIds.push(childId)
      descendantIds.push(...this.getDescendantNodeIds(childId, visited))
    })
    return descendantIds
  }

  getRootContainerNodes(nodes: BaseNodeModel[]) {
    return nodes.filter((node) => {
      const ancestorContainers = this.getAncestorContainersByNodeId(node.id)
      return !ancestorContainers.some((ancestor) => nodes.includes(ancestor))
    })
  }

  normalizeSelectedContainerTree(nodeId: string) {
    const nodeModel = this.lf.getNodeModelById(nodeId)
    const selectedAncestor = this.getAncestorContainersByNodeId(nodeId).find(
      (ancestor) => ancestor.isSelected,
    )
    if (selectedAncestor) {
      nodeModel?.setSelected(false)
      return
    }

    if (nodeModel?.isGroup) {
      forEach(this.getDescendantNodeIds(nodeModel.id), (childId) => {
        const childModel = this.lf.getNodeModelById(childId)
        childModel?.setSelected(false)
      })
    }
  }

  /**
   * DynamicGroupNodeModel 的折叠逻辑通过此接口查询节点所属容器。
   * PoolElements 使用泳道作为容器，接口名保持兼容以复用边折叠流程。
   */
  getGroupByNodeId(nodeId: string) {
    return this.getLaneByNodeId(nodeId)
  }

  registerCollapsedVirtualEdge(
    virtualId: string,
    groupId: string,
    realEdgeId: string,
  ) {
    this.collapsedVirtualEdges.set(virtualId, { groupId, realEdgeId })
    this.collapsedRealEdgeToGroup.set(realEdgeId, groupId)
  }

  unregisterCollapsedVirtualEdge(virtualId: string) {
    const info = this.collapsedVirtualEdges.get(virtualId)
    if (!info) return

    this.collapsedVirtualEdges.delete(virtualId)
    if (this.collapsedRealEdgeToGroup.get(info.realEdgeId) === info.groupId) {
      this.collapsedRealEdgeToGroup.delete(info.realEdgeId)
    }
  }

  /** 折叠态删除虚拟边时，同步删除对应真实边，避免展开后边重新出现。 */
  onEdgeDelete = ({ data: edge }: CallbackArgs<'edge:delete'>) => {
    const virtualMapping = this.collapsedVirtualEdges.get(edge.id)
    if (virtualMapping) {
      this.collapsedVirtualEdges.delete(edge.id)
      this.collapsedRealEdgeToGroup.delete(virtualMapping.realEdgeId)
      if (this.lf.getEdgeModelById(virtualMapping.realEdgeId)) {
        this.lf.deleteEdge(virtualMapping.realEdgeId)
      }
      return
    }

    this.collapsedRealEdgeToGroup.delete(edge.id)
    const virtualIdsToDelete: string[] = []
    this.collapsedVirtualEdges.forEach((info, virtualId) => {
      if (info.realEdgeId === edge.id) virtualIdsToDelete.push(virtualId)
    })
    virtualIdsToDelete.forEach((virtualId) => {
      this.collapsedVirtualEdges.delete(virtualId)
      if (this.lf.getEdgeModelById(virtualId)) {
        this.lf.deleteEdge(virtualId)
      }
    })
  }

  getPoolMinLaneCount(pool: PoolModel) {
    const value = pool.properties?.minLaneCount
    return typeof value === 'number' ? value : this.minLaneCount
  }

  isCollapseAllowed(model: any): boolean {
    if (model.properties?.collapsible === false) return false
    if (String(model.type) === 'pool') return this.collapse?.pool !== false
    if (String(model.type) === 'lane') return this.collapse?.lane !== false
    return true
  }

  getPoolByBounds(
    bounds: BoxBoundsPoint,
    nodeData: NodeData | LogicFlow.NodeConfig,
  ): PoolModel | undefined {
    const { nodes } = this.lf.graphModel
    const pools = filter(nodes, (node) => {
      return (
        String(node.type) === 'pool' &&
        isBoundsInLane(bounds, node) &&
        node.id !== nodeData.id
      )
    })

    const count = pools.length
    if (count <= 1) {
      return pools[0] as PoolModel
    } else {
      let topZIndexPool = pools[count - 1]
      for (let i = count - 2; i >= 0; i--) {
        if (pools[i].zIndex > topZIndexPool.zIndex) {
          topZIndexPool = pools[i]
        }
      }
      return topZIndexPool as PoolModel
    }
  }

  getPoolByPoint(
    point: { x: number; y: number },
    nodeData: NodeData | LogicFlow.NodeConfig,
  ): PoolModel | undefined {
    const pools = filter(this.lf.graphModel.nodes, (node) => {
      if (String(node.type) !== 'pool' || node.id === nodeData.id) return false
      const bounds = node.getBounds()
      return (
        point.x >= bounds.minX &&
        point.x <= bounds.maxX &&
        point.y >= bounds.minY &&
        point.y <= bounds.maxY
      )
    })

    if (pools.length <= 1) return pools[0] as PoolModel
    return pools.reduce((top: any, node: any) =>
      node.zIndex > top.zIndex ? node : top,
    ) as PoolModel
  }

  getLaneDragContext(): PoolLaneDragContext {
    return {
      lf: this.lf,
      getLaneDragState: () => this.laneDragState,
      setLaneDragState: (state) => {
        this.laneDragState = state
      },
      resolvePoolById: this.resolvePoolById.bind(this),
      getPoolByPoint: this.getPoolByPoint.bind(this),
      getPoolByBounds: this.getPoolByBounds.bind(this),
      moveLaneToPool: this.moveLaneToPool.bind(this),
      emitLaneMoveNotAllowed: this.emitLaneMoveNotAllowed.bind(this),
      getLaneBlockPreviewOrder: this.getLaneBlockPreviewOrder.bind(this),
      setLaneBlockDropIndicator: this.setLaneBlockDropIndicator.bind(this),
      previewLaneBlockOrder: this.previewLaneBlockOrder.bind(this),
    }
  }

  getLaneBlockContext(): PoolLaneBlockContext {
    return {
      lf: this.lf,
      resolvePoolById: this.resolvePoolById.bind(this),
      getPoolContentBox: this.getPoolContentBox.bind(this),
    }
  }

  emitLaneMoveNotAllowed(lane: LaneModel, reason: string) {
    this.lf.emit('lane:not-allowed', {
      lane: lane.getData(),
      node: lane.getData(),
      reason,
    })
  }

  moveLaneToPool = (
    laneId: string,
    targetPoolId: string,
    insertIndex: number,
  ) => {
    const lane = this.lf.getNodeModelById(laneId) as LaneModel
    if (!lane || String(lane.type) !== 'lane') return false

    const sourcePool = this.resolvePoolById(lane.properties?.parent)
    const targetPool = this.lf.getNodeModelById(targetPoolId) as PoolModel

    if (!sourcePool || typeof sourcePool.moveLaneToPool !== 'function') {
      this.emitLaneMoveNotAllowed(lane, 'missing-source-pool')
      return false
    }

    if (!targetPool || String(targetPool.type) !== 'pool') {
      this.emitLaneMoveNotAllowed(lane, 'invalid-target-pool')
      return false
    }

    if (targetPool.id !== sourcePool.id && !sourcePool.canRemoveLane(1)) {
      this.emitLaneMoveNotAllowed(lane, 'source-min-lane-count')
      return false
    }

    const moved = sourcePool.moveLaneToPool(laneId, targetPoolId, insertIndex)
    if (moved) {
      this.nodeLaneMap.set(laneId, targetPoolId)
      forEach(Array.from(lane.children), (childId) => {
        this.nodeLaneMap.set(childId, laneId)
      })
      this.removeEmptySourcePool(sourcePool, targetPool)
    }
    return moved
  }

  removeEmptySourcePool(sourcePool: PoolModel, targetPool: PoolModel) {
    // 仅显式允许保留 0 条泳道的 Pool 可在迁移后自动清理，避免改变既有最小泳道数语义。
    if (
      sourcePool.id !== targetPool.id &&
      sourcePool.getMinLaneCount() === 0 &&
      sourcePool.getLanes().length === 0
    ) {
      this.lf.deleteNode(sourcePool.id)
    }
  }

  /**
   * 获取指定范围内的泳道
   * 当泳道重合时，优先返回最上层的泳道
   * @param bounds
   * @param nodeData
   */
  getLaneByBounds(bounds: BoxBoundsPoint, nodeData: NodeData): any | undefined {
    const { nodes } = this.lf.graphModel
    const lanes = filter(nodes, (node) => {
      return (
        String(node.type) === 'lane' &&
        isBoundsInLane(bounds, node) &&
        node.id !== nodeData.id
      )
    })

    const count = lanes.length
    if (count <= 1) {
      return lanes[0] as LaneModel
    } else {
      let topZIndexLane = lanes[count - 1]
      for (let i = count - 2; i >= 0; i--) {
        if (lanes[i].zIndex > topZIndexLane.zIndex) {
          topZIndexLane = lanes[i]
        }
      }
      return topZIndexLane as LaneModel
    }
  }

  /**
   * 提高元素的层级，如果是 group，同时提高其子元素的层级
   * @param model
   */
  onSelectionDrop = ({ e }: Partial<CallbackArgs<'selection:drop'>> = {}) => {
    this.finalizeSelectionLaneMove(e)
    this.clearSelectionLaneDragPreview()
    this.selectionLaneDragState = undefined
    const { nodes: selectedNodes } = this.lf.graphModel.getSelectElements()
    selectedNodes.forEach((node) => {
      if (String(node.type) === 'lane') return
      this.addNodeToGroup(node)
    })
  }
  onNodeAddOrDrop = ({ data: node }: CallbackArgs<'node:add'>) => {
    // 泳道归属由泳道放置流程统一处理，在确定目标泳池和最终顺序前必须保留在原泳池中。
    if (String(node.type) === 'lane') return
    this.addNodeToGroup(node)
  }

  addNodeToGroup = (node: LogicFlow.NodeData) => {
    const preLaneId = this.nodeLaneMap.get(node.id)
    const nodeModel = this.lf.getNodeModelById(node.id)
    const bounds = nodeModel?.getBounds()

    if (nodeModel && bounds) {
      // TODO: 确认下面的注释内容
      // https://github.com/didi/LogicFlow/issues/1261
      // 当使用 SelectionSelect 框选后触发 lf.addNode(Group)
      // 会触发 appendNodeToGroup() 的执行
      // 由于 this.getGroup() 会判断 node.id !== nodeData.id
      // 因此当 addNode 是 Group 类型时，this.getGroup() 会一直返回空
      // 导致了下面这段代码无法执行，也就是无法将当前添加的 Group 添加到 this.nodeLaneMap 中
      // 这导致了折叠分组时触发的 foldEdge() 无法正确通过 getNodeGroup() 拿到正确的 groupId
      // 从而导致折叠分组时一直都会创建一个虚拟边
      // 而初始化分组时由于正确设置了nodeLaneMap的数据，因此不会产生虚拟边的错误情况
      if (nodeModel.isGroup) {
        const lane = nodeModel as LaneModel
        forEach(Array.from(lane.children), (childId) => {
          this.nodeLaneMap.set(childId, node.id)
        })
      }

      const lane = this.getLaneByBounds(bounds, node)
      if (lane) {
        const isAllowAppendIn = lane.isAllowAppendIn(node)
        if (!isAllowAppendIn) {
          // 抛出不允许插入的事件
          this.lf.emit('lane:not-allowed', {
            lane: lane.getData(),
            node,
          })
          return
        }

        if (preLaneId && preLaneId !== lane.id) {
          const preLane = this.lf.getNodeModelById(preLaneId) as LaneModel
          preLane?.removeChild(node.id)
          this.nodeLaneMap.delete(node.id)
          preLane?.setAllowAppendChild(false)
        }

        lane.addChild(node.id)
        // 建立节点与 lane 的映射关系放在了 lane.addChild 触发的事件中，与直接调用 addChild 的行为保持一致
        lane.setAllowAppendChild(false)
        nodeModel.setProperties({
          ...nodeModel.properties,
          parent: lane.id,
          // relativeDistanceX: nodeModel.x - lane.x,
          // relativeDistanceY: nodeModel.y - lane.y,
        })
      } else if (preLaneId) {
        const preLane = this.lf.getNodeModelById(preLaneId) as LaneModel

        preLane?.removeChild(node.id)
        this.nodeLaneMap.delete(node.id)
        preLane?.setAllowAppendChild(false)
      }
    }
  }

  onGroupAddNode = ({
    data: groupData,
    childId,
  }: CallbackArgs<ExtensionEventType.GROUP_ADD_NODE>) => {
    this.nodeLaneMap.set(childId, groupData.id)
    const lane = this.lf.getNodeModelById(groupData.id) as LaneModel | undefined
    if (lane && String(lane.type) === 'lane') {
      this.syncLaneChildZIndex(lane, childId)
    }
  }

  removeNodeFromGroup = ({
    data: node,
    model,
  }: CallbackArgs<'node:delete'>) => {
    if (model.isPool && node.children) {
      forEach(Array.from((model as PoolModel).children), (childId) => {
        this.lf.deleteNode(childId)
      })
    } else if (model.isGroup && node.children) {
      const groupModel = model as LaneModel
      if (this.cascadeDeleteChildren) {
        forEach(Array.from(groupModel.children), (childId) => {
          this.nodeLaneMap.delete(childId)
          this.lf.deleteNode(childId)
        })
      } else {
        this.releaseLaneMembers(groupModel)
      }
    }

    const laneId = this.nodeLaneMap.get(node.id)
    if (laneId) {
      const lane = this.lf.getNodeModelById(laneId)
      lane && (lane as LaneModel).removeChild(node.id)
      this.nodeLaneMap.delete(node.id)

      if (String(model.type) === 'lane' && String(lane?.type) === 'pool') {
        // 快捷键和 API 会直接删除泳道，需在统一删除事件中让父泳池按剩余泳道收敛。
        ;(lane as PoolModel).layoutLanesByOrder({ reason: 'delete' })
      }

      const nodeModel = this.lf.getNodeModelById(node.id)
      // 移除时删除properties中的parent和relativeDistanceX、relativeDistanceY
      const newProperties = {
        ...nodeModel?.properties,
        parent: undefined,
        relativeDistanceX: undefined,
        relativeDistanceY: undefined,
      }
      nodeModel?.setProperties(newProperties)
    }
  }

  releaseLaneMembers = (laneModel: LaneModel) => {
    if (laneModel.isCollapsed) {
      laneModel.toggleCollapse()
    }

    forEach(Array.from(laneModel.children), (childId) => {
      const child = this.lf.getNodeModelById(childId)
      laneModel.removeChild(childId)
      this.nodeLaneMap.delete(childId)
      child?.deleteProperty('parent')
      child?.deleteProperty('relativeDistanceX')
      child?.deleteProperty('relativeDistanceY')
    })
  }

  /**
   * 保留成员删除折叠泳道前，先恢复真实边，避免删虚拟边时连带删除业务连线。
   */
  prepareLaneForDeletion = (laneModel: LaneModel) => {
    if (!this.cascadeDeleteChildren && laneModel.isCollapsed) {
      this.releaseLaneMembers(laneModel)
    }
  }

  onSelectionDrag = ({ e }: Partial<CallbackArgs<'selection:drag'>> = {}) => {
    const { nodes: selectedNodes } = this.lf.graphModel.getSelectElements()

    const next = new Set<LaneModel>()
    selectedNodes.forEach((node) => {
      const targetLane = this.getTargetLaneForNode(node)
      if (targetLane) next.add(targetLane)
    })

    this.activeGroups.forEach((lane) => {
      if (!next.has(lane)) lane.setAllowAppendChild(false)
    })
    next.forEach((lane) => {
      if (!this.activeGroups.has(lane)) lane.setAllowAppendChild(true)
    })

    this.activeGroups = next
    this.updateSelectionLaneDragPreview(e)
  }

  getSelectedLaneModels(): LaneModel[] {
    const { nodes } = this.lf.graphModel.getSelectElements()
    return nodes
      .map((node) => this.lf.getNodeModelById(node.id))
      .filter((node): node is LaneModel => String(node?.type) === 'lane')
  }

  getLaneModelsByIds(laneIds: string[]): LaneModel[] {
    return getLaneModelsByIds(this.getLaneBlockContext(), laneIds)
  }

  /**
   * 根据来源 Pool id 获取 Pool 模型。
   *
   * @param poolIds 来源 Pool id 列表。
   * @returns 可用的来源 Pool 模型列表。
   */
  getSourcePoolsByIds(poolIds: string[]): PoolModel[] {
    return getSourcePoolsByIds(this.getLaneBlockContext(), poolIds)
  }

  /**
   * 按 Lane 当前的 parent 关系，将多选 Lane 分组到各自来源 Pool。
   *
   * @param lanes 参与多选拖拽的 Lane 模型列表。
   * @returns 来源 Pool id 到 Lane 列表的映射。
   */
  groupLanesBySourcePool(lanes: LaneModel[]) {
    return groupLanesBySourcePool(this.getLaneBlockContext(), lanes)
  }

  /**
   * 判断多个来源 Pool 的 Lane block 是否可以整体迁移到目标 Pool。
   *
   * @param sourcePools 参与迁移的来源 Pool 列表。
   * @param lanesBySourcePool 各来源 Pool 对应的待迁移 Lane。
   * @param targetPool 预览或 drop 命中的目标 Pool。
   * @returns 所有来源 Pool 都满足最小 Lane 数约束时返回 true。
   */
  canMoveLaneBlock(
    sourcePools: PoolModel[],
    lanesBySourcePool: Map<string, LaneModel[]>,
    targetPool: PoolModel,
  ) {
    return canMoveLaneBlock(sourcePools, lanesBySourcePool, targetPool)
  }

  /**
   * 根据指针位置计算多选 Lane block 在目标 Pool 中的插入下标。
   *
   * @param pool 目标 Pool。
   * @param lanes 当前选中的 Lane 列表。
   * @param point 指针在画布中的坐标。
   * @returns 基于拖拽开始时槽位快照计算出的插入下标。
   */
  getSelectionLaneInsertIndex(
    pool: PoolModel,
    lanes: LaneModel[],
    point: { x: number; y: number },
  ): number {
    const snapshot = this.selectionLaneDragState?.sourceSlotsByPool[pool.id]
    if (!snapshot) return pool.getLaneInsertIndex(point)

    const selectedIds = new Set(lanes.map((lane) => lane.id))
    const selectedSlots = snapshot.slots.filter((slot) =>
      selectedIds.has(slot.laneId),
    )
    const axis = pool.isHorizontal ? point.y : point.x
    const initialAxis = selectedSlots.reduce((minimum, slot) => {
      const center = pool.isHorizontal
        ? (slot.minY + slot.maxY) / 2
        : (slot.minX + slot.maxX) / 2
      return Math.min(minimum, center)
    }, Number.POSITIVE_INFINITY)
    const targetSlot = snapshot.slots.find(
      (slot) =>
        !selectedIds.has(slot.laneId) &&
        point.x >= slot.minX &&
        point.x <= slot.maxX &&
        point.y >= slot.minY &&
        point.y <= slot.maxY,
    )

    if (targetSlot) {
      const targetIndex = snapshot.laneIds.indexOf(targetSlot.laneId)
      // 指针进入目标槽位即切换排序；依据相对初始块的位置决定插在槽位前或后。
      return axis < initialAxis ? targetIndex : targetIndex + 1
    }

    const bounds = pool.getBounds()
    const minAxis = pool.isHorizontal ? bounds.minY : bounds.minX
    const maxAxis = pool.isHorizontal ? bounds.maxY : bounds.maxX
    if (axis <= minAxis) return 0
    if (axis >= maxAxis) return snapshot.laneIds.length

    return snapshot.laneIds.findIndex((laneId) => selectedIds.has(laneId))
  }

  /**
   * selection 拖拽开始时记录 Lane/Pool 快照。
   *
   * core 会先整体移动选中节点；Pool 后续预览和 drop 都基于这里的快照修正顺序与子节点相对位置。
   */
  onSelectionDragStart = () => {
    const lanes = this.getSelectedLaneModels()
    if (lanes.length === 0) return

    const { nodes } = this.lf.graphModel.getSelectElements()
    const sourcePoolIds = Array.from(
      new Set(
        lanes
          .map((lane) => lane.properties?.parent)
          .filter((poolId): poolId is string => typeof poolId === 'string'),
      ),
    )
    const sourceSlotsByPool = sourcePoolIds.reduce(
      (slotsByPool, poolId) => {
        const pool = this.resolvePoolById(poolId)
        if (!pool) return slotsByPool

        // 框选拖拽会先移动 lane 的模型坐标，排序命中必须使用开始拖拽时的固定槽位。
        slotsByPool[poolId] = {
          laneIds: pool.getOrderedLanes().map((lane: LaneModel) => lane.id),
          slots: this.captureLaneSlotBounds(pool),
        }
        return slotsByPool
      },
      {} as SelectionLaneDragState['sourceSlotsByPool'],
    )
    const laneSnapshots = lanes.reduce(
      (snapshots, lane) => {
        snapshots[lane.id] = {
          x: lane.x,
          y: lane.y,
          children: lane.captureChildrenRelativePositions(),
        }
        return snapshots
      },
      {} as SelectionLaneDragState['laneSnapshots'],
    )

    this.selectionLaneDragState = {
      laneIds: lanes.map((lane) => lane.id),
      sourcePoolIds,
      sourceSlotsByPool,
      laneSnapshots,
      mixedPoolSelection: nodes.some((node) => String(node.type) === 'pool'),
    }
  }

  /**
   * 计算多选 Lane block 预览时的完整 Lane 顺序。
   *
   * @param pool 目标 Pool。
   * @param lanes 待插入的 Lane block。
   * @param insertIndex 目标插入下标。
   * @returns 预览状态下的 Lane id 顺序。
   */
  getLaneBlockPreviewOrder(
    pool: PoolModel,
    lanes: LaneModel[],
    insertIndex: number,
  ): string[] {
    return getLaneBlockPreviewOrder(pool, lanes, insertIndex)
  }

  getPoolContentBox(pool: PoolModel) {
    return getTitleLayout(
      { x: pool.x, y: pool.y, width: pool.width, height: pool.height },
      pool.getResolvedTitlePosition(),
      pool.titleSize,
    ).contentBox
  }

  /**
   * 预览多选 Lane block 插入后的布局。
   *
   * @param pool 目标 Pool。
   * @param lanes 待预览的 Lane block。
   * @param insertIndex 目标插入下标。
   * @returns {void} 仅更新模型布局和预览状态。
   */
  previewLaneBlockOrder(
    pool: PoolModel,
    lanes: LaneModel[],
    insertIndex: number,
  ) {
    previewLaneBlockOrder(this.getLaneBlockContext(), pool, lanes, insertIndex)
  }

  /**
   * 更新多选 Lane block 的 drop 指示器。
   *
   * @param pool 当前命中的目标 Pool。
   * @param lanes 待插入的 Lane block。
   * @param insertIndex 目标插入下标。
   * @returns {void}
   */
  setLaneBlockDropIndicator(
    pool: PoolModel,
    lanes: LaneModel[],
    insertIndex: number,
  ) {
    setLaneBlockDropIndicator(
      this.getLaneBlockContext(),
      pool,
      lanes,
      insertIndex,
    )
  }

  previewSelectionLaneOrder(
    pool: PoolModel,
    lanes: LaneModel[],
    insertIndex: number,
  ) {
    this.previewLaneBlockOrder(pool, lanes, insertIndex)
  }

  setSelectionLaneDropIndicator(
    pool: PoolModel,
    lanes: LaneModel[],
    insertIndex: number,
  ) {
    this.setLaneBlockDropIndicator(pool, lanes, insertIndex)
  }

  /**
   * selection:drag 阶段更新多选 Lane 的落位预览。
   *
   * 该阶段只负责展示“如果现在松手会放在哪里”，真正落位在 selection:drop。
   */
  updateSelectionLaneDragPreview(e?: MouseEvent | PointerEvent) {
    const state = this.selectionLaneDragState
    if (!state || !e) return

    const lanes = this.getLaneModelsByIds(state.laneIds)
    if (lanes.length === 0) return

    const point = this.lf.graphModel.getPointByClient({
      x: e.clientX,
      y: e.clientY,
    }).canvasOverlayPosition
    const targetPool = this.getPoolByPoint(point, lanes[0].getData())
    if (state.targetPoolId && state.targetPoolId !== targetPool?.id) {
      const previousPool = this.resolvePoolById(state.targetPoolId)
      this.clearLaneDropTarget(previousPool)
    }

    const sourcePools = this.getSourcePoolsByIds(state.sourcePoolIds)
    const lanesBySourcePool = this.groupLanesBySourcePool(lanes)
    const canMove =
      !!targetPool &&
      this.canMoveLaneBlock(sourcePools, lanesBySourcePool, targetPool)
    if (!targetPool || !canMove) {
      // 任一来源池不满足数量下限时，整个块都不能迁移，避免出现部分成功。
      state.targetPoolId = undefined
      state.insertIndex = undefined
      this.setLaneDragCursor('not-allowed')
      return
    }

    const insertIndex = this.getSelectionLaneInsertIndex(
      targetPool,
      lanes,
      point,
    )
    state.targetPoolId = targetPool.id
    state.insertIndex = insertIndex
    targetPool.isLaneDropTarget = !sourcePools.some(
      (sourcePool) => sourcePool.id === targetPool.id,
    )
    targetPool.setAllowAppendChild(targetPool.isLaneDropTarget)
    this.setLaneDragCursor(targetPool.isLaneDropTarget ? 'allowed' : undefined)
    this.setSelectionLaneDropIndicator(targetPool, lanes, insertIndex)
    if (sourcePools.length === 1 && sourcePools[0].id === targetPool.id) {
      this.previewSelectionLaneOrder(targetPool, lanes, insertIndex)
    }
  }

  clearSelectionLaneDragPreview() {
    const state = this.selectionLaneDragState
    if (!state) return

    // 同一预览可能先后经过多个来源/目标；结束时必须把本轮涉及的容器状态都还原。
    const poolIds = new Set([...state.sourcePoolIds, state.targetPoolId])
    poolIds.forEach((poolId) => {
      if (!poolId) return
      const pool = this.resolvePoolById(poolId)
      if (!pool) return
      this.clearLaneDropTarget(pool)
      pool.getOrderedLanes().forEach((lane: LaneModel) => {
        lane.isLaneReordering = false
      })
    })
    this.setLaneDragCursor()
  }

  getSelectionLaneBlock(
    lanes: LaneModel[],
    sourcePool: PoolModel,
  ): LaneModel[] {
    return getSelectionLaneBlock(lanes, sourcePool)
  }

  reorderLaneBlock(pool: PoolModel, lanes: LaneModel[], insertIndex: number) {
    reorderLaneBlock(pool, lanes, insertIndex)
  }

  returnSelectedLanesToSources(sourcePoolIds: string[]) {
    sourcePoolIds.forEach((poolId) => {
      const pool = this.resolvePoolById(poolId)
      pool?.layoutLanesByOrder({ reason: 'reorder' })
    })
  }

  /**
   * 获取多选 Lane block 在来源 Pool 中的视觉顺序。
   *
   * @param lanes 参与迁移的 Lane 列表。
   * @param targetPool 目标 Pool。
   * @returns 按用户视觉顺序排列的 Lane 列表。
   */
  getSelectionLaneVisualOrder(lanes: LaneModel[], targetPool: PoolModel) {
    return getSelectionLaneVisualOrder(
      lanes,
      targetPool,
      this.selectionLaneDragState?.laneSnapshots ?? {},
    )
  }

  /**
   * 根据拖拽开始快照恢复多选 Lane 的子节点相对位置。
   *
   * @param lanes 需要恢复子节点位置的 Lane 列表。
   * @returns {void}
   */
  restoreSelectionLaneChildPositions(lanes: LaneModel[]) {
    restoreLaneBlockChildPositions(
      lanes,
      this.selectionLaneDragState?.laneSnapshots ?? {},
    )
  }

  /**
   * 多选 Lane drop 的统一出口。
   *
   * 同池换序、跨池迁移、非法目标归位都在这里收敛。
   */
  finalizeSelectionLaneMove = (e?: MouseEvent | PointerEvent) => {
    const state = this.selectionLaneDragState
    if (!state) return false

    const lanes = this.getLaneModelsByIds(state.laneIds)
    if (lanes.length === 0) return false

    if (state.mixedPoolSelection) {
      this.returnSelectedLanesToSources(state.sourcePoolIds)
      this.restoreSelectionLaneChildPositions(lanes)
      return false
    }

    const point = e
      ? this.lf.graphModel.getPointByClient({ x: e.clientX, y: e.clientY })
          .canvasOverlayPosition
      : { x: lanes[0].x, y: lanes[0].y }
    const targetPool = this.getPoolByPoint(point, lanes[0].getData())
    if (!targetPool) {
      this.returnSelectedLanesToSources(state.sourcePoolIds)
      this.restoreSelectionLaneChildPositions(lanes)
      return false
    }

    const sourcePools = this.getSourcePoolsByIds(state.sourcePoolIds)
    const lanesBySourcePool = this.groupLanesBySourcePool(lanes)
    const canMove = this.canMoveLaneBlock(
      sourcePools,
      lanesBySourcePool,
      targetPool,
    )
    if (!canMove) {
      this.returnSelectedLanesToSources(state.sourcePoolIds)
      this.restoreSelectionLaneChildPositions(lanes)
      return false
    }

    const insertIndex =
      state.targetPoolId === targetPool.id &&
      typeof state.insertIndex === 'number'
        ? state.insertIndex
        : this.getSelectionLaneInsertIndex(targetPool, lanes, point)
    if (sourcePools.length === 1 && sourcePools[0].id === targetPool.id) {
      this.reorderLaneBlock(
        targetPool,
        this.getSelectionLaneBlock(lanes, targetPool),
        insertIndex,
      )
      return true
    }

    const block = this.getSelectionLaneVisualOrder(lanes, targetPool)

    // 跨 Pool 迁移要先从所有来源 Pool 的 laneOrder 中移除选中块，再插入目标 Pool。
    sourcePools.forEach((sourcePool) => {
      const movedIds = new Set(
        (lanesBySourcePool.get(sourcePool.id) ?? []).map((lane) => lane.id),
      )
      const ids = sourcePool
        .getOrderedLanes()
        .map((lane: LaneModel) => lane.id)
        .filter((id: string) => !movedIds.has(id))
      sourcePool.setLaneOrder(ids)
    })

    const targetIds = targetPool
      .getOrderedLanes()
      .map((lane: LaneModel) => lane.id)
      .filter((id: string) => !block.some((lane) => lane.id === id))
    targetIds.splice(
      Math.min(insertIndex, targetIds.length),
      0,
      ...block.map((lane) => lane.id),
    )
    targetPool.setLaneOrder(targetIds)
    block.forEach((lane) => {
      lane.setProperties({
        ...lane.properties,
        parent: targetPool.id,
        direction: targetPool.properties?.direction,
        isHorizontal: targetPool.isHorizontal,
      })
      this.nodeLaneMap.set(lane.id, targetPool.id)
    })
    this.restoreSelectionLaneChildPositions(block)

    sourcePools.forEach((sourcePool) => {
      if (sourcePool.id !== targetPool.id) {
        sourcePool.layoutLanesByOrder({ reason: 'move-to-pool' })
      }
    })
    targetPool.layoutLanesByOrder({ reason: 'move-to-pool' })
    sourcePools.forEach((sourcePool) => {
      this.removeEmptySourcePool(sourcePool, targetPool)
    })
    return true
  }

  onNodeDrag = ({ data: node, e }: CallbackArgs<'node:drag'>) => {
    if (String(node.type) === 'lane' && e) {
      const { canvasOverlayPosition } = this.lf.graphModel.getPointByClient({
        x: e.clientX,
        y: e.clientY,
      })
      this.updateLaneDragPreview(node.id, canvasOverlayPosition)
      return
    }
    this.setActiveGroup(node)
  }

  getLanePointerInsertIndex(
    pool: PoolModel,
    lane: LaneModel,
    point: { x: number; y: number },
    previousAxis: number,
    slotBounds: LaneSlotBounds[],
  ): number {
    return getLanePointerInsertIndex(
      this.getLaneDragContext(),
      pool,
      lane,
      point,
      previousAxis,
      slotBounds,
    )
  }

  /**
   * 保存 Pool 当前各 Lane 的几何槽位。
   *
   * @param pool 需要保存槽位快照的 Pool。
   * @returns 当前 Lane 顺序对应的槽位边界列表。
   */
  captureLaneSlotBounds(pool: PoolModel): LaneSlotBounds[] {
    return captureLaneSlotBounds(pool)
  }

  /**
   * 获取单 Lane 拖拽排序使用的槽位边界。
   *
   * @param pool 当前来源或目标 Pool。
   * @returns Lane 槽位边界列表。
   */
  getLaneSlotBounds(pool: PoolModel): LaneSlotBounds[] {
    return getLaneSlotBounds(this.getLaneDragContext(), pool)
  }

  /**
   * 获取单 Lane 拖拽时需要跟随移动的 Lane 及其子节点。
   *
   * @param lane 当前拖拽的 Lane。
   * @returns 需要同步移动的节点模型列表。
   */
  getLaneDragMembers(lane: LaneModel): BaseNodeModel[] {
    return getLaneDragMembers(this.getLaneDragContext(), lane)
  }

  /**
   * 获取与 Lane 关联、需要同步处理的边。
   *
   * @param lane 当前拖拽的 Lane。
   * @returns 与 Lane 或其子节点关联的边模型列表。
   */
  getLaneRelatedEdges(lane: LaneModel): BaseEdgeModel[] {
    return getLaneRelatedEdges(this.getLaneDragContext(), lane)
  }

  /**
   * 创建单 Lane 拖拽过程所需的初始快照。
   *
   * @param lane 当前拖拽的 Lane。
   * @param sourcePool Lane 所属的来源 Pool。
   * @param previousAxis 拖拽开始时 Lane 在 Pool 主轴上的位置。
   * @returns 单 Lane 拖拽状态。
   */
  createLaneDragState(
    lane: LaneModel,
    sourcePool: PoolModel,
    previousAxis: number,
  ) {
    return createLaneDragState(
      this.getLaneDragContext(),
      lane,
      sourcePool,
      previousAxis,
    )
  }

  /**
   * 恢复单 Lane 拖拽前的标题文本位置。
   *
   * @param state 单 Lane 拖拽状态快照。
   * @returns {void}
   */
  restoreLaneTextPositions(state: LaneDragState) {
    restoreLaneTextPositions(this.getLaneDragContext(), state)
  }

  /**
   * 设置单 Lane 拖拽期间的鼠标指针样式。
   *
   * @param cursor 允许或禁止 drop 时显示的指针样式；不传则恢复默认样式。
   * @returns {void}
   */
  setLaneDragCursor(cursor?: 'not-allowed' | 'allowed') {
    setLaneDragCursor(this.getLaneDragContext(), cursor)
  }

  /**
   * 清理指定 Pool 的 Lane drop 目标状态。
   *
   * @param pool 需要清理的 Pool；不传时由底层逻辑清理当前目标。
   * @returns {void}
   */
  clearLaneDropTarget(pool?: PoolModel) {
    clearLaneDropTarget(pool)
  }

  /**
   * 判断单 Lane 是否可以从来源 Pool 移入目标 Pool。
   *
   * @param sourcePool Lane 当前所属的来源 Pool。
   * @param targetPool 预览或 drop 命中的目标 Pool。
   * @returns 满足 Pool 约束时返回 true。
   */
  canDropLaneIntoPool(sourcePool: PoolModel, targetPool: PoolModel) {
    return canDropLaneIntoPool(sourcePool, targetPool)
  }

  raiseLaneRelatedElements(lane: LaneModel) {
    raiseLaneRelatedElements(this.getLaneDragContext(), lane)
  }

  syncLaneChildZIndex(lane: LaneModel, childId: string) {
    syncLaneChildZIndex(this.getLaneDragContext(), lane, childId)
  }

  /**
   * 获取单 Lane 在目标 Pool 中的预览顺序。
   *
   * @param pool 目标 Pool。
   * @param laneId 待移动的 Lane id。
   * @param insertIndex 目标插入下标。
   * @returns 预览状态下的 Lane id 顺序。
   */
  getLanePreviewOrder(
    pool: PoolModel,
    laneId: string,
    insertIndex: number,
  ): string[] {
    return getLanePreviewOrder(
      this.getLaneDragContext(),
      pool,
      laneId,
      insertIndex,
    )
  }

  /**
   * 更新单 Lane 的 drop 指示器。
   *
   * @param pool 目标 Pool。
   * @param laneId 待移动的 Lane id。
   * @param insertIndex 目标插入下标。
   * @returns {void}
   */
  setLaneDropIndicator(pool: PoolModel, laneId: string, insertIndex: number) {
    setLaneDropIndicator(this.getLaneDragContext(), pool, laneId, insertIndex)
  }

  /**
   * 预览单 Lane 插入后的 Pool 布局。
   *
   * @param pool 目标 Pool。
   * @param laneId 待移动的 Lane id。
   * @param insertIndex 目标插入下标。
   * @returns {void}
   */
  previewLaneOrder(pool: PoolModel, laneId: string, insertIndex: number) {
    previewLaneOrder(this.getLaneDragContext(), pool, laneId, insertIndex)
  }

  /**
   * 根据指针位置更新单 Lane 拖拽预览。
   *
   * @param laneId 当前拖拽的 Lane id。
   * @param point 指针在画布中的坐标。
   * @returns {void}
   */
  updateLaneDragPreview(laneId: string, point: { x: number; y: number }) {
    updateLaneDragPreview(this.getLaneDragContext(), laneId, point)
  }

  /**
   * 清理单 Lane 拖拽期间的预览布局和指示器。
   *
   * @returns {void}
   */
  clearLaneDragPreview() {
    clearLaneDragPreview(this.getLaneDragContext())
  }

  /**
   * 将非法 drop 的 Lane 恢复到来源 Pool。
   *
   * @param lane 需要归位的 Lane。
   * @param sourcePool Lane 原所属的 Pool。
   * @param state 单 Lane 拖拽快照；不传时由底层逻辑按当前状态处理。
   * @returns {void}
   */
  returnLaneToSourcePool(
    lane: LaneModel,
    sourcePool: PoolModel,
    state?: LaneDragState,
  ) {
    returnLaneToSourcePool(this.getLaneDragContext(), lane, sourcePool, state)
  }

  private getTargetLaneForNode(
    node: LogicFlow.NodeData,
  ): LaneModel | undefined {
    const nodeModel = this.lf.getNodeModelById(node.id)
    const bounds = nodeModel?.getBounds()
    if (!nodeModel || !bounds) return undefined

    const targetLane = this.getLaneByBounds(bounds, node)
    if (!targetLane) return undefined
    if (nodeModel.isGroup && targetLane.id === node.id) return undefined
    if (!targetLane.isAllowAppendIn(node)) return undefined

    return targetLane
  }

  setActiveGroup = (node: LogicFlow.NodeData) => {
    const targetLane = this.getTargetLaneForNode(node)

    const next = new Set<LaneModel>()
    if (targetLane) next.add(targetLane)

    this.activeGroups.forEach((lane) => {
      if (!next.has(lane)) lane.setAllowAppendChild(false)
    })
    next.forEach((lane) => {
      if (!this.activeGroups.has(lane)) lane.setAllowAppendChild(true)
    })

    this.activeGroups = next
  }

  clearDragTargetHighlight() {
    this.activeGroups.forEach((lane) => {
      lane.setAllowAppendChild(false)
    })
    this.activeGroups.clear()
  }

  /**
   * 完成单 Lane drop，并根据命中结果执行同池换序或跨池迁移。
   *
   * @param node drop 事件中的节点数据。
   * @returns drop 被成功处理时返回 true，否则返回 false。
   */
  finalizeLaneDrop(node?: LogicFlow.NodeData): boolean {
    return finalizeLaneDrop(this.getLaneDragContext(), node)
  }

  onNodeDrop = ({ data: node }: Partial<CallbackArgs<'node:drop'>> = {}) => {
    this.finalizeLaneDrop(node)
    this.clearLaneDragPreview()
    this.setLaneDragCursor()
    this.clearDragTargetHighlight()
  }

  onNodeMouseUp = () => {
    this.setLaneDragCursor()
    this.clearDragTargetHighlight()
  }
  /**
   * @param node
   * @param isMultiple
   * @param isSelected
   */
  onNodeSelect = ({
    data: node,
    isMultiple,
    isSelected,
  }: Omit<CallbackArgs<'node:click'>, 'e' | 'position'>) => {
    const nodeModel = this.lf.getNodeModelById(node.id)
    // FIX #1004
    // 如果节点被多选，
    // 这个节点是分组，则将分组的所有子节点取消选中
    // 这个节点是分组的子节点，且其所属分组节点已选，则取消选中
    if (isMultiple && isSelected) {
      this.normalizeSelectedContainerTree(node.id)
    }
    if (isSelected && String(nodeModel?.type) === 'lane') {
      this.raiseLaneRelatedElements(nodeModel as LaneModel)
    }
  }

  onNodeMove = ({
    data,
  }: Omit<CallbackArgs<'node:mousemove'>, 'e' | 'position'>) => {
    const { id } = data
    const groupId = this.nodeLaneMap.get(id)
    if (!groupId) {
      return
    }
    const groupModel = this.lf.getNodeModelById(groupId) as LaneModel

    if (!groupModel || !groupModel.isRestrict || !groupModel.autoResize) {
      return
    }
    // 当父节点isRestrict=true & autoResize=true
    // 子节点在父节点中移动时，父节点会自动调整大小
    const childModel = this.lf.getNodeModelById(id)
    if (!childModel) {
      return
    }

    const { minX, minY, maxX, maxY } = childModel.getBounds()
    // step2：比较当前child.bounds与parent.bounds的差异，比如child.minX<parent.minX，那么parent.minX=child.minX
    let hasChange = false
    const groupBounds = groupModel.getBounds()
    const newGroupBounds = Object.assign({}, groupBounds)
    if (minX < newGroupBounds.minX) {
      newGroupBounds.minX = minX
      hasChange = true
    }
    if (minY < newGroupBounds.minY) {
      newGroupBounds.minY = minY
      hasChange = true
    }
    if (maxX > newGroupBounds.maxX) {
      newGroupBounds.maxX = maxX
      hasChange = true
    }
    if (maxY > newGroupBounds.maxY) {
      newGroupBounds.maxY = maxY
      hasChange = true
    }
    if (!hasChange) {
      return
    }
    // step3: 根据当前parent.bounds去计算出最新的x、y、width、height
    const newGroupX =
      newGroupBounds.minX + (newGroupBounds.maxX - newGroupBounds.minX) / 2
    const newGroupY =
      newGroupBounds.minY + (newGroupBounds.maxY - newGroupBounds.minY) / 2
    const newGroupWidth = newGroupBounds.maxX - newGroupBounds.minX
    const newGroupHeight = newGroupBounds.maxY - newGroupBounds.minY
    groupModel.moveTo(newGroupX, newGroupY)
    groupModel.width = newGroupWidth
    groupModel.height = newGroupHeight
    groupModel.updateExpandedSize(newGroupWidth, newGroupHeight)
    groupModel.setTextPosition()
  }

  onGraphRendered = ({ data }: CallbackArgs<'graph:rendered'>) => {
    this.nodeLaneMap.clear()
    forEach(data.nodes, (node) => {
      if (node.children) {
        forEach(node.children, (childId) => {
          this.nodeLaneMap.set(childId, node.id)
        })
      }
    })

    // Pool 模型初始化早于 Lane 模型，初次布局可能没有可用泳道。显式使用新标题边
    // 配置的 Pool 在渲染完成后重排，既能正确避让标题区，也不改变历史数据的既有坐标。
    this.lf.graphModel.nodes.forEach((node) => {
      if (String(node.type) === 'pool' && node.properties?.titlePosition) {
        ;(node as PoolModel).layoutLanesByOrder({ reason: 'init' })
      }
    })
  }

  /**
   * 检测group:resize后的bounds是否会小于children的bounds
   * 限制group进行resize时不能小于内部的占地面积
   * @param groupModel
   * @param deltaX
   * @param deltaY
   * @param newWidth
   * @param newHeight
   */
  checkGroupBoundsWithChildren(
    groupModel: LaneModel,
    deltaX: number,
    deltaY: number,
    newWidth: number,
    newHeight: number,
  ) {
    const childrenBounds = getChildrenBounds(groupModel, (id) =>
      this.lf.getNodeModelById(id),
    )
    if (!childrenBounds) {
      return true
    }

    const newX = groupModel.x + deltaX / 2
    const newY = groupModel.y + deltaY / 2
    const groupBounds = {
      minX: newX - newWidth / 2,
      minY: newY - newHeight / 2,
      maxX: newX + newWidth / 2,
      maxY: newY + newHeight / 2,
    }

    return isGroupBoundsContainsChildren(groupBounds, childrenBounds)
  }

  init() {
    const { lf } = this
    const { graphModel } = lf
    // 添加分组节点移动规则
    // 1. 移动分组节点时，同时移动分组内所有节点
    // 2. 移动子节点时，判断是否有限制规则（isRestrict）
    graphModel.addNodeMoveRules((model, deltaX, deltaY) => {
      // 判断如果是 group，移动时需要同时移动组内的所有节点
      if (model.isGroup) {
        return true
      }

      const groupId = this.nodeLaneMap.get(model.id)!
      const groupModel = this.lf.getNodeModelById(groupId) as LaneModel

      if (groupModel && groupModel.isRestrict) {
        if (groupModel.autoResize) {
          // 子节点在父节点中移动时，父节点会自动调整大小
          // 在node:mousemove中进行父节点的调整
          return true
        } else {
          // 如果移动的节点存在于某个分组中，且这个分组禁止子节点移出去
          const groupBounds = groupModel.getBounds()
          return isAllowMoveTo(groupBounds, model, deltaX, deltaY)
        }
      }

      return true
    })
    graphModel.addNodeResizeRules((model, deltaX, deltaY, width, height) => {
      if (String(model.type) === 'pool') return false
      if (model.isGroup) {
        return this.checkGroupBoundsWithChildren(
          model as LaneModel,
          deltaX,
          deltaY,
          width,
          height,
        )
      }
      return true
    })

    graphModel.dynamicGroup = this
    // 快捷键、菜单和 API 都会调用 lf.deleteNode，统一在这里保护泳道数量下限。
    this.originDeleteNode = lf.deleteNode.bind(lf)
    lf.deleteNode = (nodeId: string): boolean => {
      const node = lf.getNodeModelById(nodeId)
      if (String(node?.type) === 'lane') {
        const pool = this.resolvePoolById(
          this.nodeLaneMap.get(nodeId) ?? node?.properties?.parent,
        )
        if (pool?.isPool && !pool.canRemoveLane(1)) return false
        this.prepareLaneForDeletion(node as LaneModel)
      }
      return this.originDeleteNode!(nodeId)
    }
    lf.on(NODE_ADD_DROP_DND_EVENTS, this.onNodeAddOrDrop)
    lf.on(EventType.SELECTION_DROP, this.onSelectionDrop)
    lf.on(EventType.SELECTION_DRAGSTART, this.onSelectionDragStart)
    lf.on(EventType.NODE_DELETE, this.removeNodeFromGroup)
    lf.on(EventType.EDGE_DELETE, this.onEdgeDelete)
    lf.on(NODE_DRAG_EVENTS, this.onNodeDrag)
    lf.on(EventType.SELECTION_DRAG, this.onSelectionDrag)
    lf.on(EventType.NODE_DROP, this.onNodeDrop)
    lf.on(EventType.NODE_MOUSEUP, this.onNodeMouseUp)
    lf.on(EventType.NODE_CLICK, this.onNodeSelect)
    lf.on(EventType.NODE_MOUSEMOVE, this.onNodeMove)
    lf.on(EventType.GRAPH_RENDERED, this.onGraphRendered)

    lf.on(ExtensionEventType.GROUP_ADD_NODE, this.onGroupAddNode)

    lf.addElements = createPoolAddElements({
      lf,
      nodeLaneMap: this.nodeLaneMap,
      resolvePoolById: this.resolvePoolById.bind(this),
      getAncestorContainersByNodeId:
        this.getAncestorContainersByNodeId.bind(this),
      getRootContainerNodes: this.getRootContainerNodes.bind(this),
    })

    this.render()
  }

  /** 将临时的泳道落位反馈挂到 LogicFlow 顶层工具层，始终高于节点与边。 */
  render(_lf?: LogicFlow, container?: HTMLElement) {
    // init 阶段会调用一次无参数 render；此时 ToolOverlay 尚未创建。
    if (!container) return
    if (!this.dragOverlayContainer) {
      this.dragOverlayContainer = document.createElement('div')
      this.dragOverlayContainer.className = 'lf-pool-lane-drag-overlay-root'
      // ToolOverlay 默认允许子元素接收事件；拖拽反馈层必须完全透传给画布。
      this.dragOverlayContainer.style.pointerEvents = 'none'
      this.dragOverlayContainer.style.position = 'absolute'
      this.dragOverlayContainer.style.inset = '0'
      container.appendChild(this.dragOverlayContainer)
    }
    render(
      h(PoolLaneDragOverlay, { graphModel: this.lf.graphModel }),
      this.dragOverlayContainer,
    )
  }

  destroy() {
    // 销毁监听的事件，并移除渲染的 dom 内容
    this.lf.off(NODE_ADD_DROP_DND_EVENTS, this.onNodeAddOrDrop)
    this.lf.off(EventType.SELECTION_DROP, this.onSelectionDrop)
    this.lf.off(EventType.SELECTION_DRAGSTART, this.onSelectionDragStart)
    this.lf.off(EventType.NODE_DELETE, this.removeNodeFromGroup)
    this.lf.off(EventType.EDGE_DELETE, this.onEdgeDelete)
    this.lf.off(NODE_DRAG_EVENTS, this.onNodeDrag)
    this.lf.off(EventType.SELECTION_DRAG, this.onSelectionDrag)
    this.lf.off(EventType.NODE_DROP, this.onNodeDrop)
    this.lf.off(EventType.NODE_MOUSEUP, this.onNodeMouseUp)
    this.lf.off(EventType.NODE_CLICK, this.onNodeSelect)
    this.lf.off(EventType.NODE_MOUSEMOVE, this.onNodeMove)
    this.lf.off(EventType.GRAPH_RENDERED, this.onGraphRendered)
    this.lf.off(ExtensionEventType.GROUP_ADD_NODE, this.onGroupAddNode)
    if (this.originDeleteNode) {
      this.lf.deleteNode = this.originDeleteNode
    }
    if (this.dragOverlayContainer) {
      render(null, this.dragOverlayContainer)
      this.dragOverlayContainer.remove()
      this.dragOverlayContainer = undefined
    }
    releasePoolStyle()
  }
}

export default PoolElements
