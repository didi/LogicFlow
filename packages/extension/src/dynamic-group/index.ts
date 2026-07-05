import LogicFlow, {
  BaseEdgeModel,
  BaseNodeModel,
  EventType,
  CallbackArgs,
  Model,
  transformNodeData,
  transformEdgeData,
} from '@logicflow/core'
import { assign, cloneDeep, filter, forEach, has, map, sortBy } from 'lodash-es'
import { DynamicGroupNode } from './node'
import { DynamicGroupNodeModel } from './model'
import { ExtensionEventType, NODE_DRAG_EVENTS } from '../constant/events'
import {
  isAllowMoveTo,
  isBoundsInGroup,
  getChildrenBounds,
  isGroupBoundsContainsChildren,
} from './utils'

import GraphConfigData = LogicFlow.GraphConfigData
import GraphElements = LogicFlow.GraphElements
import EdgeConfig = LogicFlow.EdgeConfig
import EdgeData = LogicFlow.EdgeData
import NodeData = LogicFlow.NodeData
import BoxBoundsPoint = Model.BoxBoundsPoint
import ElementsInfoInGroup = DynamicGroup.ElementsInfoInGroup

export * from './node'
export * from './model'

export const dynamicGroup = {
  type: 'dynamic-group',
  view: DynamicGroupNode,
  model: DynamicGroupNodeModel,
}

const DEFAULT_TOP_Z_INDEX = -1000
const DEFAULT_BOTTOM_Z_INDEX = -10000

export type SensorOutlineOptions = {
  /** 拖拽感应外框描边颜色，默认 '#feb663' */
  stroke?: string
  /** 拖拽感应外框线宽，默认 2 */
  strokeWidth?: number
}

export class DynamicGroup {
  static pluginName = 'dynamicGroup'

  private lf: LogicFlow
  /**
   * 为 true 时禁止手动将边连到/从 dynamic-group 节点本身。
   * 默认 false，与历史行为一致；折叠虚拟边不受影响。
   */
  disallowEdgeConnectToGroup: boolean = false
  /**
   * 删除 dynamic-group 时是否级联删除其成员。
   * 默认 true，与 v1.1 以来行为一致；为 false 时仅删除分组，成员保留并解除归属。
   */
  cascadeDeleteChildren: boolean = true
  /** 拖拽节点进入分组时的感应外框样式 */
  sensorOutline?: SensorOutlineOptions
  topGroupZIndex: number = DEFAULT_BOTTOM_Z_INDEX
  // 激活态的 group 节点（支持多组同时高亮）
  activeGroups: Set<DynamicGroupNodeModel> = new Set()
  // 存储节点与 group 的映射关系
  nodeGroupMap: Map<string, string> = new Map()
  /** 折叠态虚拟边 id → 所属分组与真实边 id */
  collapsedVirtualEdges: Map<string, { groupId: string; realEdgeId: string }> =
    new Map()
  /** 折叠隐藏的真实边 id → 分组 id */
  collapsedRealEdgeToGroup: Map<string, string> = new Map()
  private originDeleteNode?: LogicFlow['deleteNode']

  constructor({ lf, options }: LogicFlow.IExtensionProps) {
    lf.register(dynamicGroup)
    this.lf = lf
    assign(this, options)
    // 初始化插件，从监听事件开始及设置规则开始
    this.init()
  }

  /**
   * 获取节点所属的分组
   * @param nodeId
   */
  getGroupByNodeId(nodeId: string) {
    const groupId = this.nodeGroupMap.get(nodeId)
    if (groupId) {
      return this.lf.getNodeModelById(groupId)
    }
  }

  registerCollapsedVirtualEdge(
    virtualId: string,
    groupId: string,
    realEdgeId: string,
  ) {
    // 双向索引：删虚拟边时能找到真实边；删真实边时能清理虚拟边登记
    this.collapsedVirtualEdges.set(virtualId, { groupId, realEdgeId })
    this.collapsedRealEdgeToGroup.set(realEdgeId, groupId)
  }

  unregisterCollapsedVirtualEdge(virtualId: string) {
    const info = this.collapsedVirtualEdges.get(virtualId)
    if (info) {
      this.collapsedVirtualEdges.delete(virtualId)
      if (this.collapsedRealEdgeToGroup.get(info.realEdgeId) === info.groupId) {
        this.collapsedRealEdgeToGroup.delete(info.realEdgeId)
      }
    }
  }

  /**
   * 折叠态删边：删虚拟边时连带删对应真实边，防止展开后「边复活」（#2395）。
   * Gateway 双分支等场景下，每条虚拟边只映射一条真实边。
   */
  onEdgeDelete = ({ data: edge }: CallbackArgs<'edge:delete'>) => {
    const virtualMapping = this.collapsedVirtualEdges.get(edge.id)
    if (virtualMapping) {
      this.collapsedVirtualEdges.delete(edge.id)
      this.collapsedRealEdgeToGroup.delete(virtualMapping.realEdgeId)

      // 仅删除本条映射的真实边，不影响同组其它分支
      if (this.lf.getEdgeModelById(virtualMapping.realEdgeId)) {
        this.lf.deleteEdge(virtualMapping.realEdgeId)
      }
      return
    }

    // 真实边被其它路径删除时，同步清理登记与分组内快照
    const groupId = this.collapsedRealEdgeToGroup.get(edge.id)
    if (groupId) {
      this.collapsedRealEdgeToGroup.delete(edge.id)
    }

    for (const [virtualId, info] of this.collapsedVirtualEdges.entries()) {
      if (info.realEdgeId === edge.id) {
        this.collapsedVirtualEdges.delete(virtualId)
      }
    }
  }

  /**
   * 获取自定位置及其所属分组
   * 当分组重合时，优先返回最上层的分组
   * @param bounds
   * @param nodeData
   */
  getGroupByBounds(
    bounds: BoxBoundsPoint,
    nodeData: NodeData,
  ): DynamicGroupNodeModel | undefined {
    const { nodes } = this.lf.graphModel
    const groups = filter(nodes, (node) => {
      return (
        !!node.isGroup &&
        isBoundsInGroup(bounds, node) &&
        node.id !== nodeData.id
      )
    })

    const count = groups.length
    if (count <= 1) {
      return groups[0] as DynamicGroupNodeModel
    } else {
      let topZIndexGroup = groups[count - 1]
      for (let i = count - 2; i >= 0; i--) {
        if (groups[i].zIndex > topZIndexGroup.zIndex) {
          topZIndexGroup = groups[i]
        }
      }
      return topZIndexGroup as DynamicGroupNodeModel
    }
  }

  /**
   * 提高元素的层级，如果是 group，同时提高其子元素的层级
   * @param model
   */
  sendNodeToFront(model?: BaseNodeModel) {
    if (!model || !model.isGroup) return

    this.topGroupZIndex++
    model.setZIndex(this.topGroupZIndex)
    if (model.children) {
      const { children } = model as DynamicGroupNodeModel
      forEach(Array.from(children), (nodeId) => {
        const node = this.lf.getNodeModelById(nodeId)
        this.sendNodeToFront(node)
      })
    }
  }

  /**
   * 递归计算某个分组内最高的 zIndex 值
   * TODO: 这块儿有点疑问❓如果 node 不是 group，这块儿返回的 maxZIndex 是最小值，但 node 的 zIndex 不一定是这个值
   * @param node
   */
  getMaxZIndex(node: BaseNodeModel) {
    let maxZIndex = DEFAULT_BOTTOM_Z_INDEX
    if (node.isGroup) {
      maxZIndex = Math.max(maxZIndex, node.zIndex)
    }
    if (node.children) {
      const { children } = node as DynamicGroupNodeModel
      forEach(Array.from(children), (childId) => {
        const child = this.lf.getNodeModelById(childId)
        if (child?.isGroup) {
          const childMaxZIndex = this.getMaxZIndex(child)
          maxZIndex = Math.max(maxZIndex, childMaxZIndex)
        }
      })
    }
    return maxZIndex
  }

  /**
   * 校准当前 topGroupZIndex 的值
   * @param nodes
   */
  calibrateTopGroupZIndex(nodes: NodeData[]) {
    // 初始化时 or 增加新节点时，找出所有 nodes 的最大 zIndex
    let maxZIndex = DEFAULT_BOTTOM_Z_INDEX
    forEach(nodes, (node) => {
      const nodeModel = this.lf.getNodeModelById(node.id)
      if (nodeModel) {
        const currNodeMaxZIndex = this.getMaxZIndex(nodeModel)
        if (currNodeMaxZIndex > maxZIndex) {
          maxZIndex = currNodeMaxZIndex
        }
      }
    })

    // TODO: 不是很理解这块儿的代码逻辑，需要整理一下
    if (this.topGroupZIndex >= maxZIndex) {
      // 一般是初始化时/增加新节点时发生，因为外部强行设置了一个很大的 zIndex
      // 删除节点不会影响目前最高 zIndex 的赋值
      return
    }

    // 新增 nodes 中如果存在 zIndex 比 this.topGroupZIndex 大
    // 说明 this.topGroupZIndex 已经失去意义，代表不了目前最高 zIndex 的 group，需要重新校准

    // https://github.com/didi/LogicFlow/issues/1535
    // 当外部直接设置多个 BaseNode.zIndex = 1 时
    // 当点击某一个 node 时，由于这个 this.topGroupZIndex 是从 -10000 开始计算的，
    // this.topGroupZIndex + 1 也就是-9999，这就造成当前点击的 node 的 zIndex 远远
    // 比其它 node 的 zIndex 小，因此造成 zIndex 错乱的问题
    // TODO: 这儿的 nodes 能否直接用传参进来的 nodes 呢？？？
    const allNodes = this.lf.graphModel.nodes
    const allGroups = filter(allNodes, (node) => !!node.isGroup)

    let max = this.topGroupZIndex
    forEach(allGroups, (group) => {
      if (group.zIndex > max) max = group.zIndex
    })
    this.topGroupZIndex = max
  }

  onSelectionDrop = () => {
    this.clearDragTargetHighlight()
    const { nodes: selectedNodes } = this.lf.graphModel.getSelectElements()
    selectedNodes.forEach((node) => {
      this.addNodeToGroup(node)
    })
  }

  onNodeAdd = ({ data: node }: CallbackArgs<'node:add'>) => {
    this.syncGroupChildren(node)
  }

  onNodeDndAdd = ({ data: node }: CallbackArgs<'node:dnd-add'>) => {
    this.syncGroupChildren(node)
    this.addNodeToGroup(node)
    this.clearDragTargetHighlight()
  }

  onNodeDrop = ({ data: node }: CallbackArgs<'node:drop'>) => {
    this.clearDragTargetHighlight()
    this.addNodeToGroup(node)
  }

  onNodeMouseUp = () => {
    this.clearDragTargetHighlight()
  }

  clearDragTargetHighlight() {
    this.activeGroups.forEach((group) => {
      group.setAllowAppendChild(false)
    })
    this.activeGroups.clear()
  }

  detachNodeFromGroup = (groupId: string, nodeId: string) => {
    const group = this.lf.getNodeModelById(groupId) as DynamicGroupNodeModel
    if (!group) return
    group.removeChild(nodeId)
    this.nodeGroupMap.delete(nodeId)
    group.setAllowAppendChild(false)
  }

  releaseGroupMembers = (groupModel: DynamicGroupNodeModel) => {
    if (groupModel.isCollapsed) {
      // 复用展开路径恢复真实边与成员可见性，避免删虚拟边时误删真实边
      groupModel.toggleCollapse(false)
    }

    forEach(Array.from(groupModel.children), (childId) => {
      this.detachNodeFromGroup(groupModel.id, childId)
    })
  }

  removeChildFromOtherGroups = (childId: string, ownerGroupId: string) => {
    const preGroupId = this.nodeGroupMap.get(childId)
    if (preGroupId && preGroupId !== ownerGroupId) {
      const preGroup = this.lf.getNodeModelById(
        preGroupId,
      ) as DynamicGroupNodeModel
      preGroup?.removeChild(childId)
    }

    forEach(this.lf.graphModel.nodes, (node) => {
      if (!node.isGroup || node.id === ownerGroupId) return
      const group = node as DynamicGroupNodeModel
      if (group.children?.has(childId)) {
        group.removeChild(childId)
      }
    })
  }

  setNodeGroup = (groupId: string, childId: string) => {
    this.removeChildFromOtherGroups(childId, groupId)
    this.nodeGroupMap.set(childId, groupId)
  }

  syncGroupChildren = (node: LogicFlow.NodeData) => {
    const nodeModel = this.lf.getNodeModelById(node.id)
    if (!nodeModel?.isGroup) return

    const group = nodeModel as DynamicGroupNodeModel
    forEach(Array.from(group.children), (childId) => {
      this.setNodeGroup(node.id, childId)
    })

    // 新增 group 时进行 this.topGroupZIndex 的校准更新
    this.calibrateTopGroupZIndex([node])
    this.onNodeSelect({
      data: node,
      isSelected: false,
      isMultiple: false,
    })
  }

  addNodeToGroup = (node: LogicFlow.NodeData) => {
    const nodeModel = this.lf.getNodeModelById(node.id)
    const bounds = nodeModel?.getBounds()
    if (!nodeModel || !bounds) return

    // 1. 如果该节点之前已经在 group 中了，则将其从之前的 group 移除
    const preGroupId = this.nodeGroupMap.get(node.id)

    // 2. 然后再判断这个节点是否在某个 group 范围内，如果是，则将其添加到对应的 group 中
    // TODO: 找到这个范围内的 groupModel, 并加 node 添加到该 group
    const targetGroup = this.getGroupByBounds(bounds, node)

    // 同组内移动，成员关系不变（#2412）
    if (preGroupId && targetGroup?.id === preGroupId) {
      return
    }

    if (!targetGroup) {
      if (preGroupId) {
        this.detachNodeFromGroup(preGroupId, node.id)
      }
      return
    }

    if (!preGroupId) {
      if (targetGroup.isAllowAppendIn(node)) {
        targetGroup.addChild(node.id)
        // 建立节点与 group 的映射关系放在了 group.addChild 触发的事件中，与直接调用 addChild 的行为保持一致
      } else {
        // 抛出不允许插入的事件
        this.lf.emit(ExtensionEventType.GROUP_NOT_ALLOWED, {
          group: targetGroup.getData(),
          node,
        })
      }
      return
    }

    if (targetGroup.isAllowAppendIn(node)) {
      this.detachNodeFromGroup(preGroupId, node.id)
      targetGroup.addChild(node.id)
      // 建立节点与 group 的映射关系放在了 group.addChild 触发的事件中，与直接调用 addChild 的行为保持一致
    } else {
      const preGroup = this.lf.getNodeModelById(
        preGroupId,
      ) as DynamicGroupNodeModel
      if (preGroup && isBoundsInGroup(bounds, preGroup)) {
        return
      }
      this.detachNodeFromGroup(preGroupId, node.id)
      // 抛出不允许插入的事件
      this.lf.emit(ExtensionEventType.GROUP_NOT_ALLOWED, {
        group: targetGroup.getData(),
        node,
      })
    }
  }

  onGroupAddNode = ({
    data: groupData,
    childId,
  }: CallbackArgs<ExtensionEventType.GROUP_ADD_NODE>) => {
    this.setNodeGroup(groupData.id, childId)
  }

  removeNodeFromGroup = ({
    data: node,
    model,
  }: CallbackArgs<'node:delete'>) => {
    if (model.isGroup && node.children) {
      const groupModel = model as DynamicGroupNodeModel
      if (this.cascadeDeleteChildren) {
        forEach(Array.from(groupModel.children), (childId) => {
          this.nodeGroupMap.delete(childId)
          this.lf.deleteNode(childId)
        })
      } else {
        this.releaseGroupMembers(groupModel)
      }
    }

    const groupId = this.nodeGroupMap.get(node.id)
    if (groupId) {
      const group = this.lf.getNodeModelById(groupId)
      group && (group as DynamicGroupNodeModel).removeChild(node.id)
      this.nodeGroupMap.delete(node.id)
    }
  }

  onSelectionDrag = () => {
    const { nodes: selectedNodes } = this.lf.graphModel.getSelectElements()

    // 每个节点独立找目标组，合并为 Set，消除迭代顺序的影响
    const next = new Set<DynamicGroupNodeModel>()
    selectedNodes.forEach((node) => {
      const targetGroup = this.getTargetGroupForNode(node)
      if (targetGroup) next.add(targetGroup)
    })

    // diff 更新：只操作有变化的组，避免无谓的视觉抖动
    this.activeGroups.forEach((group) => {
      if (!next.has(group)) group.setAllowAppendChild(false)
    })
    next.forEach((group) => {
      if (!this.activeGroups.has(group)) group.setAllowAppendChild(true)
    })

    this.activeGroups = next
  }

  onNodeDrag = ({ data: node }: CallbackArgs<'node:drag'>) => {
    this.setActiveGroup(node)
  }

  private getTargetGroupForNode(
    node: LogicFlow.NodeData,
  ): DynamicGroupNodeModel | undefined {
    const nodeModel = this.lf.getNodeModelById(node.id)
    const bounds = nodeModel?.getBounds()
    if (!nodeModel || !bounds) return undefined

    const targetGroup = this.getGroupByBounds(bounds, node)
    if (!targetGroup) return undefined
    if (nodeModel.isGroup && targetGroup.id === node.id) return undefined
    if (!targetGroup.isAllowAppendIn(node)) return undefined

    return targetGroup
  }

  setActiveGroup = (node: LogicFlow.NodeData) => {
    const targetGroup = this.getTargetGroupForNode(node)

    const next = new Set<DynamicGroupNodeModel>()
    if (targetGroup) next.add(targetGroup)

    this.activeGroups.forEach((group) => {
      if (!next.has(group)) group.setAllowAppendChild(false)
    })
    next.forEach((group) => {
      if (!this.activeGroups.has(group)) group.setAllowAppendChild(true)
    })

    this.activeGroups = next
  }

  /**
   * 1. 分组节点默认在普通节点下面
   * 2. 分组节点被选中后，会将分组节点以及其内部的其它分组节点放到其余分组节点的上面
   * 3. 分组节点取消选中后，不会将分组节点重置为原来的高度
   * 4. 由于 LogicFlow 核心目标是支持用户手动绘制流程图，所以暂时不支持一张流程图超过 1000 个分组节点的情况
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
    this.sendNodeToFront(nodeModel)
    // 重置所有 group 的 zIndex，防止 group 节点 zIndex 增长为正数（目的是保持 group 节点在最底层）
    if (this.topGroupZIndex > DEFAULT_TOP_Z_INDEX) {
      const { nodes } = this.lf.graphModel
      this.topGroupZIndex = DEFAULT_BOTTOM_Z_INDEX
      const groups = sortBy(
        filter(nodes, (node) => !!node.isGroup),
        'zIndex',
      )

      let preZIndex = 0
      forEach(groups, (group) => {
        if (group.zIndex !== preZIndex) {
          this.topGroupZIndex++
          preZIndex = group.zIndex
        }
        group.setZIndex(this.topGroupZIndex)
      })
    }

    // FIX #1004
    // 如果节点被多选，
    // 这个节点是分组，则将分组的所有子节点取消选中
    // 这个节点是分组的子节点，且其所属分组节点已选，则取消选中
    if (isMultiple && isSelected) {
      if (nodeModel?.isGroup) {
        const { children } = nodeModel as DynamicGroupNodeModel
        forEach(Array.from(children), (childId) => {
          const childModel = this.lf.getNodeModelById(childId)
          childModel?.setSelected(false)
        })
      } else {
        const groupId = this.nodeGroupMap.get(node.id)
        if (groupId) {
          const graphModel = this.lf.getNodeModelById(groupId)
          graphModel?.isSelected && nodeModel?.setSelected(false)
        }
      }
    }
  }

  onNodeMove = ({
    data,
  }: Omit<CallbackArgs<'node:mousemove'>, 'e' | 'position'>) => {
    const { id } = data
    const groupId = this.nodeGroupMap.get(id)
    if (!groupId) {
      return
    }
    const groupModel = this.lf.getNodeModelById(
      groupId,
    ) as DynamicGroupNodeModel

    if (!groupModel || !groupModel.isRestrict || !groupModel.autoResize) {
      return
    }
    // 当父节点isRestrict=true & autoResize=true
    // 子节点在父节点中移动时，父节点会自动调整大小
    const childModel = this.lf.getNodeModelById(id)
    if (!childModel) {
      return
    }

    // node:mousemove 的 data 在 onDragging 之前采集，坐标滞后；
    // 此时子节点 model 已更新，直接读取 getBounds()。
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

  onNodeResize = ({
    model,
  }: Omit<CallbackArgs<'node:resize'>, 'e' | 'position'>) => {
    if (model?.isGroup && !(model as DynamicGroupNodeModel).isCollapsed) {
      ;(model as DynamicGroupNodeModel).setTextPosition()
    }
  }

  onGraphRendered = ({ data }: CallbackArgs<'graph:rendered'>) => {
    // lf.render / graphDataToModel 不会逐节点触发 node:delete，需在整图重建时重置插件侧状态
    this.nodeGroupMap.clear()
    this.collapsedVirtualEdges.clear()
    this.collapsedRealEdgeToGroup.clear()
    this.activeGroups.clear()
    this.topGroupZIndex = DEFAULT_BOTTOM_Z_INDEX

    forEach(data.nodes, (node) => {
      if (node.children) {
        forEach(node.children, (childId) => {
          this.nodeGroupMap.set(childId, node.id)
        })
      }
    })

    // TODO: 确认一下下面方法的必要性及合理性
    // 初始化 nodes 时进行 this.topGroupZIndex 的校准更新
    this.calibrateTopGroupZIndex(data.nodes)
  }

  removeChildrenInGroupNodeData<
    T extends LogicFlow.NodeData | LogicFlow.NodeConfig,
  >(nodeData: T) {
    const newNodeData = cloneDeep(nodeData)
    delete newNodeData.children
    if (newNodeData.properties?.children) {
      delete newNodeData.properties.children
    }
    return newNodeData
  }

  /**
   * 创建一个 Group 类型节点内部所有子节点的副本
   * 并且在遍历所有 nodes 的过程中，顺便拿到所有 edges (只在 Group 范围的 edges)
   */
  initGroupChildNodes(
    nodeIdMap: Record<string, string>,
    children: Set<string>,
    curGroup: DynamicGroupNodeModel,
    distance: number,
  ): ElementsInfoInGroup {
    // Group 中所有子节点
    const allChildNodes: BaseNodeModel[] = []
    // 属于 Group 内部边的 EdgeData
    const edgesDataArr: EdgeData[] = []
    // 所有有关联的连线
    const allRelatedEdges: BaseEdgeModel[] = []

    forEach(Array.from(children), (childId: string) => {
      const childNode = this.lf.getNodeModelById(childId)
      if (childNode) {
        const childNodeChildren = childNode.children
        const childNodeData = childNode.getData()
        const eventType = EventType.NODE_GROUP_COPY || 'node:group-copy-add'

        const newNodeConfig = transformNodeData(
          this.removeChildrenInGroupNodeData(childNodeData),
          distance,
        )
        const tempChildNode = this.lf.addNode(newNodeConfig, eventType)
        curGroup.addChild(tempChildNode.id)

        nodeIdMap[childId] = tempChildNode.id // id 同 childId，做映射存储
        allChildNodes.push(tempChildNode)

        // 1. 存储 children 内部节点相关的输入边（incoming）
        allRelatedEdges.push(
          ...[...tempChildNode.incoming.edges, ...tempChildNode.outgoing.edges],
        )

        if (childNodeChildren instanceof Set) {
          const { childNodes, edgesData } = this.initGroupChildNodes(
            nodeIdMap,
            childNodeChildren,
            tempChildNode as DynamicGroupNodeModel,
            distance,
          )

          allChildNodes.push(...childNodes)
          edgesDataArr.push(...edgesData)
        }
      }
    })

    // 1. 判断每一条边的开始节点、目标节点是否在 Group 中
    const edgesInnerGroup = filter(allRelatedEdges, (edge) => {
      return (
        has(nodeIdMap, edge.sourceNodeId) && has(nodeIdMap, edge.targetNodeId)
      )
    })
    // 2. 为「每一条 Group 的内部边」构建出 EdgeData 数据，得到 EdgeConfig，生成新的线
    const edgesDataInnerGroup = map(edgesInnerGroup, (edge) => {
      return edge.getData()
    })

    return {
      childNodes: allChildNodes,
      edgesData: edgesDataArr.concat(edgesDataInnerGroup),
    }
  }

  /**
   * 根据参数 edge 选择是新建边还是基于已有边，复制一条边出来
   * @param edge
   * @param nodeIdMap
   * @param distance
   */
  createEdge(
    edge: EdgeConfig | EdgeData,
    nodeIdMap: Record<string, string>,
    distance: number,
  ) {
    const { sourceNodeId, targetNodeId } = edge
    const sourceId = nodeIdMap[sourceNodeId] ?? sourceNodeId
    const targetId = nodeIdMap[targetNodeId] ?? targetNodeId

    // 如果是有 id 且 text 是对象的边，需要重新计算位置，否则直接用 edgeConfig 生成边
    let newEdgeConfig = cloneDeep(edge)
    if (edge.id && typeof edge.text === 'object' && edge.text !== null) {
      newEdgeConfig = transformEdgeData(edge as EdgeData, distance)
    }

    return this.lf.graphModel.addEdge({
      ...newEdgeConfig,
      sourceNodeId: sourceId,
      targetNodeId: targetId,
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
    groupModel: DynamicGroupNodeModel,
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

  /**
   * Group 插件的初始化方法
   * TODO：1. 待讨论，可能之前插件分类是有意义的 components, material, tools
   * 区别是：1. 有些插件就是自定义节点，可能会有初始化方法 init，但不必要有 render （比如 Group）
   * 2. 有些插件是渲染一些部件（比如 MiniMap、Control、Menu 等）必须要有 render
   * 3. 工具类的，init 、 render
   * 该如何分类呢？并如何完善插件的类型
   *
   * TODO: 2. 插件的 destroy 方法该做些什么，是否应该加 destroy 方法
   * TODO: 3. 是否应该定义一个 Extension 的基类，所有插件基于这个基类来开发，这样在初始化的时候就可以确认执行什么方法
   */
  init() {
    const { lf } = this
    const { graphModel } = lf
    // 添加分组节点移动规则
    // 1. 移动分组节点时，同时移动分组内所有节点
    // 2. 移动子节点时，判断是否有限制规则（isRestrict）
    graphModel.addNodeMoveRules((model, deltaX, deltaY) => {
      // 判断如果是 group，移动时需要同时移动组内的所有节点
      if (model.isGroup) {
        // https://github.com/didi/LogicFlow/issues/1826
        // 这里不应该触发移动子节点的逻辑，这里是判断是否可以移动，而不是触发移动逻辑
        // 而且这里触发移动，会导致resize操作的this.x变动也会触发子item的this.x变动
        // resize时的deltaX跟正常移动的deltaX是不同的

        // const nodeIds = this.getNodesInGroup(model as DynamicGroupNodeModel)
        // graphModel.moveNodes(nodeIds, deltaX, deltaY, true)
        return true
      }

      const groupId = this.nodeGroupMap.get(model.id)!
      const groupModel = this.lf.getNodeModelById(
        groupId,
      ) as DynamicGroupNodeModel

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

    // 添加分组节点resize规则
    // 所有分组默认不可缩小到直接子节点占地面积以下
    graphModel.addNodeResizeRules((model, deltaX, deltaY, width, height) => {
      if (model.isGroup) {
        return this.checkGroupBoundsWithChildren(
          model as DynamicGroupNodeModel,
          deltaX,
          deltaY,
          width,
          height,
        )
      }
      return true
    })

    graphModel.dynamicGroup = this

    // cascadeDeleteChildren=false 时须在 core 删除「指向分组的边」之前释放成员，
    // 否则折叠虚拟边被删会连带删掉真实边（graphModel.deleteNode 先删边再 emit node:delete）
    this.originDeleteNode = lf.deleteNode.bind(lf)
    lf.deleteNode = (nodeId: string): boolean => {
      const nodeModel = lf.getNodeModelById(nodeId)
      if (!this.cascadeDeleteChildren && nodeModel?.isGroup) {
        const groupModel = nodeModel as DynamicGroupNodeModel
        if (groupModel.children.size > 0) {
          this.releaseGroupMembers(groupModel)
        }
      }
      return this.originDeleteNode!(nodeId)
    }

    lf.on(EventType.NODE_ADD, this.onNodeAdd)
    lf.on(EventType.NODE_DND_ADD, this.onNodeDndAdd)
    lf.on(EventType.NODE_DROP, this.onNodeDrop)
    lf.on(EventType.NODE_MOUSEUP, this.onNodeMouseUp)
    lf.on(EventType.SELECTION_DROP, this.onSelectionDrop)
    lf.on(EventType.NODE_DELETE, this.removeNodeFromGroup)
    lf.on(EventType.EDGE_DELETE, this.onEdgeDelete)
    lf.on(NODE_DRAG_EVENTS, this.onNodeDrag)
    lf.on(EventType.SELECTION_DRAG, this.onSelectionDrag)
    lf.on(EventType.NODE_CLICK, this.onNodeSelect)
    lf.on(EventType.NODE_MOUSEMOVE, this.onNodeMove)
    lf.on(EventType.NODE_RESIZE, this.onNodeResize)
    lf.on(EventType.GRAPH_RENDERED, this.onGraphRendered)

    lf.on(ExtensionEventType.GROUP_ADD_NODE, this.onGroupAddNode)

    // https://github.com/didi/LogicFlow/issues/1346
    // 重写 addElements() 方法，在 addElements() 原有基础上增加对 group 内部所有 nodes 和 edges 的复制功能
    // 使用场景：addElements api 项目内部目前只在快捷键粘贴时使用（此处解决的也应该是粘贴场景的问题）
    lf.addElements = (
      { nodes: selectedNodes, edges: selectedEdges }: GraphConfigData,
      distance = 40,
    ): GraphElements => {
      // oldNodeId -> newNodeId 映射 Map
      const nodeIdMap: Record<string, string> = {}
      // 本次添加的所有节点和边
      const elements: GraphElements = {
        nodes: [],
        edges: [],
      }
      // 所有属于分组内的边 -> sourceNodeId 和 targetNodeId 都在 Group 内
      const edgesInnerGroup: EdgeData[] = []

      forEach(selectedNodes, (node) => {
        const originId = node.id
        const children = node.properties?.children ?? node.children

        const model = lf.addNode(this.removeChildrenInGroupNodeData(node))

        if (originId) nodeIdMap[originId] = model.id
        elements.nodes.push(model) // 此时为 group 的 nodeModel

        // TODO: 递归创建 group 的 nodeModel 的 children
        if (model.isGroup) {
          const { edgesData } = this.initGroupChildNodes(
            nodeIdMap,
            children,
            model as DynamicGroupNodeModel,
            distance,
          )
          edgesInnerGroup.push(...edgesData)
        }
      })

      forEach(edgesInnerGroup, (edge) => {
        this.createEdge(edge, nodeIdMap, distance)
      })
      forEach(selectedEdges, (edge) => {
        elements.edges.push(this.createEdge(edge, nodeIdMap, distance))
      })

      // 返回 elements 进行选中效果，即触发 element.selectElementById()
      // shortcut.ts 也会对最外层的 nodes 和 edges 进行偏移，即 translationNodeData()
      return elements
    }

    this.render()
  }

  render() {}

  destroy() {
    // 销毁监听的事件，并移除渲染的 dom 内容
    this.lf.off(EventType.NODE_ADD, this.onNodeAdd)
    this.lf.off(EventType.NODE_DND_ADD, this.onNodeDndAdd)
    this.lf.off(EventType.NODE_DROP, this.onNodeDrop)
    this.lf.off(EventType.NODE_MOUSEUP, this.onNodeMouseUp)
    this.lf.off(EventType.SELECTION_DROP, this.onSelectionDrop)
    this.lf.off(EventType.NODE_DELETE, this.removeNodeFromGroup)
    this.lf.off(EventType.EDGE_DELETE, this.onEdgeDelete)
    this.lf.off(NODE_DRAG_EVENTS, this.onNodeDrag)
    this.lf.off(EventType.SELECTION_DRAG, this.onSelectionDrag)
    this.lf.off(EventType.NODE_CLICK, this.onNodeSelect)
    this.lf.off(EventType.NODE_MOUSEMOVE, this.onNodeMove)
    this.lf.off(EventType.NODE_RESIZE, this.onNodeResize)
    this.lf.off(EventType.GRAPH_RENDERED, this.onGraphRendered)
    this.lf.off(ExtensionEventType.GROUP_ADD_NODE, this.onGroupAddNode)

    // 还原 lf.addElements 方法？
    if (this.originDeleteNode) {
      this.lf.deleteNode = this.originDeleteNode
    }
    // 移除 graphModel 上重写的 addNodeMoveRules 方法？
    // TODO: 讨论一下插件该具体做些什么
  }
}

export namespace DynamicGroup {
  export type ElementsInfoInGroup = {
    childNodes: BaseNodeModel[] // 分组节点的所有子节点 model
    edgesData: EdgeData[] // 属于分组内的线的 EdgeData (即开始节点和结束节点都在 Group 内)
  }

  export type DynamicGroupOptions = Partial<{
    isCollapsed: boolean
    /** 为 true 时禁止手动将边连到/从分组节点；默认 false */
    disallowEdgeConnectToGroup: boolean
    /** 删除分组时是否级联删除成员；默认 true */
    cascadeDeleteChildren: boolean
    /** 拖拽节点进入分组时的感应外框样式 */
    sensorOutline: SensorOutlineOptions
  }>
}

export default DynamicGroup
