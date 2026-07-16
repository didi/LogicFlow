import type LogicFlow from '@logicflow/core'
import type { Scenario } from './types'
import { makeGroup, makeNode } from './customNodes'

export const SC_GROUP_ID = 'sc_group'
export const SC_CHILD_A = 'sc_child_a'
export const SC_CHILD_B = 'sc_child_b'
export const SC_EDGE_AB = 'sc_edge_ab'

/** 复制粘贴的位移步长，与 core keyboard 默认一致 */
export const SC_TRANSLATION = 40

export function buildSelectionCopyGraph(): LogicFlow.GraphConfigData {
  return {
    nodes: [
      makeGroup(SC_GROUP_ID, 400, 300, [SC_CHILD_A, SC_CHILD_B], {
        width: 360,
        height: 220,
        radius: 5,
      }),
      makeNode(SC_CHILD_A, 'rect', 320, 300, {
        properties: { width: 90, height: 50 },
      }),
      makeNode(SC_CHILD_B, 'rect', 500, 300, {
        properties: { width: 90, height: 50 },
      }),
    ],
    edges: [
      {
        id: SC_EDGE_AB,
        type: 'polyline',
        sourceNodeId: SC_CHILD_A,
        targetNodeId: SC_CHILD_B,
      },
    ],
  }
}

type AnyNodeData = Record<string, any>
type AnyEdgeData = Record<string, any>

/** 与 core keyboard/shortcut.ts 中 translateNodeData 行为一致 */
function translateNodeData(node: AnyNodeData, distance: number) {
  node.x += distance
  node.y += distance
  if (node.text && typeof node.text === 'object') {
    node.text.x += distance
    node.text.y += distance
  }
  return node
}

/** 与 core keyboard/shortcut.ts 中 translateEdgeData 行为一致 */
function translateEdgeData(edge: AnyEdgeData, distance: number) {
  if (edge.startPoint) {
    edge.startPoint.x += distance
    edge.startPoint.y += distance
  }
  if (edge.endPoint) {
    edge.endPoint.x += distance
    edge.endPoint.y += distance
  }
  if (Array.isArray(edge.pointsList)) {
    edge.pointsList.forEach((point: AnyNodeData) => {
      point.x += distance
      point.y += distance
    })
  }
  if (edge.text && typeof edge.text === 'object') {
    edge.text.x += distance
    edge.text.y += distance
  }
  return edge
}

export type Clipboard = LogicFlow.GraphData | null

/**
 * 复制当前选区：等价于按下 Cmd/Ctrl + C。
 * 返回可用于后续 paste 的剪贴板数据（已按一次步长位移）。
 */
export function copySelection(lf: LogicFlow): Clipboard {
  // isIgnoreCheck=false：仅复制两端都被选中的边，避免悬空边
  const selected = lf.getSelectElements(false)
  if (selected.nodes.length === 0 && selected.edges.length === 0) {
    return null
  }
  selected.nodes.forEach((node) => translateNodeData(node, SC_TRANSLATION))
  selected.edges.forEach((edge) => translateEdgeData(edge, SC_TRANSLATION))
  return selected
}

/**
 * 粘贴剪贴板内容：等价于按下 Cmd/Ctrl + V。
 * 返回本次新增的分组节点 id（若有），用于「拖动新分组」演示分离。
 */
export function pasteSelection(lf: LogicFlow, clipboard: Clipboard) {
  if (!clipboard) return { groupId: undefined as string | undefined }
  lf.clearSelectElements()
  const added = lf.addElements(clipboard, SC_TRANSLATION)
  added.nodes.forEach((node) => lf.selectElementById(node.id, true))
  added.edges.forEach((edge) => lf.selectElementById(edge.id!, true))
  // 为下一次粘贴继续位移，避免叠在一起
  clipboard.nodes.forEach((node) =>
    translateNodeData(node as AnyNodeData, SC_TRANSLATION),
  )
  clipboard.edges.forEach((edge) =>
    translateEdgeData(edge as AnyEdgeData, SC_TRANSLATION),
  )
  const newGroup = added.nodes.find(
    (node) => (node as { type?: string }).type === 'dynamic-group',
  )
  return { groupId: newGroup?.id }
}

export function selectAll(lf: LogicFlow) {
  lf.clearSelectElements()
  lf.graphModel.nodes.forEach((node) => lf.selectElementById(node.id, true))
  lf.graphModel.edges.forEach((edge) => lf.selectElementById(edge.id, true))
}

export type CopyPasteDiagnosis = {
  nodeCount: number
  edgeCount: number
  groupCount: number
  rectCount: number
  /** 位置完全重合的矩形分组数量（幽灵重复子节点的信号） */
  overlappingRectGroups: number
  /** 分组 children 是否都指向真实存在、且被边连接的子节点 */
  detachedGroups: {
    groupId: string
    children: string[]
    childrenExist: boolean
    childrenAreEdgeEndpoints: boolean
  }[]
  message: string
}

/**
 * 诊断粘贴结果：检测幽灵重复子节点与分组归属分离。
 */
export function diagnoseCopyPaste(lf: LogicFlow): CopyPasteDiagnosis {
  const graphModel = lf.graphModel
  const nodes = graphModel.nodes
  const edges = graphModel.edges

  const rects = nodes.filter((n) => (n.type as string) === 'rect')
  const groups = nodes.filter((n) => (n.type as string) === 'dynamic-group')

  // 位置重合的矩形分桶
  const posMap = new Map<string, number>()
  rects.forEach((r) => {
    const key = `${Math.round(r.x)},${Math.round(r.y)}`
    posMap.set(key, (posMap.get(key) ?? 0) + 1)
  })
  const overlappingRectGroups = [...posMap.values()].filter((c) => c > 1).length

  const edgeEndpointIds = new Set<string>()
  edges.forEach((e) => {
    edgeEndpointIds.add(e.sourceNodeId)
    edgeEndpointIds.add(e.targetNodeId)
  })

  const detachedGroups = groups.map((g) => {
    const children = [
      ...((g as unknown as { children: Set<string> }).children ?? []),
    ]
    const childrenExist = children.every((id) => !!lf.getNodeModelById(id))
    const childrenAreEdgeEndpoints =
      children.length === 0 || children.some((id) => edgeEndpointIds.has(id))
    return {
      groupId: g.id,
      children,
      childrenExist,
      childrenAreEdgeEndpoints,
    }
  })

  const hasDetached = detachedGroups.some(
    (d) => !d.childrenAreEdgeEndpoints && d.children.length > 0,
  )

  const message = [
    `节点总数: ${nodes.length}（分组 ${groups.length} / 矩形 ${rects.length}）`,
    `边总数: ${edges.length}`,
    `位置重合的矩形组: ${overlappingRectGroups}${
      overlappingRectGroups > 0 ? '  ← 存在幽灵重复子节点' : ''
    }`,
    ...detachedGroups.map(
      (d) =>
        `分组 ${d.groupId.slice(0, 8)} children=[${d.children
          .map((c) => c.slice(0, 8))
          .join(
            ', ',
          )}] 存在=${d.childrenExist} 被边连接=${d.childrenAreEdgeEndpoints}`,
    ),
    hasDetached || overlappingRectGroups > 0
      ? '结论: 复现分离 —— 分组拥有的子节点与被边连接的子节点不是同一批'
      : '结论: 未检测到分离',
  ].join('\n')

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    groupCount: groups.length,
    rectCount: rects.length,
    overlappingRectGroups,
    detachedGroups,
    message,
  }
}

export const selectionCopyPasteScenario: Scenario = {
  id: 'selection-copy-paste',
  title: '选区复制粘贴：连线与节点分离',
  issues: ['LOCAL-copy-paste'],
  expectedBug:
    '框选「分组 + 组内节点 + 连线」后复制粘贴，addElements 让分组重新生成一套幽灵子节点，粘贴出的连线连的却是另一套子节点；拖动新分组时连线和节点分离。',
  steps: [
    '1. 画布预置：分组 sc_group 含 sc_child_a、sc_child_b，两子节点间有一条连线。',
    '2. 点「开启框选」，在画布空白处拖拽框住整组（或直接点「全选」）。',
    '3. 点「复制选中」（等价 Cmd/Ctrl+C），再点「粘贴」（等价 Cmd/Ctrl+V）。',
    '4. 点「诊断」：粘贴应只新增 1 组 + 2 子节点 + 1 边；实际会多出 2 个重合的幽灵矩形。',
    '5. 点「拖动新分组」：新分组移开后，连线和它连接的子节点留在原地 —— 复现分离。',
    '6. 点「重置场景」可重复对比。',
  ],
  graphData: buildSelectionCopyGraph(),
}
