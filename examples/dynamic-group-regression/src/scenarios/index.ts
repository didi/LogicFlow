import type LogicFlow from '@logicflow/core'
import type { Scenario } from './types'
import { baseGroupProps, makeGroup, registerLockedGroup } from './customNodes'

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

export const scenarios: Scenario[] = [
  {
    id: 'edge-delete-after-collapse',
    title: '折叠后删边再展开（边复活）',
    issues: ['#2395'],
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
        { id: 'outer_circle', type: 'circle', x: 120, y: 220, text: '外节点' },
        {
          id: 'inner_rect',
          type: 'rect',
          x: 420,
          y: 220,
          text: '组内',
          properties: { width: 80, height: 50 },
        },
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
        { id: 'gateway', type: 'diamond', x: 160, y: 240, text: '判断' },
        { id: 'node_a', type: 'rect', x: 420, y: 180, text: 'A' },
        { id: 'node_b', type: 'rect', x: 420, y: 300, text: 'B' },
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
        { id: 'outer_c', type: 'circle', x: 100, y: 200, text: '外' },
        { id: 'inner_c', type: 'rect', x: 400, y: 200, text: '内' },
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
      '1. 先拖折线中间控制点改变路径。',
      '2. 折叠 → 展开分组。',
      '3. 检查边是否消失或控制台 NaN。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_nan', 450, 250, ['r_nan']),
        { id: 'c_nan', type: 'circle', x: 120, y: 250, text: '外' },
        { id: 'r_nan', type: 'rect', x: 450, y: 250, text: '内' },
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
    expectedBug: 'isCollapsed:true 首次 render 分组/子节点位置错乱或偏移。',
    steps: [
      '1. 刷新页面加载本场景（分组默认折叠）。',
      '2. 观察分组框与子节点是否对齐、无跳动。',
      '3. 点「展开」再看位置是否合理。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_init', 400, 220, ['init_child'], {
          isCollapsed: true,
          width: 360,
          height: 220,
        }),
        { id: 'init_child', type: 'rect', x: 400, y: 220, text: '子' },
      ],
      edges: [],
    },
    actions: [
      {
        key: 'expand',
        label: '展开分组',
        run: (lf) => toggleGroup(lf, 'group_init', false),
      },
      {
        key: 'collapse',
        label: '再折叠',
        run: (lf) => toggleGroup(lf, 'group_init', true),
      },
    ],
  },
  {
    id: 'map-after-remove-group',
    title: '删组后选中子节点报错',
    issues: ['#2194'],
    expectedBug: 'removeChild 后删分组，选中子节点报 map 相关错误。',
    steps: [
      '1. 点「移除子节点并删除分组」。',
      '2. 点击剩余子节点选中。',
      '3. 预期：无控制台报错。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_del', 380, 200, ['orphan']),
        { id: 'orphan', type: 'rect', x: 380, y: 200, text: '子' },
      ],
      edges: [],
    },
    actions: [
      {
        key: 'remove-and-delete',
        label: '移除子节点并删除分组',
        run: (lf) => {
          const g = lf.getNodeModelById('group_del')
          g &&
            (g as { removeChild: (id: string) => void }).removeChild('orphan')
          lf.deleteNode('group_del')
        },
      },
    ],
  },
  {
    id: 'new-group-map-pollution',
    title: '新分组被旧分组 map 污染',
    issues: ['#2052'],
    expectedBug: '新建空分组 B，拖入节点却受旧分组 A 的 nodeGroupMap 影响。',
    steps: [
      '1. 已有 group_a（含 rect_a）。',
      '2. 从面板拖一个新分组 group_b 到空白处。',
      '3. 将 rect_b 拖入 group_b。',
      '4. 折叠 group_b，观察是否错误关联 group_a。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_a', 280, 180, ['rect_a']),
        { id: 'rect_a', type: 'rect', x: 280, y: 180, text: 'A内' },
        makeGroup('group_b', 580, 180, []),
        { id: 'rect_b', type: 'rect', x: 520, y: 280, text: '待入B' },
      ],
      edges: [],
    },
    actions: [
      {
        key: 'collapse-b',
        label: '折叠 group_b',
        run: (lf) => toggleGroup(lf, 'group_b', true),
      },
      {
        key: 'log-map',
        label: '打印 nodeGroupMap',
        run: (lf) => {
          const dg = lf.graphModel.dynamicGroup as {
            nodeGroupMap: Map<string, string>
          }
          const entries = [...dg.nodeGroupMap.entries()]
          console.table(entries.map(([k, v]) => ({ nodeId: k, groupId: v })))
          alert(`nodeGroupMap 共 ${entries.length} 条，见控制台`)
        },
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
        { id: 'locked_child', type: 'rect', x: 400, y: 240, text: '锁定子' },
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
        {
          id: 'inner_z',
          type: 'rect',
          x: 400,
          y: 220,
          text: '子 z=1',
          zIndex: 1,
        },
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
        { id: 'node_x', type: 'rect', x: 360, y: 240, text: '属于1' },
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
      '3. 预期：在 default_group 内新增子分组与子节点，无报错，children 与 map 正确；拖动外层分组时内层子节点同步移动。',
    ],
    graphData: {
      nodes: [
        {
          ...makeGroup('default_group', 400, 300, [], {
            width: 420,
            height: 320,
          }),
          text: '默认分组',
        },
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
            text: 'api子',
          })
          lf.addNode({
            id: 'api_group',
            type: 'dynamic-group',
            x,
            y,
            text: 'api组',
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
    id: 'layout-format-escape',
    title: '布局后子节点逃出分组',
    issues: ['#2205', '#2332'],
    expectedBug: '执行自动布局后，组内节点脱离 children / 画出组框。',
    steps: [
      '1. 组内含两个节点，位置较乱。',
      '2. 点击「ELK 布局」。',
      '3. 检查子节点是否仍在组 children 内且视觉上在组框中。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_layout', 400, 280, ['lay_a', 'lay_b'], {
          width: 400,
          height: 260,
        }),
        { id: 'lay_a', type: 'rect', x: 300, y: 200, text: 'A' },
        { id: 'lay_b', type: 'rect', x: 500, y: 360, text: 'B' },
      ],
      edges: [
        {
          id: 'e_lay',
          type: 'polyline',
          sourceNodeId: 'lay_a',
          targetNodeId: 'lay_b',
        },
      ],
    },
    actions: [
      {
        key: 'elk-layout',
        label: 'ELK 布局',
        description: '需加载 ElkLayout 插件',
        run: (lf) => {
          const elk = (
            lf.extension as { elkLayout?: { layout: (o: object) => void } }
          ).elkLayout
          if (!elk) {
            alert('当前未启用 ElkLayout 插件')
            return
          }
          elk.layout({ ranksep: 80, nodesep: 40, rankdir: 'TB' })
          lf.fitView()
        },
      },
      {
        key: 'log-children',
        label: '打印 group children',
        run: (lf) => {
          const data = lf.getNodeDataById('group_layout')
          alert(
            `children: ${JSON.stringify(data?.children ?? data?.properties?.children)}`,
          )
        },
      },
    ],
  },
  {
    id: 'resize-undo-twice',
    title: '分组 resize 后需撤销两次',
    issues: ['#1532'],
    expectedBug:
      '拖分组角点改大小后，按一次 Ctrl+Z 无法回到 resize 前，需撤销两次。',
    steps: [
      '1. 选中 group_resize，拖右下角控制点改变宽高。',
      '2. 按 Ctrl+Z（或 Cmd+Z）撤销一次。',
      '3. 预期（修复后）：一次撤销即恢复 resize 前尺寸。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_resize', 400, 240, ['child_resize'], {
          width: 280,
          height: 180,
        }),
        { id: 'child_resize', type: 'rect', x: 400, y: 240, text: '子' },
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
    id: 'resize-single-axis',
    title: '单边 resize 控制点',
    issues: ['#1555'],
    expectedBug: '展开态分组仅有四角等比缩放，缺少单独改宽/高的控制点。',
    steps: [
      '1. 选中 group_axis（展开、resizable）。',
      '2. 观察分组周围 resize 控制点。',
      '3. 预期（修复后）：除四角外应有仅改宽或仅改高的边中点控制点。',
    ],
    graphData: {
      nodes: [
        makeGroup('group_axis', 420, 260, ['child_axis'], {
          width: 300,
          height: 200,
          isCollapsed: false,
        }),
        { id: 'child_axis', type: 'rect', x: 420, y: 260, text: '子' },
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
          alert(`getResizeControl 返回 ${count} 个控件（修复后应 > 4）`)
        },
      },
    ],
  },
]
