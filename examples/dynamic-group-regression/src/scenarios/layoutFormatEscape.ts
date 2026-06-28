import type LogicFlow from '@logicflow/core'
import type { ResizeGroupMode } from '@logicflow/layout'
import type { Scenario } from './types'
import { makeGroup, makeNode } from './customNodes'

export const LAYOUT_GROUP_ID = 'group_layout'

export type LayoutGraphConfig = {
  groupWidth: number
  groupHeight: number
  groupResizable: boolean
}

export const defaultLayoutGraphConfig: LayoutGraphConfig = {
  groupWidth: 640,
  groupHeight: 420,
  groupResizable: true,
}

/** 组内 3 节点 + 组外 3 节点，含跨组边与组外边 */
export function buildLayoutGraph(
  config: LayoutGraphConfig,
): LogicFlow.GraphConfigData {
  const { groupWidth, groupHeight, groupResizable } = config
  const innerIds = ['lay_a', 'lay_b', 'lay_c']
  const groupNode = makeGroup(
    LAYOUT_GROUP_ID,
    480,
    300,
    innerIds,
    {
      width: groupWidth,
      height: groupHeight,
    },
    'dynamic-group',
  )
  groupNode.resizable = groupResizable

  return {
    nodes: [
      groupNode,
      makeNode('lay_a', 'rect', 380, 240),
      makeNode('lay_b', 'rect', 480, 300),
      makeNode('lay_c', 'rect', 580, 360),
      makeNode('outer_start', 'circle', 120, 200),
      makeNode('outer_mid', 'rect', 160, 380),
      makeNode('outer_end', 'diamond', 780, 300),
    ],
    edges: [
      {
        id: 'e_inner_ab',
        type: 'polyline',
        sourceNodeId: 'lay_a',
        targetNodeId: 'lay_b',
      },
      {
        id: 'e_inner_bc',
        type: 'polyline',
        sourceNodeId: 'lay_b',
        targetNodeId: 'lay_c',
      },
      {
        id: 'e_outer_start_mid',
        type: 'polyline',
        sourceNodeId: 'outer_start',
        targetNodeId: 'outer_mid',
      },
      {
        id: 'e_cross_start_a',
        type: 'polyline',
        sourceNodeId: 'outer_start',
        targetNodeId: 'lay_a',
      },
      {
        id: 'e_cross_mid_b',
        type: 'polyline',
        sourceNodeId: 'outer_mid',
        targetNodeId: 'lay_b',
      },
      {
        id: 'e_cross_c_end',
        type: 'polyline',
        sourceNodeId: 'lay_c',
        targetNodeId: 'outer_end',
      },
    ],
  }
}

export type LayoutRunConfig = {
  engine: 'dagre' | 'elk'
  scope: 'all' | 'group'
  resizeGroup: ResizeGroupMode
  groupPadding: number
  rankdir: 'TB' | 'LR'
  ranksep: number
  nodesep: number
}

export const defaultLayoutRunConfig: LayoutRunConfig = {
  engine: 'dagre',
  scope: 'all',
  resizeGroup: false,
  groupPadding: 40,
  rankdir: 'TB',
  ranksep: 80,
  nodesep: 40,
}

export function runLayout(lf: LogicFlow, runConfig: LayoutRunConfig) {
  const layoutOption = {
    rankdir: runConfig.rankdir,
    ranksep: runConfig.ranksep,
    nodesep: runConfig.nodesep,
    resizeGroup: runConfig.resizeGroup,
    groupPadding: runConfig.groupPadding,
    ...(runConfig.scope === 'group' ? { groupId: LAYOUT_GROUP_ID } : {}),
  }

  if (runConfig.engine === 'dagre') {
    const dagre = (lf.extension as { dagre?: { layout: (o: object) => void } })
      .dagre
    if (!dagre) {
      alert('当前未启用 Dagre 插件（#2205）')
      return
    }
    dagre.layout(layoutOption)
  } else {
    const elk = (
      lf.extension as { elkLayout?: { layout: (o: object) => void } }
    ).elkLayout
    if (!elk) {
      alert('当前未启用 ElkLayout 插件（#2332）')
      return
    }
    elk.layout(layoutOption)
  }
  lf.fitView()
}

export function logLayoutMembership(lf: LogicFlow) {
  const group = lf.getNodeDataById(LAYOUT_GROUP_ID)
  const dg = lf.graphModel.dynamicGroup as {
    nodeGroupMap: Map<string, string>
    getGroupByNodeId: (id: string) => { id: string } | undefined
  }
  const innerIds = ['lay_a', 'lay_b', 'lay_c']
  const outerIds = ['outer_start', 'outer_mid', 'outer_end']
  const lines = [
    `group children: ${JSON.stringify(group?.children ?? group?.properties?.children)}`,
    `group size: ${group?.properties?.width ?? '?'} × ${group?.properties?.height ?? '?'}`,
    `group resizable: ${group?.resizable ?? '?'}`,
    '',
    '组内节点归属:',
    ...innerIds.map(
      (id) =>
        `  ${id} → ${dg.getGroupByNodeId(id)?.id ?? dg.nodeGroupMap.get(id) ?? '无'}`,
    ),
    '',
    '组外节点归属:',
    ...outerIds.map(
      (id) =>
        `  ${id} → ${dg.getGroupByNodeId(id)?.id ?? dg.nodeGroupMap.get(id) ?? '无（预期）'}`,
    ),
  ]
  alert(lines.join('\n'))
}

export const layoutFormatEscapeScenario: Scenario = {
  id: 'layout-format-escape',
  title: '布局后子节点逃出分组',
  issues: ['#2205', '#2332'],
  fixedIssues: ['#2205', '#2332'],
  expectedBug:
    '自动布局后组内节点脱离 children 或画出组框；Dagre（#2205）与 ELK（#2332）均需验证全图/组内两种范围。',
  steps: [
    '1. 在下方调整分组 resizable、宽高，以及布局引擎/范围/resizeGroup 等参数。',
    '2. 点击「应用配置」重建场景（组内 A/B/C，组外起/中/终，含跨组边）。',
    '3. 点击「执行布局」：Dagre 对应 #2205，ELK 对应 #2332。',
    '4. 分别测试「全图布局」与「仅组内布局」；观察组内节点是否仍在 children 且视觉上在组框内。',
    '5. 可选开启 resizeGroup（grow-only / fit），观察分组尺寸与 resizable 的交互。',
    '6. 点击「打印归属」核对 children 与 nodeGroupMap。',
  ],
  graphData: buildLayoutGraph(defaultLayoutGraphConfig),
}
