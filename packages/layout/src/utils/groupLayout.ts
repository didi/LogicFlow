import LogicFlow, { BaseNodeModel, BaseEdgeModel } from '@logicflow/core'

import NodeConfig = LogicFlow.NodeConfig

export type ResizeGroupMode = false | 'grow-only' | 'fit'
export type LayoutEdge = Pick<
  BaseEdgeModel,
  'id' | 'sourceNodeId' | 'targetNodeId'
>

export type LayoutScope = {
  groupId?: string
  nodes: BaseNodeModel[]
  edges: LayoutEdge[]
}

type GroupLayoutWarningCategory = 'overflow' | 'resized' | 'overrideResizable'

export type GroupLayoutWarningState = Set<string>

export interface GroupLayoutOption {
  /**
   * 不传：布局全图；传入后仅布局 group 内部节点。
   */
  groupId?: string
  /**
   * 分组尺寸调整策略：
   * false：不调整（默认）；
   * grow-only：只扩不缩；
   * fit：按子节点包围盒贴合（可扩可缩）。
   */
  resizeGroup?: ResizeGroupMode
  /**
   * 分组越界检测与尺寸调整时的内边距。
   */
  groupPadding?: number
}

type BoxBounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export function getNodeSize(
  nodeData: NodeConfig,
  modelMap: Map<string, BaseNodeModel>,
): { width: number; height: number } {
  const model = nodeData.id ? modelMap.get(nodeData.id) : undefined
  const width =
    nodeData.width ??
    (nodeData.properties?.width as number | undefined) ??
    model?.width ??
    150
  const height =
    nodeData.height ??
    (nodeData.properties?.height as number | undefined) ??
    model?.height ??
    50
  return { width, height }
}

function getNodeBounds(
  nodeData: NodeConfig,
  modelMap: Map<string, BaseNodeModel>,
): BoxBounds {
  const { width, height } = getNodeSize(nodeData, modelMap)
  return {
    minX: nodeData.x - width / 2,
    minY: nodeData.y - height / 2,
    maxX: nodeData.x + width / 2,
    maxY: nodeData.y + height / 2,
  }
}

function setNodeSize(nodeData: NodeConfig, width: number, height: number) {
  nodeData.width = width
  nodeData.height = height
  nodeData.properties = {
    ...(nodeData.properties ?? {}),
    width,
    height,
  }
}

export function isGroupModel(model: BaseNodeModel) {
  return !!(model as BaseNodeModel & { isGroup?: boolean }).isGroup
}

export function getGroupChildren(model: BaseNodeModel): string[] {
  const children = (model as BaseNodeModel & { children?: Set<string> })
    .children
  return children ? Array.from(children) : []
}

function createNodeMap(nodes: NodeConfig[]) {
  const map = new Map<string, NodeConfig>()
  nodes.forEach((node) => {
    if (node.id) {
      map.set(node.id, node)
    }
  })
  return map
}

function createModelMap(models: BaseNodeModel[]) {
  const map = new Map<string, BaseNodeModel>()
  models.forEach((model) => map.set(model.id, model))
  return map
}

function computeBounds(
  nodes: NodeConfig[],
  modelMap: Map<string, BaseNodeModel>,
) {
  if (nodes.length === 0) return undefined
  let bounds = getNodeBounds(nodes[0], modelMap)
  for (let i = 1; i < nodes.length; i++) {
    const current = getNodeBounds(nodes[i], modelMap)
    bounds = {
      minX: Math.min(bounds.minX, current.minX),
      minY: Math.min(bounds.minY, current.minY),
      maxX: Math.max(bounds.maxX, current.maxX),
      maxY: Math.max(bounds.maxY, current.maxY),
    }
  }
  return bounds
}

function toRect(bounds: BoxBounds) {
  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  return {
    x: bounds.minX + width / 2,
    y: bounds.minY + height / 2,
    width,
    height,
    bounds,
  }
}

export function moveNodeBy(nodeData: NodeConfig, dx: number, dy: number) {
  nodeData.x += dx
  nodeData.y += dy
  if (
    typeof nodeData.text === 'object' &&
    typeof nodeData.text.x === 'number' &&
    typeof nodeData.text.y === 'number'
  ) {
    nodeData.text.x += dx
    nodeData.text.y += dy
  }
}

function createParentMap(groups: BaseNodeModel[]) {
  const parentMap = new Map<string, string>()
  groups.forEach((group) => {
    getGroupChildren(group).forEach((childId) => {
      parentMap.set(childId, group.id)
    })
  })
  return parentMap
}

function resolveEndpointInScope(
  nodeId: string,
  scopeNodeIds: Set<string>,
  parentMap: Map<string, string>,
) {
  let current = nodeId
  if (scopeNodeIds.has(current)) return current

  while (parentMap.has(current)) {
    current = parentMap.get(current)!
    if (scopeNodeIds.has(current)) return current
  }

  return undefined
}

function projectEdgesToScope(
  edges: BaseEdgeModel[],
  scopeNodeIds: Set<string>,
  parentMap: Map<string, string>,
): LayoutEdge[] {
  return edges
    .map((edge) => {
      const sourceNodeId = resolveEndpointInScope(
        edge.sourceNodeId,
        scopeNodeIds,
        parentMap,
      )
      const targetNodeId = resolveEndpointInScope(
        edge.targetNodeId,
        scopeNodeIds,
        parentMap,
      )
      if (!sourceNodeId || !targetNodeId || sourceNodeId === targetNodeId) {
        return undefined
      }
      return {
        id: edge.id,
        sourceNodeId,
        targetNodeId,
      }
    })
    .filter((edge): edge is LayoutEdge => !!edge)
}

function hasOverflow(current: BoxBounds, expected: BoxBounds) {
  return (
    expected.minX < current.minX ||
    expected.minY < current.minY ||
    expected.maxX > current.maxX ||
    expected.maxY > current.maxY
  )
}

export function createGroupLayoutWarningState(): GroupLayoutWarningState {
  return new Set()
}

function warnOnce(
  warningState: GroupLayoutWarningState,
  groupId: string,
  category: GroupLayoutWarningCategory,
  message: string,
) {
  const key = `${groupId}:${category}`
  if (warningState.has(key)) return
  warningState.add(key)
  console.warn(message)
}

function sortGroupsByDepthDesc(groups: BaseNodeModel[]) {
  const groupMap = new Map<string, BaseNodeModel>()
  groups.forEach((group) => groupMap.set(group.id, group))

  const depthMemo = new Map<string, number>()
  const calcDepth = (group: BaseNodeModel): number => {
    const cached = depthMemo.get(group.id)
    if (cached !== undefined) return cached
    const children = getGroupChildren(group)
    let depth = 0
    children.forEach((childId) => {
      const childGroup = groupMap.get(childId)
      if (childGroup) {
        depth = Math.max(depth, calcDepth(childGroup) + 1)
      }
    })
    depthMemo.set(group.id, depth)
    return depth
  }

  return [...groups].sort((a, b) => calcDepth(b) - calcDepth(a))
}

export function resolveLayoutScope(
  allNodes: BaseNodeModel[],
  allEdges: BaseEdgeModel[],
  groupId?: string,
): { nodes: BaseNodeModel[]; edges: BaseEdgeModel[] } {
  if (!groupId) {
    return {
      nodes: allNodes,
      edges: allEdges,
    }
  }

  const group = allNodes.find((node) => node.id === groupId)
  if (!group || !isGroupModel(group)) {
    return { nodes: [], edges: [] }
  }

  const children = new Set(getGroupChildren(group))
  const nodes = allNodes.filter((node) => children.has(node.id))
  const edges = allEdges.filter(
    (edge) =>
      children.has(edge.sourceNodeId) && children.has(edge.targetNodeId),
  )
  return { nodes, edges }
}

export function resolveLayoutScopes(
  allNodes: BaseNodeModel[],
  allEdges: BaseEdgeModel[],
  groupId?: string,
): LayoutScope[] {
  if (groupId) {
    const scope = resolveLayoutScope(allNodes, allEdges, groupId)
    return scope.nodes.length > 0 ? [{ ...scope, groupId }] : []
  }

  const groupModels = allNodes.filter((node) => isGroupModel(node))
  if (groupModels.length === 0) {
    return [{ nodes: allNodes, edges: allEdges }]
  }

  const nodeMap = new Map(allNodes.map((node) => [node.id, node]))
  const parentMap = createParentMap(groupModels)
  const orderedGroups = sortGroupsByDepthDesc(groupModels)

  const groupScopes: LayoutScope[] = orderedGroups
    .map((group) => {
      const nodes = getGroupChildren(group)
        .map((childId) => nodeMap.get(childId))
        .filter((item): item is BaseNodeModel => !!item)
      const scopeNodeIds = new Set(nodes.map((node) => node.id))
      return {
        groupId: group.id,
        nodes,
        edges: projectEdgesToScope(allEdges, scopeNodeIds, parentMap),
      }
    })
    .filter((scope) => scope.nodes.length > 0)

  const rootNodes = allNodes.filter((node) => !parentMap.has(node.id))
  const rootNodeIds = new Set(rootNodes.map((node) => node.id))

  return [
    ...groupScopes,
    {
      nodes: rootNodes,
      edges: projectEdgesToScope(allEdges, rootNodeIds, parentMap),
    },
  ]
}

export function moveGroupDescendantsBy(
  allNodeModels: BaseNodeModel[],
  allNodeData: NodeConfig[],
  groupId: string,
  dx: number,
  dy: number,
) {
  if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return

  const modelMap = createModelMap(allNodeModels)
  const nodeMap = createNodeMap(allNodeData)
  const visited = new Set<string>()

  const moveDescendants = (currentGroupId: string) => {
    const groupModel = modelMap.get(currentGroupId)
    if (!groupModel) return

    getGroupChildren(groupModel).forEach((childId) => {
      if (visited.has(childId)) return
      visited.add(childId)

      const childData = nodeMap.get(childId)
      if (childData) {
        moveNodeBy(childData, dx, dy)
      }

      const childModel = modelMap.get(childId)
      if (childModel && isGroupModel(childModel)) {
        moveDescendants(childId)
      }
    })
  }

  moveDescendants(groupId)
}

export function alignScopedLayoutToGroup(
  allNodeModels: BaseNodeModel[],
  allNodeData: NodeConfig[],
  layoutNodes: BaseNodeModel[],
  groupId?: string,
) {
  if (!groupId || layoutNodes.length === 0) return

  const nodeMap = createNodeMap(allNodeData)
  const modelMap = createModelMap(allNodeModels)
  const groupData = nodeMap.get(groupId)
  if (!groupData) return

  const layoutNodeData = layoutNodes
    .map((node) => nodeMap.get(node.id))
    .filter((item): item is NodeConfig => !!item)
  const layoutBounds = computeBounds(layoutNodeData, modelMap)
  if (!layoutBounds) return

  const layoutRect = toRect(layoutBounds)
  const dx = groupData.x - layoutRect.x
  const dy = groupData.y - layoutRect.y
  if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return

  layoutNodeData.forEach((node) => moveNodeBy(node, dx, dy))
}

export function applyGroupResizeAndWarnings(
  allNodeModels: BaseNodeModel[],
  allNodeData: NodeConfig[],
  option: GroupLayoutOption,
  warningState: GroupLayoutWarningState = createGroupLayoutWarningState(),
) {
  const resizeMode: ResizeGroupMode = option.resizeGroup ?? false
  const groupPadding = option.groupPadding ?? 40
  const groupModels = allNodeModels.filter((node) => isGroupModel(node))
  if (groupModels.length === 0) return

  const nodeMap = createNodeMap(allNodeData)
  const modelMap = createModelMap(allNodeModels)
  const orderedGroups = sortGroupsByDepthDesc(groupModels)

  orderedGroups.forEach((groupModel) => {
    const groupData = nodeMap.get(groupModel.id)
    if (!groupData) return

    const childNodes = getGroupChildren(groupModel)
      .map((childId) => nodeMap.get(childId))
      .filter((item): item is NodeConfig => !!item)
    if (childNodes.length === 0) return

    const childBounds = computeBounds(childNodes, modelMap)
    if (!childBounds) return

    const requiredBounds: BoxBounds = {
      minX: childBounds.minX - groupPadding,
      minY: childBounds.minY - groupPadding,
      maxX: childBounds.maxX + groupPadding,
      maxY: childBounds.maxY + groupPadding,
    }

    const currentBounds = getNodeBounds(groupData, modelMap)
    const overflow = hasOverflow(currentBounds, requiredBounds)
    if (overflow) {
      warnOnce(
        warningState,
        groupModel.id,
        'overflow',
        `[LogicFlow Layout] 节点超出group边界: ${groupModel.id}`,
      )
    }

    if (resizeMode === false) return

    const targetBounds: BoxBounds =
      resizeMode === 'grow-only'
        ? {
            minX: Math.min(currentBounds.minX, requiredBounds.minX),
            minY: Math.min(currentBounds.minY, requiredBounds.minY),
            maxX: Math.max(currentBounds.maxX, requiredBounds.maxX),
            maxY: Math.max(currentBounds.maxY, requiredBounds.maxY),
          }
        : requiredBounds
    const targetRect = toRect(targetBounds)

    const currentRect = toRect(currentBounds)
    const changed =
      Math.abs(targetRect.width - currentRect.width) > 0.1 ||
      Math.abs(targetRect.height - currentRect.height) > 0.1 ||
      Math.abs(targetRect.x - currentRect.x) > 0.1 ||
      Math.abs(targetRect.y - currentRect.y) > 0.1
    if (!changed) return

    if (groupModel.resizable === false) {
      warnOnce(
        warningState,
        groupModel.id,
        'overrideResizable',
        `[LogicFlow Layout] resizeGroup 覆盖了 group.resizable=false: ${groupModel.id}`,
      )
    }

    groupData.x = targetRect.x
    groupData.y = targetRect.y
    setNodeSize(groupData, targetRect.width, targetRect.height)

    warnOnce(
      warningState,
      groupModel.id,
      'resized',
      `[LogicFlow Layout] 调整了group尺寸: ${groupModel.id}`,
    )
  })
}
