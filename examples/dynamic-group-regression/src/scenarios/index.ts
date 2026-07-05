import type LogicFlow from '@logicflow/core'
import type { Scenario } from './types'
import {
  baseGroupProps,
  makeGroup,
  makeNode,
  nodeText,
  registerLockedGroup,
} from './customNodes'
import LayoutFormatEscapeControls from '@/components/LayoutFormatEscapeControls'
import ResizeBoundsControls from '@/components/ResizeBoundsControls'
import TitleHeaderControls from '@/components/TitleHeaderControls'
import CascadeDeleteControls from '@/components/CascadeDeleteControls'
import { layoutFormatEscapeScenario } from './layoutFormatEscape'
import {
  resizeBoundsScenario,
  syncResizeBoundsMembership,
} from './resizeBounds'
import { titleHeaderScenario } from './titleHeader'

function toggleGroup(lf: LogicFlow, groupId: string, collapse?: boolean) {
  const model = lf.getNodeModelById(groupId) as {
    toggleCollapse?: (c?: boolean) => void
    isCollapsed?: boolean
  }
  if (!model?.toggleCollapse) return
  if (collapse === undefined) {
    model.toggleCollapse(!model.isCollapsed)
  } else {
    model.toggleCollapse(collapse)
  }
}

/** 模拟业务侧 JobInfoAPI.getJobCompose 返回的节点结构 */
type JobComposeNode = {
  id: string
  jobName: string
  nodeType: string
  nodePositionX: number
  nodePositionY: number
  properties: string
  children: string | null
}

function generateNode(node: JobComposeNode) {
  return {
    id: node.id,
    text: node.id,
    type: node.nodeType,
    x: node.nodePositionX,
    y: node.nodePositionY,
    properties: JSON.parse(node.properties) as Record<string, unknown>,
    children: node.children != null ? JSON.parse(node.children) : [],
  }
}

function generateEdge(edge: { fromNodeId: string; endNodeId: string }) {
  return {
    sourceNodeId: edge.fromNodeId,
    targetNodeId: edge.endNodeId,
    type: 'polyline',
  }
}

/** #2052：batch addNode + addChild 任务组落盘 */
const jobCompose2052 = {
  jobNode: {
    id: 'job_group',
    jobName: 'job_group',
    nodeType: 'dynamic-group',
    nodePositionX: 520,
    nodePositionY: 200,
    properties: JSON.stringify({
      width: 320,
      height: 200,
      collapsible: true,
      radius: 5,
    }),
    children: JSON.stringify(['job_child_1', 'job_child_2']),
  },
  nodes: [
    {
      id: 'job_child_1',
      jobName: 'job_child_1',
      nodeType: 'rect',
      nodePositionX: 520,
      nodePositionY: 200,
      properties: JSON.stringify({ width: 80, height: 50 }),
      children: null,
    },
    {
      id: 'job_child_2',
      jobName: 'job_child_2',
      nodeType: 'circle',
      nodePositionX: 580,
      nodePositionY: 180,
      properties: JSON.stringify({}),
      children: null,
    },
  ] satisfies JobComposeNode[],
  edges: [] as { fromNodeId: string; endNodeId: string }[],
}

function addJobGroup2052(lf: LogicFlow) {
  const placeholder = lf.getNodeModelById('job_placeholder')
  if (!placeholder) return

  const nodeInfo = {
    width: placeholder.width,
    height: placeholder.height,
    x: placeholder.x,
    y: placeholder.y,
  }

  const { jobNode, nodes: composeNodes, edges: composeEdges } = jobCompose2052
  const newNodes = [...composeNodes, jobNode]
  const graphModel = lf.graphModel

  newNodes.forEach((node) => {
    graphModel.addNode(generateNode(node))
  })

  newNodes.forEach((n) => {
    const node = lf.getNodeModelById(n.id) as
      | { addChild?: (id: string) => void }
      | undefined
    if (n.nodeType === 'dynamic-group' && node?.addChild && n.children) {
      ;(JSON.parse(n.children) as string[]).forEach((id) => {
        node.addChild!(id)
      })
    }
  })

  composeEdges.forEach((edge) => {
    graphModel.addEdge(generateEdge(edge))
  })

  const pNode = lf.getNodeModelById(jobNode.id)
  if (pNode) {
    graphModel.moveNode2Coordinate(
      jobNode.id,
      nodeInfo.x - nodeInfo.width / 2 + pNode.width / 2,
      nodeInfo.y - nodeInfo.height / 2 + pNode.height / 2,
    )
  }

  graphModel.deleteNode(placeholder.id)
}

function logGroupMembership2052(lf: LogicFlow) {
  const dg = lf.graphModel.dynamicGroup as {
    nodeGroupMap: Map<string, string>
  }
  const groupA = lf.getNodeModelById('group_a') as
    | { children: Set<string> }
    | undefined
  const jobGroup = lf.getNodeModelById('job_group') as
    | { children: Set<string> }
    | undefined
  const entries = [...dg.nodeGroupMap.entries()]
  console.table(entries.map(([k, v]) => ({ nodeId: k, groupId: v })))
  alert(
    [
      `nodeGroupMap 共 ${entries.length} 条（详见控制台）`,
      `group_a.children: ${groupA ? [...groupA.children].join(', ') : '无'}`,
      `job_group.children: ${jobGroup ? [...jobGroup.children].join(', ') : '未创建'}`,
      `job_child_1 → ${dg.nodeGroupMap.get('job_child_1') ?? '无'}`,
      `job_child_2 → ${dg.nodeGroupMap.get('job_child_2') ?? '无'}`,
    ].join('\n'),
  )
}

export const scenarios: Scenario[] = [
  {
    id: 'cascade-delete-children',
    title: '删分组：级联删除 vs 保留子节点',
    issues: ['cascadeDeleteChildren'],
    fixedIssues: ['cascadeDeleteChildren'],
    expectedBug:
      '验证 pluginsOptions.dynamicGroup.cascadeDeleteChildren：true 时删组连带删子节点；false 时仅删分组框，子节点与对外连线保留。',
    steps: [
      '1. 画布预置：cascade_outer → cascade_rect，组内另有 cascade_circle；分组 cascade_group_1 默认展开。',
      '2. 用开关切换 cascadeDeleteChildren（级联删 / 保留子）。',
      '3. 可选：先点「折叠分组」再删（勿连续重复点折叠/展开，已在目标态时再点无效）。',
      '4. 点击「删除分组」，观察 cascade_rect / cascade_circle 是否仍在画布。',
      '5. 点「重置场景」可重复对比两种模式。',
    ],
    graphData: {
      nodes: [
        makeNode('cascade_outer', 'circle', 120, 220),
        makeNode('cascade_rect', 'rect', 420, 200, {
          properties: { width: 80, height: 50 },
        }),
        makeNode('cascade_circle', 'circle', 520, 240),
        {
          ...makeGroup('cascade_group_1', 460, 220, [], {
            width: 360,
            height: 220,
            radius: 5,
          }),
        },
      ],
      edges: [
        {
          id: 'cascade_edge_outer_rect',
          type: 'polyline',
          sourceNodeId: 'cascade_outer',
          targetNodeId: 'cascade_rect',
        },
      ],
    },
    afterRender: (lf) => {
      const group = lf.getNodeModelById('cascade_group_1') as
        | { addChild: (id: string) => void }
        | undefined
      group?.addChild('cascade_rect')
      group?.addChild('cascade_circle')
      const dg = lf.graphModel.dynamicGroup as {
        cascadeDeleteChildren?: boolean
      }
      if (dg) {
        dg.cascadeDeleteChildren = true
      }
    },
    Controls: CascadeDeleteControls,
  },
  {
    id: 'edge-delete-after-collapse',
    title: '折叠后删边再展开（边复活）',
    issues: ['#2395'],
    fixedIssues: ['#2395'],
    expectedBug: '折叠时删对外连线，展开后连线又出现。',
    steps: [
      '1. 画布已预置：外圆 → 组内矩形，分组为展开态。',
      '2. 点击分组左上角折叠按钮，或点「折叠分组」。',
      '3. 选中折叠后可见的连线，Delete 删除。',
      '4. 点击「展开分组」。',
      '5. 预期（修复后）：连线不应再出现。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_1', 420, 220, ['inner_rect'], { isCollapsed: false }),
        makeNode('outer_circle', 'circle', 120, 220),
        makeNode('inner_rect', 'rect', 420, 220, {
          properties: { width: 80, height: 50 },
        }),
      ],
      edges: [
        {
          id: 'edge_outer_inner',
          type: 'polyline',
          sourceNodeId: 'outer_circle',
          targetNodeId: 'inner_rect',
        },
      ],
    },
    actions: [
      {
        key: 'collapse',
        label: '折叠分组',
        run: (lf) => toggleGroup(lf, 'group_1', true),
      },
      {
        key: 'expand',
        label: '展开分组',
        run: (lf) => toggleGroup(lf, 'group_1', false),
      },
      {
        key: 'delete-edge',
        label: '删除选中边',
        run: (lf) => {
          const { edges } = lf.getSelectElements()
          edges.forEach((e) => lf.deleteEdge(e.id!))
        },
      },
    ],
  },
  {
    id: 'gateway-dual-branch',
    title: 'Gateway 双分支入组 + 删一条虚拟边',
    issues: ['#2395', 'E7'],
    fixedIssues: ['#2395'],
    expectedBug:
      '折叠后两条重叠虚拟边，删一条展开后另一条分支应仍在；已删分支不应复活。',
    steps: [
      '1. 菱形为判断节点，两条线连到组内 A/B。',
      '2. 折叠分组 → 判断到组应为 2 条虚拟边（常重叠像 1 条）。',
      '3. 选中一条线删除 → 展开。',
      '4. 预期：仅剩未删分支；已删分支不复活。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_gw', 480, 240, ['node_a', 'node_b']),
        makeNode('gateway', 'diamond', 160, 240),
        makeNode('node_a', 'rect', 420, 180),
        makeNode('node_b', 'rect', 420, 300),
      ],
      edges: [
        {
          id: 'e_gw_a',
          type: 'polyline',
          sourceNodeId: 'gateway',
          targetNodeId: 'node_a',
        },
        {
          id: 'e_gw_b',
          type: 'polyline',
          sourceNodeId: 'gateway',
          targetNodeId: 'node_b',
        },
      ],
    },
    actions: [
      {
        key: 'collapse',
        label: '折叠分组',
        run: (lf) => toggleGroup(lf, 'group_gw', true),
      },
      {
        key: 'expand',
        label: '展开分组',
        run: (lf) => toggleGroup(lf, 'group_gw', false),
      },
      {
        key: 'delete-edge',
        label: '删除选中边',
        run: (lf) => {
          lf.getSelectElements().edges.forEach((e) => lf.deleteEdge(e.id!))
        },
      },
    ],
  },
  {
    id: 'points-list-collapse',
    title: '收起时丢失手动折线路径',
    issues: ['#2399', '#2400'],
    fixedIssues: ['#2399', '#2400'],
    expectedBug: '手动拖折线拐点后，收起分组会重算为最短路径。',
    steps: [
      '1. 用折线工具或拖拽边中间点，使路径非最短。',
      '2. 点击「收起分组」。',
      '3. 再「展开分组」。',
      '4. 预期（修复后）：路径与收起前一致。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_pl', 400, 200, ['inner_c']),
        makeNode('outer_c', 'circle', 100, 200),
        makeNode('inner_c', 'rect', 400, 200),
      ],
      edges: [
        {
          id: 'edge_pl',
          type: 'polyline',
          sourceNodeId: 'outer_c',
          targetNodeId: 'inner_c',
          pointsList: [
            { x: 150, y: 200 },
            { x: 150, y: 120 },
            { x: 350, y: 120 },
            { x: 350, y: 200 },
          ],
        },
      ],
    },
    actions: [
      {
        key: 'collapse',
        label: '收起分组',
        run: (lf) => toggleGroup(lf, 'group_pl', true),
      },
      {
        key: 'expand',
        label: '展开分组',
        run: (lf) => toggleGroup(lf, 'group_pl', false),
      },
    ],
  },
  {
    id: 'edge-nan-after-toggle',
    title: '折叠展开后边 NaN / 消失',
    issues: ['#2401'],
    expectedBug: '拖拽调整边后折叠再展开，边坐标 NaN 或不可见。',
    steps: [
      '1. 拖折线中间控制点改变路径。',
      '2. 折叠 → 展开分组。',
      '3. 观察边是否出现 NaN、断线或不可见。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_nan', 450, 250, ['r_nan']),
        makeNode('c_nan', 'circle', 120, 250),
        makeNode('r_nan', 'rect', 450, 250),
      ],
      edges: [
        {
          id: 'e_nan',
          type: 'polyline',
          sourceNodeId: 'c_nan',
          targetNodeId: 'r_nan',
        },
      ],
    },
    actions: [
      {
        key: 'collapse',
        label: '折叠',
        run: (lf) => toggleGroup(lf, 'group_nan', true),
      },
      {
        key: 'expand',
        label: '展开',
        run: (lf) => toggleGroup(lf, 'group_nan', false),
      },
    ],
  },
  {
    id: 'initial-collapsed-position',
    title: '默认折叠首屏位置',
    issues: ['#1616', '#2198'],
    unreproducibleIssues: ['#1616', '#2198'],
    expectedBug: 'isCollapsed:true 首次 render 分组/子节点位置错乱或偏移。',
    steps: [
      '1. 刷新页面加载本场景（分组默认折叠）。',
      '2. 观察分组框与子节点是否对齐、无跳动。',
      '3. 点「展开」再看位置是否合理。',
    ],
    graphData: {
      nodes: [
        {
          id: 'circle_2',
          type: 'circle',
          x: 800,
          y: 140,
          text: nodeText('circle_2', 800, 140, {
            editable: false,
            draggable: true,
          }),
        },
        {
          id: 'circle_3',
          type: 'circle',
          x: 544,
          y: 94,
          properties: {},
          text: nodeText('circle_3', 544, 94),
        },
        {
          id: 'dynamic-group_1',
          type: 'dynamic-group',
          x: 500,
          y: 140,
          text: 'dynamic-group_1',
          resizable: true,
          properties: {
            collapsible: true,
            width: 420,
            height: 250,
            radius: 5,
            isCollapsed: true,
            children: ['circle_3', 'circle_2'],
          },
        },
      ],
      edges: [],
    },
    actions: [
      {
        key: 'expand',
        label: '展开分组',
        run: (lf) => toggleGroup(lf, 'dynamic-group_1', false),
      },
      {
        key: 'collapse',
        label: '再折叠',
        run: (lf) => toggleGroup(lf, 'dynamic-group_1', true),
      },
    ],
  },
  {
    id: 'map-after-remove-group',
    title: '删组后选中子节点报错',
    issues: ['#2194'],
    unreproducibleIssues: ['#2194'],
    expectedBug: 'removeChild 后删分组，选中子节点报 map 相关错误。',
    steps: [
      '1. 画布已预置 dynamic-group_1 与 circle_1、circle_2（通过 addChild 入组）。',
      '2. 点「去除分组」（removeChild 全部子节点后删除分组）。',
      '3. 点击 circle_1 或 circle_2 选中。',
      '4. 预期：无控制台报错。',
    ],
    graphData: {
      nodes: [
        {
          id: 'circle_1',
          type: 'circle',
          x: 502,
          y: 170,
          text: nodeText('circle_1', 502, 170, { draggable: true }),
        },
        {
          id: 'circle_2',
          type: 'circle',
          x: 680,
          y: 170,
          text: nodeText('circle_2', 680, 170, { draggable: true }),
        },
        {
          id: 'dynamic-group_1',
          type: 'dynamic-group',
          x: 542,
          y: 189,
          text: 'dynamic-group_1',
          resizable: true,
          properties: {
            width: 420,
            height: 250,
            radius: 5,
          },
        },
      ],
      edges: [],
    },
    afterRender: (lf) => {
      const groupModel = lf.getNodeModelById('dynamic-group_1') as
        | { addChild: (id: string) => void }
        | undefined
      groupModel?.addChild('circle_1')
      groupModel?.addChild('circle_2')
    },
    actions: [
      {
        key: 'cancel-group',
        label: '去除分组',
        run: (lf) => {
          const groupModel = lf.getNodeModelById('dynamic-group_1') as
            | {
                children: Set<string>
                removeChild: (id: string) => void
                id: string
              }
            | undefined
          if (!groupModel) return
          Array.from(groupModel.children).forEach((childId) => {
            groupModel.removeChild(childId)
          })
          lf.graphModel.deleteNode(groupModel.id)
        },
      },
    ],
  },
  {
    id: 'new-group-map-pollution',
    title: '新分组被旧分组 map 污染',
    issues: ['#2052'],
    fixedIssues: ['#2052'],
    expectedBug:
      'graphModel.addNode 批量落盘后 dynamic-group children 为空，再 addChild 时子节点仍可能被旧分组 nodeGroupMap / children 影响。',
    steps: [
      '1. 画布已有 group_a（含 rect_a）与占位节点 job_placeholder。',
      '2. 点「新增任务组」，模拟 confirmDialog：batch addNode → dynamic-group addChild → 删除占位节点。',
      '3. 点「打印归属」，检查 job_child_* 的 nodeGroupMap 与 group_a / job_group 的 children。',
      '4. 预期（修复后）：子节点仅归属 job_group，group_a 不含 job_child_*。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_a', 350, 200, ['rect_a'], {
          width: 480,
          height: 250,
        }),
        { id: 'rect_a', type: 'rect', x: 350, y: 200, text: 'rect_a' },
        makeNode('job_placeholder', 'rect', 520, 200, {
          properties: { width: 80, height: 50 },
        }),
      ],
      edges: [],
    },
    actions: [
      {
        key: 'add-job-group',
        label: '新增任务组',
        description: '模拟 JobInfoAPI.getJobCompose + addNode + addChild',
        run: addJobGroup2052,
      },
      {
        key: 'log-map',
        label: '打印归属',
        run: logGroupMembership2052,
      },
      {
        key: 'collapse-job',
        label: '折叠 job_group',
        run: (lf) => toggleGroup(lf, 'job_group', true),
      },
    ],
  },
  {
    id: 'restrict-no-append-in',
    title: 'isRestrict + 禁止入组时组内拖放出组',
    issues: ['#2412'],
    fixedIssues: ['#2412'],
    expectedBug: '组内节点拖放松手后脱离 children，可拖出组外。',
    steps: [
      '1. 组为 locked-dynamic-group，子节点在组内。',
      '2. 在组内拖动子节点松手（不要拖出组界）。',
      '3. 再拖动，看能否拖出组外。',
      '4. 点「打印归属」确认 children / map。',
    ],
    prepare: registerLockedGroup,
    graphData: {
      nodes: [
        makeGroup(
          'locked_g',
          400,
          240,
          ['locked_child'],
          {},
          'locked-dynamic-group',
        ),
        makeNode('locked_child', 'rect', 400, 240),
      ],
      edges: [],
    },
    actions: [
      {
        key: 'log-membership',
        label: '打印归属',
        run: (lf) => {
          const g = lf.getNodeModelById('locked_g') as { children: Set<string> }
          const map = (
            lf.graphModel.dynamicGroup as { nodeGroupMap: Map<string, string> }
          ).nodeGroupMap.get('locked_child')
          alert(
            `children 含 locked_child: ${g?.children?.has('locked_child')}\nnodeGroupMap: ${map ?? '无'}`,
          )
        },
      },
    ],
  },
  {
    id: 'zindex-mismatch',
    title: '组与子节点图层不一致',
    issues: ['LOCAL-1'],
    expectedBug: '子节点绘制在分组框之上/之下，层级与「组为底」预期不符。',
    steps: [
      '1. 观察 group_z 与 inner_z 叠放顺序。',
      '2. 选中分组（autoToFront）后再观察。',
      '3. 修复后：组与子在视觉上层级应一致协调。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_z', 400, 220, ['inner_z'], {
          autoToFront: true,
          zIndex: -1000,
        }),
        makeNode('inner_z', 'rect', 400, 220, { zIndex: 1 }),
      ],
      edges: [],
    },
    actions: [
      {
        key: 'select-group',
        label: '选中分组（触发置顶）',
        run: (lf) => lf.selectElementById('group_z', true),
      },
    ],
  },
  {
    id: 'overlap-collapse-misassign',
    title: '重叠分组折叠后归属漂移',
    issues: ['LOCAL-2', '#2052'],
    fixedIssues: ['LOCAL-2', '#2052'],
    expectedBug: '折叠 group_1 后，其子节点归属变成 group_2。',
    steps: [
      '1. group_1 与 group_2 部分重叠，node_x 属于 group_1。',
      '2. 折叠 group_1。',
      '3. 展开 group_1。',
      '4. 点「打印 node_x 归属」，应仍为 group_1。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_1', 360, 240, ['node_x'], {
          width: 280,
          height: 180,
        }),
        makeGroup('group_2', 400, 260, [], { width: 280, height: 180 }),
        makeNode('node_x', 'rect', 360, 240),
      ],
      edges: [],
    },
    actions: [
      {
        key: 'collapse-1',
        label: '折叠 group_1',
        run: (lf) => toggleGroup(lf, 'group_1', true),
      },
      {
        key: 'expand-1',
        label: '展开 group_1',
        run: (lf) => toggleGroup(lf, 'group_1', false),
      },
      {
        key: 'log-owner',
        label: '打印 node_x 归属',
        run: (lf) => {
          const dg = lf.graphModel.dynamicGroup as {
            getGroupByNodeId: (id: string) => { id: string } | undefined
          }
          const owner = dg.getGroupByNodeId('node_x')?.id ?? '无'
          alert(`node_x 归属分组: ${owner}`)
        },
      },
    ],
  },
  {
    id: 'add-node-with-children',
    title: 'addNode 带 children 建组',
    issues: ['#1673'],
    fixedIssues: ['#1673'],
    expectedBug:
      'addNode 创建含 children 的分组时报 isGroup undefined；嵌套场景下外层 children 与 map 不一致导致子节点双重位移。',
    steps: [
      '1. 画布已预置默认分组 default_group。',
      '2. 点击「新增分组+子节点」。',
      '3. 预期：在 default_group 内新增子分组与子节点，无报错，children 与 map 正确。',
    ],
    graphData: {
      nodes: [
        makeGroup('default_group', 400, 300, [], {
          width: 420,
          height: 320,
        }),
      ],
      edges: [],
    },
    actions: [
      {
        key: 'add-with-children',
        label: '新增分组+子节点',
        run: (lf) => {
          const parent = lf.getNodeModelById('default_group')
          if (!parent) return
          const x = parent.x
          const y = parent.y

          lf.addNode({
            id: 'api_rect',
            type: 'rect',
            x,
            y,
            text: 'api_rect',
          })
          lf.addNode({
            id: 'api_group',
            type: 'dynamic-group',
            x,
            y,
            text: 'api_group',
            resizable: true,
            properties: {
              ...baseGroupProps,
              width: 200,
              height: 150,
              children: ['api_rect'],
            },
          })

          const parentModel = lf.getNodeModelById('default_group') as
            | { addChild: (id: string) => void }
            | undefined
          parentModel?.addChild('api_group')
        },
      },
    ],
  },
  {
    ...layoutFormatEscapeScenario,
    Controls: LayoutFormatEscapeControls,
  },
  {
    ...titleHeaderScenario,
    Controls: TitleHeaderControls,
  },
  {
    ...resizeBoundsScenario,
    Controls: ResizeBoundsControls,
    afterRender: syncResizeBoundsMembership,
  },
  {
    id: 'resize-undo-twice',
    title: '分组 resize 后需撤销两次',
    issues: ['#1532'],
    wontFixIssues: ['#1532'],
    expectedBug:
      '报告为 resize 后需撤销两次。调查：默认快速 resize 通常一次 undo 即可；慢速/断续拖动因 history debounce 可能产生多条快照。已关闭，暂不修复。',
    steps: [
      '1. 选中 group_resize，拖右下角控制点改变宽高（可对比快速拖动 vs 慢速拖动）。',
      '2. 按 Ctrl+Z（或 Cmd+Z）撤销，观察需几次才回到 resize 前。',
      '3. 结论：默认配置下多为一次 undo；机制性隐患留待后续有需求再修。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_resize', 400, 240, ['child_resize'], {
          width: 280,
          height: 180,
        }),
        makeNode('child_resize', 'rect', 400, 240),
      ],
      edges: [],
    },
    actions: [
      {
        key: 'log-size',
        label: '打印分组尺寸',
        run: (lf) => {
          const m = lf.getNodeModelById('group_resize')
          alert(`width=${m?.width}, height=${m?.height}`)
        },
      },
      {
        key: 'undo',
        label: '撤销 (Ctrl+Z)',
        run: (lf) => lf.undo(),
      },
    ],
  },
  {
    id: 'real-edge-api-delete-while-collapsed',
    title: '折叠态 API 删真实边 → 虚拟边不残留（C1）',
    issues: ['C1'],
    expectedBug:
      '折叠态下通过 API 删除真实边后，对应虚拟边仍残留在画布上，且展开分组也无法消除它。',
    steps: [
      '1. 画布预置：外圆 → 组内矩形（真实边 id: real_edge_c1）。',
      '2. 点「折叠分组」，此时画布上出现一条虚拟边（替代真实边显示）。',
      '3. 点「API 删真实边」，通过 lf.deleteEdge 直接删除真实边（此时真实边不可见）。',
      '4. 观察：虚拟边应立即从画布消失。（Bug 时：虚拟边仍然存在）',
      '5. 点「展开分组」，画布上不应出现任何边。（Bug 时：展开后虚拟边仍残留）',
      '6. 点「打印边数量」可验证 graphModel.edges 里是否还有残留。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_c1', 420, 220, ['inner_rect_c1'], {
          isCollapsed: false,
        }),
        makeNode('outer_circle_c1', 'circle', 120, 220),
        makeNode('inner_rect_c1', 'rect', 420, 220, {
          properties: { width: 80, height: 50 },
        }),
      ],
      edges: [
        {
          id: 'real_edge_c1',
          type: 'polyline',
          sourceNodeId: 'outer_circle_c1',
          targetNodeId: 'inner_rect_c1',
        },
      ],
    },
    actions: [
      {
        key: 'collapse',
        label: '折叠分组',
        run: (lf) => toggleGroup(lf, 'group_c1', true),
      },
      {
        key: 'api-delete-real-edge',
        label: 'API 删真实边',
        run: (lf) => {
          const deleted = lf.deleteEdge('real_edge_c1')
          alert(
            deleted
              ? '真实边已删除，观察虚拟边是否消失'
              : '真实边不存在（已经被删过了）',
          )
        },
      },
      {
        key: 'expand',
        label: '展开分组',
        run: (lf) => toggleGroup(lf, 'group_c1', false),
      },
      {
        key: 'count-edges',
        label: '打印边数量',
        run: (lf) => {
          const edges = lf.graphModel.edges
          const virtual = edges.filter((e) => e.virtual)
          const real = edges.filter((e) => !e.virtual)
          alert(
            `graphModel.edges 共 ${edges.length} 条\n虚拟边: ${virtual.length} 条\n真实边: ${real.length} 条`,
          )
        },
      },
    ],
  },
  {
    id: 'resize-single-axis',
    title: '单边 resize 控制点',
    issues: ['#1555'],
    wontFixIssues: ['#1555'],
    expectedBug:
      '希望分组四边中点有仅改宽/高的控制点。当前 LogicFlow 全图可缩放节点（含 dynamic-group）统一为四角 resize，与 rect 等一致。已关闭，暂不修复。',
    steps: [
      '1. 选中 group_axis（展开、resizable）。',
      '2. 观察分组周围 resize 控制点（当前为四角，无边中点）。',
      '3. 结论：属体验增强；若要做应在 core 层统一设计单边 resize，而非仅改分组。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_axis', 420, 260, ['child_axis'], {
          width: 300,
          height: 200,
          isCollapsed: false,
        }),
        makeNode('child_axis', 'rect', 420, 260),
      ],
      edges: [],
    },
    actions: [
      {
        key: 'select-group',
        label: '选中分组',
        run: (lf) => lf.selectElementById('group_axis', true),
      },
      {
        key: 'log-controls',
        label: '打印 resize 控件数',
        run: (lf) => {
          const m = lf.getNodeModelById('group_axis') as {
            getResizeControl?: () => unknown
          }
          const ctrl = m?.getResizeControl?.()
          const count = Array.isArray(ctrl) ? ctrl.length : ctrl ? 1 : 0
          alert(
            `getResizeControl 返回 ${count} 个控件（当前设计为四角 resize）`,
          )
        },
      },
    ],
  },
]
