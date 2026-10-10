import LogicFlow, {
  BaseEdgeModel,
  BaseNodeModel,
  EventType,
  createUuid,
  transformEdgeData,
  transformNodeData,
} from '@logicflow/core'
import { cloneDeep, filter, forEach, has, map } from 'lodash-es'
import { LaneModel, mapLaneChildRelativePositions } from './LaneModel'
import type { LaneChildRelativePositions } from './LaneModel'
import { PoolModel } from './PoolModel'
import { poolConfig } from './constant'

import GraphConfigData = LogicFlow.GraphConfigData
import GraphElements = LogicFlow.GraphElements
import EdgeConfig = LogicFlow.EdgeConfig
import EdgeData = LogicFlow.EdgeData

/**
 * PoolElements 对 lf.addElements 的复制/粘贴实现。
 *
 * 这里把“普通 group 复制”和“Lane/Pool 语义复制”放在同一个入口处理：
 * - 复制 Lane 时，优先粘贴进当前唯一选中的目标 Pool；
 * - 没有唯一目标 Pool 时，空白粘贴自动创建一个只包含复制 Lane 的新 Pool；
 * - 内部子节点和边会重新建立 id 映射，避免复用旧路径造成线断开或 title 偏移。
 */

type ElementsInfoInGroup = {
  childNodes: BaseNodeModel[]
  edgesData: EdgeData[]
}

type PasteContext = {
  /** 源节点 id 到复制后节点 id 的映射，后续用于重建内部边。 */
  nodeIdMap: Record<string, string>
  /** addElements 最终返回给快捷键选中/偏移逻辑的元素集合。 */
  elements: GraphElements
  /** 复制 group/lane 子树时收集到的内部边，等 nodeIdMap 完整后再统一创建。 */
  edgesInnerGroup: EdgeData[]
  /** 一次空白粘贴多个 Lane 时复用同一个新 Pool，避免每个 Lane 建一个 Pool。 */
  blankPasteTargetPool?: PoolModel
  /** 复制 Lane 后，子节点要按源 Lane 相对位置恢复，不能完全依赖整体 distance 平移。 */
  copiedLaneChildOffsets: Record<string, LaneChildRelativePositions>
  copiedLanes: LaneModel[]
}

export type PoolPasteContext = {
  /** 由 PoolElements 注入宿主能力，paste.ts 不直接依赖插件实例。 */
  lf: LogicFlow
  nodeLaneMap: Map<string, string>
  resolvePoolById(poolId?: unknown): PoolModel | undefined
  getAncestorContainersByNodeId(nodeId: string): Array<PoolModel | LaneModel>
  getRootContainerNodes(nodes: BaseNodeModel[]): BaseNodeModel[]
}

/**
 * 移除节点数据中的 children 字段。
 *
 * addNode 只负责创建当前节点；children 由 initGroupChildNodes 递归复制，避免父子重复创建。
 *
 * @param nodeData 当前节点配置或序列化数据。
 * @returns 移除容器字段后的节点数据副本。
 */
function removeChildrenInGroupNodeData<
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
 * 从选中节点向上解析其所属 Pool。
 *
 * 选中 Pool、Lane 或 Lane 内普通节点时，都可以向上解析到目标 Pool。
 *
 * @param pasteContext 粘贴所需的宿主上下文。
 * @param nodeId 当前选中节点 id。
 * @returns 节点所属的 Pool；无法解析时返回 undefined。
 */
function resolveNodePool(
  pasteContext: PoolPasteContext,
  nodeId: string,
): PoolModel | undefined {
  const node = pasteContext.lf.getNodeModelById(nodeId) as
    | PoolModel
    | LaneModel
    | undefined
  if (String(node?.type) === 'pool') return node as PoolModel

  return pasteContext
    .getAncestorContainersByNodeId(nodeId)
    .find((ancestor) => String(ancestor.type) === 'pool') as
    | PoolModel
    | undefined
}

/**
 * 根据当前选中态解析 Lane 粘贴目标 Pool。
 *
 * 只有当前选中态能唯一归属到一个 Pool 时，Lane 才粘贴进该 Pool；多 Pool/无 Pool 走空白粘贴。
 *
 * @param pasteContext 粘贴所需的宿主上下文。
 * @returns 当前唯一的粘贴目标 Pool；无唯一目标时返回 undefined。
 */
function resolvePasteTargetPool(
  pasteContext: PoolPasteContext,
): PoolModel | undefined {
  const { nodes } = pasteContext.lf.graphModel.getSelectElements()
  const poolIds = new Set<string>()

  nodes.forEach((node) => {
    const pool = resolveNodePool(pasteContext, node.id)
    if (pool) poolIds.add(pool.id)
  })

  if (poolIds.size !== 1) return undefined
  return pasteContext.lf.getNodeModelById(Array.from(poolIds)[0]) as
    | PoolModel
    | undefined
}

/**
 * 为空白粘贴 Lane 创建目标 Pool。
 *
 * 新 Pool 会按源 Pool 的方向、标题位置和 Lane 展开尺寸推导尺寸。
 *
 * @param pasteContext 粘贴所需的宿主上下文。
 * @param node 源 Lane 数据。
 * @param laneId 即将创建的 Lane id，用于建立 Pool children。
 * @param laneWidth 新 Lane 的展开宽度。
 * @param laneHeight 新 Lane 的展开高度。
 * @param distance 粘贴操作相对源节点的偏移量。
 * @returns 新创建的 Pool 模型。
 */
function createPasteTargetPool(
  pasteContext: PoolPasteContext,
  node: LogicFlow.NodeData | LogicFlow.NodeConfig,
  laneId: string,
  laneWidth: number,
  laneHeight: number,
  distance: number,
): PoolModel {
  const sourcePool = pasteContext.resolvePoolById(node.properties?.parent)
  const direction =
    sourcePool?.properties?.direction ??
    node.properties?.direction ??
    'horizontal'
  const titlePosition =
    sourcePool?.properties?.titlePosition ??
    (direction === 'vertical' ? 'top' : 'left')
  const titleOnSide = titlePosition === 'left' || titlePosition === 'right'
  const titleOnTopOrBottom =
    titlePosition === 'top' || titlePosition === 'bottom'
  const width = laneWidth + (titleOnSide ? poolConfig.titleSize : 0)
  const height = laneHeight + (titleOnTopOrBottom ? poolConfig.titleSize : 0)
  let x = Number(node.x ?? 0) + distance
  let y = Number(node.y ?? 0) + distance

  if (titlePosition === 'left') x -= poolConfig.titleSize / 2
  if (titlePosition === 'right') x += poolConfig.titleSize / 2
  if (titlePosition === 'top') y -= poolConfig.titleSize / 2
  if (titlePosition === 'bottom') y += poolConfig.titleSize / 2

  return pasteContext.lf.addNode({
    type: 'pool',
    x,
    y,
    text: sourcePool?.text?.value ?? '新泳池',
    children: [laneId],
    properties: {
      direction,
      titlePosition,
      laneConfig: sourcePool?.properties?.laneConfig,
      width,
      height,
      children: [laneId],
    },
    zIndex: sourcePool?.zIndex,
  }) as PoolModel
}

/**
 * 递归复制当前 group/lane 的所有子节点，并收集子树内部边。
 *
 * @param pasteContext 粘贴所需的宿主上下文。
 * @param nodeIdMap 源节点 id 到复制节点 id 的映射表。
 * @param children 当前容器的子节点 id 集合。
 * @param curGroup 当前复制出的容器模型。
 * @param distance 粘贴偏移量。
 * @returns 复制出的子节点和待重建的内部边。
 */
function initGroupChildNodes(
  pasteContext: PoolPasteContext,
  nodeIdMap: Record<string, string>,
  children: Set<string>,
  curGroup: LaneModel,
  distance: number,
): ElementsInfoInGroup {
  const allChildNodes: BaseNodeModel[] = []
  const edgesDataArr: EdgeData[] = []
  const allRelatedEdges: BaseEdgeModel[] = []

  forEach(Array.from(children), (childId: string) => {
    const childNode = pasteContext.lf.getNodeModelById(childId)
    if (childNode) {
      const childNodeChildren = childNode.children
      const childNodeData = childNode.getData()
      const eventType = EventType.NODE_GROUP_COPY || 'node:group-copy-add'

      const newNodeConfig = transformNodeData(
        removeChildrenInGroupNodeData(childNodeData),
        distance,
      )
      const tempChildNode = pasteContext.lf.addNode(newNodeConfig, eventType)
      curGroup.addChild(tempChildNode.id)
      tempChildNode.setProperties({
        ...tempChildNode.properties,
        parent: curGroup.id,
      })

      nodeIdMap[childId] = tempChildNode.id
      allChildNodes.push(tempChildNode)

      // 内部边要从原始子节点收集，再通过 nodeIdMap 重建到复制出来的子节点。
      allRelatedEdges.push(
        ...[...childNode.incoming.edges, ...childNode.outgoing.edges],
      )

      if (childNodeChildren instanceof Set) {
        const { childNodes, edgesData } = initGroupChildNodes(
          pasteContext,
          nodeIdMap,
          childNodeChildren,
          tempChildNode as LaneModel,
          distance,
        )

        allChildNodes.push(...childNodes)
        edgesDataArr.push(...edgesData)
      }
    }
  })

  const edgesInnerGroup = filter(allRelatedEdges, (edge, index) => {
    return (
      allRelatedEdges.findIndex((item) => item.id === edge.id) === index &&
      has(nodeIdMap, edge.sourceNodeId) &&
      has(nodeIdMap, edge.targetNodeId)
    )
  })
  const edgesDataInnerGroup = map(edgesInnerGroup, (edge) => {
    return edge.getData()
  })
  curGroup.setProperties({
    ...curGroup.properties,
    children: Array.from(curGroup.children),
  })

  return {
    childNodes: allChildNodes,
    edgesData: edgesDataArr.concat(edgesDataInnerGroup),
  }
}

/**
 * 根据 nodeIdMap 创建复制后的边。
 *
 * 内部边会替换为新节点 id；连接选区外节点的边只按快捷键粘贴距离平移。
 *
 * @param pasteContext 粘贴所需的宿主上下文。
 * @param edge 源边数据。
 * @param nodeIdMap 源节点 id 到复制节点 id 的映射表。
 * @param distance 粘贴偏移量。
 * @returns 新创建的边模型。
 */
function createEdge(
  pasteContext: PoolPasteContext,
  edge: EdgeConfig | EdgeData,
  nodeIdMap: Record<string, string>,
  distance: number,
) {
  const { sourceNodeId, targetNodeId } = edge
  const sourceId = nodeIdMap[sourceNodeId] ?? sourceNodeId
  const targetId = nodeIdMap[targetNodeId] ?? targetNodeId
  const isCopiedInternalEdge =
    has(nodeIdMap, sourceNodeId) && has(nodeIdMap, targetNodeId)

  // 复制出来的内部边会连接到重新布局后的子节点，旧路径点不能再平移复用。
  let newEdgeConfig = cloneDeep(edge)
  if (isCopiedInternalEdge) {
    // 内部边连接到新子节点后，旧路径/锚点已经不可信，交给图模型按新端点重新计算。
    const edgeConfig = newEdgeConfig as any
    const { text } = edgeConfig
    delete edgeConfig.startPoint
    delete edgeConfig.endPoint
    delete edgeConfig.pointsList
    delete edgeConfig.points
    delete edgeConfig.sourceAnchorId
    delete edgeConfig.targetAnchorId
    newEdgeConfig = {
      ...edgeConfig,
      id: '',
      text:
        typeof text === 'object' && text !== null
          ? {
              value: text.value,
              draggable: text.draggable,
              editable: text.editable,
            }
          : text,
    }
  } else if (edge.id && typeof edge.text === 'object' && edge.text !== null) {
    newEdgeConfig = transformEdgeData(edge as EdgeData, distance)
  }

  const edgeModel = pasteContext.lf.graphModel.addEdge({
    ...newEdgeConfig,
    sourceNodeId: sourceId,
    targetNodeId: targetId,
  })
  if (isCopiedInternalEdge) {
    edgeModel.resetTextPosition()
  }
  return edgeModel
}

/**
 * 复制 Lane 节点及其子树。
 *
 * Lane 是 Pool 的结构子节点：复制 Lane 时需要先确定目标 Pool，再创建 Lane 和其子树。
 *
 * @param pasteContext 粘贴所需的宿主上下文。
 * @param node 源 Lane 数据。
 * @param children 源 Lane 的子节点集合。
 * @param distance 粘贴偏移量。
 * @param context 本次 addElements 的复制上下文。
 */
function pasteLaneNode(
  pasteContext: PoolPasteContext,
  node: LogicFlow.NodeData | LogicFlow.NodeConfig,
  children: Set<string>,
  distance: number,
  context: PasteContext,
) {
  const { nodeIdMap, elements, edgesInnerGroup } = context
  const originId = node.id
  const sourceLane = originId
    ? (pasteContext.lf.getNodeModelById(originId) as LaneModel)
    : undefined
  const sourceChildOffsets =
    sourceLane?.captureChildrenRelativePositions() ?? {}
  const laneWidth = sourceLane?.expandWidth ?? (node as any).width
  const laneHeight = sourceLane?.expandHeight ?? (node as any).height
  const selectedTargetPool = resolvePasteTargetPool(pasteContext)
  // 没有选中目标 Pool 时，提前生成 laneId 让新 Pool 的 children 能直接指向它。
  const generatedLaneId = selectedTargetPool ? undefined : createUuid()
  const targetPool =
    selectedTargetPool ??
    context.blankPasteTargetPool ??
    createPasteTargetPool(
      pasteContext,
      node,
      generatedLaneId!,
      laneWidth,
      laneHeight,
      distance,
    )
  context.blankPasteTargetPool = selectedTargetPool
    ? context.blankPasteTargetPool
    : targetPool

  // 多个 lane 按剪贴板顺序连续追加到当前目标泳池。
  const insertIndex = targetPool.getOrderedLanes().length
  const laneProperties: Record<string, unknown> = {
    ...node.properties,
    parent: targetPool.id,
    direction: targetPool.properties?.direction,
    isHorizontal: targetPool.isHorizontal,
    isCollapsed: false,
  }
  // 副本不继承折叠态的运行时尺寸，使用源泳道记录的展开尺寸。
  delete laneProperties.width
  delete laneProperties.height
  delete laneProperties.collapsedWidth
  delete laneProperties.collapsedHeight

  const model = pasteContext.lf.addNode(
    removeChildrenInGroupNodeData({
      ...node,
      id: generatedLaneId,
      x: selectedTargetPool ? node.x : Number(node.x ?? 0) + distance,
      y: selectedTargetPool ? node.y : Number(node.y ?? 0) + distance,
      width: laneWidth,
      height: laneHeight,
      properties: laneProperties,
    }),
  )
  if (originId) nodeIdMap[originId] = model.id
  if (!selectedTargetPool && !elements.nodes.includes(targetPool)) {
    elements.nodes.push(targetPool)
  }
  elements.nodes.push(model)

  const laneIds = targetPool.getOrderedLanes().map((lane: any) => lane.id)
  const ids = laneIds.filter((id: string) => id !== model.id)
  ids.splice(Math.max(0, Math.min(insertIndex, ids.length)), 0, model.id)
  targetPool.setLaneOrder(ids)
  pasteContext.nodeLaneMap.set(model.id, targetPool.id)

  const { edgesData } = initGroupChildNodes(
    pasteContext,
    nodeIdMap,
    children,
    model as LaneModel,
    distance,
  )
  edgesInnerGroup.push(...edgesData)
  context.copiedLanes.push(model as LaneModel)
  context.copiedLaneChildOffsets[model.id] = mapLaneChildRelativePositions(
    sourceChildOffsets,
    nodeIdMap,
  )
  targetPool.layoutLanesByOrder({ reason: 'add' })
}

/**
 * 复制普通节点、Pool 或非 Lane 的 group 节点。
 *
 * @param pasteContext 粘贴所需的宿主上下文。
 * @param node 源节点数据。
 * @param children 源容器的子节点集合。
 * @param distance 粘贴偏移量。
 * @param context 本次 addElements 的复制上下文。
 */
function pasteCommonNode(
  pasteContext: PoolPasteContext,
  node: LogicFlow.NodeData | LogicFlow.NodeConfig,
  children: Set<string>,
  distance: number,
  context: PasteContext,
) {
  const originId = node.id
  const model = pasteContext.lf.addNode(removeChildrenInGroupNodeData(node))

  if (originId) context.nodeIdMap[originId] = model.id
  context.elements.nodes.push(model)

  if (model.isGroup) {
    const { edgesData } = initGroupChildNodes(
      pasteContext,
      context.nodeIdMap,
      children,
      model as LaneModel,
      distance,
    )
    context.edgesInnerGroup.push(...edgesData)
    if (String(model.type) === 'lane') {
      context.copiedLanes.push(model as LaneModel)
      context.copiedLaneChildOffsets[model.id] = (
        model as LaneModel
      ).captureChildrenRelativePositions()
    }
  }
}

/**
 * 创建 PoolElements 的 addElements 覆盖实现。
 *
 * 快捷键粘贴和外部 API 都会进入该入口，最终返回值会被 core 用于选中和整体偏移。
 *
 * @param pasteContext PoolElements 提供的粘贴宿主上下文。
 * @returns 可直接赋值给 lf.addElements 的函数。
 */
export function createPoolAddElements(
  pasteContext: PoolPasteContext,
): LogicFlow['addElements'] {
  return (
    { nodes: selectedNodes, edges: selectedEdges }: GraphConfigData,
    distance = 40,
  ): GraphElements => {
    const pasteNodes = selectedNodes ?? []
    const pasteEdges = selectedEdges ?? []
    const context: PasteContext = {
      nodeIdMap: {},
      elements: {
        nodes: [],
        edges: [],
      },
      edgesInnerGroup: [],
      copiedLaneChildOffsets: {},
      copiedLanes: [],
    }
    const { nodeIdMap, elements, edgesInnerGroup } = context

    forEach(pasteNodes, (node) => {
      const children = node.properties?.children ?? node.children

      if (String(node.type) === 'lane') {
        pasteLaneNode(pasteContext, node, children, distance, context)
        return
      }

      pasteCommonNode(pasteContext, node, children, distance, context)
    })

    context.copiedLanes.forEach((lane) => {
      // Pool layout 可能先移动 Lane，最后再按源 Lane 的相对偏移修正子节点位置。
      lane.restoreChildrenRelativePositions(
        context.copiedLaneChildOffsets[lane.id] ?? {},
      )
    })

    forEach(edgesInnerGroup, (edge) => {
      createEdge(pasteContext, edge, nodeIdMap, distance)
    })
    forEach(pasteEdges, (edge) => {
      elements.edges.push(createEdge(pasteContext, edge, nodeIdMap, distance))
    })
    // 快捷键粘贴会选中 addElements 返回的 nodes。Pool 复制会真实创建
    // Pool/Lane/子节点，但选中态只暴露最外层容器，避免父子同时选中后拖拽重复位移。
    elements.nodes = pasteContext.getRootContainerNodes(elements.nodes)
    // 返回 elements 进行选中效果，即触发 element.selectElementById()
    // shortcut.ts 也会对最外层的 nodes 和 edges 进行偏移，即 translationNodeData()
    return elements
  }
}
