<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import LogicFlow from '@logicflow/core'
import { Control, DynamicGroup, PoolElements, SelectionSelect } from '@logicflow/extension'
import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

type Direction = 'horizontal' | 'vertical'
type TitlePosition = 'top' | 'right' | 'bottom' | 'left'
type PluginMode = 'pool' | 'compare' | 'dynamic-group-only'

type DebugNode = {
  id: string
  type: string
  parent?: unknown
  children: string[]
  x: number
  y: number
  width?: number
  height?: number
}

type EventLog = {
  name: string
  detail: string
  time: string
}

const containerRef = ref<HTMLDivElement | null>(null)
const lfRef = ref<LogicFlow | null>(null)
const graphVersion = ref(0)
const selectedIds = ref<string[]>([])
const activeConfigNodeId = ref<string>()
const eventLogs = ref<EventLog[]>([])
const rejectLane2 = ref(false)
const activeScenario = ref<Direction>('horizontal')
const pluginMode = ref<PluginMode>('pool')
const poolTitlePosition = ref<TitlePosition>('left')
const laneTitlePosition = ref<TitlePosition>('left')
const collapsedLaneGap = ref(12)
const behaviorOptions = ref({
  cascadeDeleteChildren: true,
  minLaneCount: 1,
  collapse: {
    pool: true,
    lane: true
  }
})
let resizeObserver: ResizeObserver | undefined

declare global {
  interface Window {
    poolLaneLf?: LogicFlow
  }
}

const scenarioInfo = [
  {
    key: 'move',
    title: '移动',
    items: ['pool 整体移动', 'lane 排序', 'lane 跨 pool', '非法目标拒绝']
  },
  {
    key: 'create-delete',
    title: '新增/删除',
    items: ['默认级联删除', '保留子节点配置', 'minLaneCount 限制']
  },
  {
    key: 'resize',
    title: 'Resize',
    items: ['pool 无控制点', 'lane resize 驱动 pool', '子节点 bounds 限制']
  },
  {
    key: 'collapse',
    title: '折叠',
    items: ['pool 折叠', 'lane 折叠', '折叠态删除']
  },
  {
    key: 'selection',
    title: '框选',
    items: ['移动父子跟随', '复制父子去重', '删除父子去重']
  }
]

const baseNodes = [
  { id: 'task_waiting', type: 'rect', x: 900, y: 130, text: '拖入泳道' },
  { id: 'decision_waiting', type: 'diamond', x: 900, y: 250, text: '拖入泳道' },
  { id: 'circle_waiting', type: 'circle', x: 900, y: 370, text: '拖入泳道' }
]

const isPoolMode = computed(() => pluginMode.value !== 'dynamic-group-only')
const isDynamicGroupMode = computed(() => pluginMode.value !== 'pool')

/**
 * Pool/Lane 行为回归工作台。
 *
 * 场景数据保持小而固定，便于复现拖拽、折叠和复制粘贴问题。
 */
function createDynamicGroupGraph(): LogicFlow.GraphConfigData {
  return {
    nodes: [
      {
        id: 'dynamic_group_1',
        type: 'dynamic-group',
        x: 430,
        y: 280,
        width: 420,
        height: 280,
        text: 'DynamicGroup 验证容器',
        properties: {
          width: 420,
          height: 280,
          collapsible: true,
          isCollapsed: false,
          isRestrict: false,
          autoResize: false,
          transformWithContainer: true,
          children: []
        },
        children: []
      },
      { id: 'dg_task_waiting', type: 'rect', x: 860, y: 170, text: '拖入 DynamicGroup' },
      { id: 'dg_decision_waiting', type: 'diamond', x: 860, y: 300, text: '拖入 DynamicGroup' },
      { id: 'dg_circle_waiting', type: 'circle', x: 860, y: 430, text: '拖入 DynamicGroup' }
    ],
    edges: []
  }
}

function createPoolGraph(direction: Direction): LogicFlow.GraphConfigData {
  const isHorizontal = direction === 'horizontal'
  const pool = {
    id: `pool_${direction}`,
    type: 'pool',
    x: 460,
    y: 290,
    text: isHorizontal ? '横向泳池' : '竖向泳池',
    properties: {
      direction,
      width: isHorizontal ? 560 : 460,
      height: isHorizontal ? 360 : 420,
      children: ['lane_1', 'lane_2'],
      laneConfig: {
        text: '泳道',
        titlePosition: laneTitlePosition.value,
        collapsedLaneGap: collapsedLaneGap.value
      },
      titlePosition: poolTitlePosition.value
    },
    children: ['lane_1', 'lane_2']
  }

  const lane1 = {
    id: 'lane_1',
    type: 'lane',
    x: isHorizontal ? 490 : 375,
    y: isHorizontal ? 200 : 320,
    width: isHorizontal ? 500 : 230,
    height: isHorizontal ? 180 : 360,
    text: 'lane_1',
    properties: {
      parent: pool.id,
      direction,
      isHorizontal,
      children: ['node_a', 'node_b']
    },
    children: ['node_a', 'node_b']
  }

  const lane2 = {
    id: 'lane_2',
    type: 'lane',
    x: isHorizontal ? 490 : 605,
    y: isHorizontal ? 380 : 320,
    width: isHorizontal ? 500 : 230,
    height: isHorizontal ? 180 : 360,
    text: 'lane_2',
    properties: {
      parent: pool.id,
      direction,
      isHorizontal,
      children: ['node_c']
    },
    children: ['node_c']
  }

  return {
    nodes: [
      pool,
      lane1,
      lane2,
      {
        id: 'node_a',
        type: 'rect',
        x: isHorizontal ? 390 : 330,
        y: isHorizontal ? 200 : 260,
        text: '审批',
        properties: {
          parent: 'lane_1',
          width: 90,
          height: 54
        }
      },
      {
        id: 'node_b',
        type: 'diamond',
        x: isHorizontal ? 575 : 430,
        y: isHorizontal ? 200 : 350,
        text: '判断',
        properties: {
          parent: 'lane_1',
          width: 80,
          height: 70
        }
      },
      {
        id: 'node_c',
        type: 'rect',
        x: isHorizontal ? 470 : 610,
        y: isHorizontal ? 380 : 315,
        text: '处理',
        properties: {
          parent: 'lane_2',
          width: 90,
          height: 54
        }
      },
      ...baseNodes
    ],
    edges: [
      {
        id: 'edge_a_b',
        type: 'polyline',
        sourceNodeId: 'node_a',
        targetNodeId: 'node_b',
        text: '同 lane'
      },
      {
        id: 'edge_b_c',
        type: 'polyline',
        sourceNodeId: 'node_b',
        targetNodeId: 'node_c',
        text: '跨 lane'
      }
    ]
  }
}

const debugNodes = computed<DebugNode[]>(() => {
  graphVersion.value
  const lf = lfRef.value
  if (!lf) return []

  return lf.graphModel.nodes.map((node: any) => ({
    id: node.id,
    type: String(node.type),
    parent: node.properties?.parent,
    children: node.children ? Array.from(node.children) : [],
    x: Math.round(node.x),
    y: Math.round(node.y),
    width: Math.round(node.width ?? 0),
    height: Math.round(node.height ?? 0)
  }))
})

const poolRows = computed(() => debugNodes.value.filter((node) => node.type === 'pool'))
const laneRows = computed(() => debugNodes.value.filter((node) => node.type === 'lane'))
const dynamicGroupRows = computed(() =>
  debugNodes.value.filter((node) => node.type === 'dynamic-group')
)
const childRows = computed(() =>
  debugNodes.value.filter(
    (node) => node.type !== 'pool' && node.type !== 'lane' && node.type !== 'dynamic-group'
  )
)

const nodeLaneMapRows = computed(() => {
  graphVersion.value
  const plugin = getPoolPlugin()
  if (!plugin?.nodeLaneMap) return []
  const entries = Array.from(plugin.nodeLaneMap.entries()) as Array<[string, string]>
  return entries.map(([childId, parentId]) => ({
    childId,
    parentId
  }))
})

const rawDataText = computed(() => {
  graphVersion.value
  const data = lfRef.value?.getGraphData()
  return JSON.stringify(data, null, 2)
})

type ConfigurablePoolNode = {
  type: 'pool'
  id: string
  properties?: {
    titlePosition?: TitlePosition
    minLaneCount?: number
    laneConfig?: {
      titlePosition?: TitlePosition
      collapsedLaneGap?: number
    }
  }
  setProperties?: (properties: Record<string, unknown>) => void
}

type ConfigurableLaneNode = {
  type: 'lane'
  id: string
  properties?: {
    titlePosition?: TitlePosition
  }
  setProperties?: (properties: Record<string, unknown>) => void
}

type ConfigurableDynamicGroupNode = {
  type: 'dynamic-group'
  id: string
  isRestrict?: boolean
  autoResize?: boolean
  transformWithContainer?: boolean
  collapsible?: boolean
  properties?: {
    isRestrict?: boolean
    autoResize?: boolean
    transformWithContainer?: boolean
    collapsible?: boolean
  }
  setProperties?: (properties: Record<string, unknown>) => void
}

type ConfigurableNode = ConfigurablePoolNode | ConfigurableLaneNode | ConfigurableDynamicGroupNode

const selectedNodeModel = computed<ConfigurableNode | undefined>(() => {
  graphVersion.value
  const lf = lfRef.value
  const node = activeConfigNodeId.value ? lf?.getNodeModelById(activeConfigNodeId.value) : undefined
  return isConfigurableNode(node) ? node : undefined
})

const selectedNodeType = computed(() => selectedNodeModel.value?.type ?? '')

const selectedPanelTitle = computed(() => {
  if (selectedNodeType.value === 'pool') return '选中 Pool 配置'
  if (selectedNodeType.value === 'lane') return '选中 Lane 配置'
  if (selectedNodeType.value === 'dynamic-group') return '选中 DynamicGroup 配置'
  return '选中节点配置'
})

function patchSelectedNode(patch: Record<string, unknown>, refresh = true) {
  const node = selectedNodeModel.value
  if (!node?.setProperties) return
  const currentProperties = (node as { properties?: Record<string, unknown> }).properties ?? {}
  node.setProperties({
    ...currentProperties,
    ...patch
  })
  if (refresh) {
    refreshDebugState()
  }
}

function updatePoolPanelConfig(
  patch: Partial<{
    titlePosition: TitlePosition
    minLaneCount: number
    laneConfig: {
      titlePosition?: TitlePosition
      collapsedLaneGap?: number
    }
  }>
) {
  const node = selectedNodeModel.value
  if (!node || node.type !== 'pool') return
  patchSelectedNode(patch)
}

function updateLanePanelConfig(
  patch: Partial<{
    titlePosition: TitlePosition
  }>
) {
  const node = selectedNodeModel.value
  if (!node || node.type !== 'lane') return
  patchSelectedNode(patch)
}

function updateDynamicGroupPanelConfig(
  patch: Partial<{
    isRestrict: boolean
    autoResize: boolean
    transformWithContainer: boolean
    collapsible: boolean
  }>
) {
  const node = selectedNodeModel.value
  if (!node || node.type !== 'dynamic-group') return
  Object.assign(node, patch)
  patchSelectedNode(patch)
}

function isConfigurableNode(node: unknown): node is ConfigurableNode {
  const type = String((node as { type?: unknown } | undefined)?.type ?? '')
  return type === 'pool' || type === 'lane' || type === 'dynamic-group'
}

function resolveActiveConfigNodeId(lf: LogicFlow) {
  const elements = lf.getSelectElements()
  const selectedNodeId = elements.nodes[0]?.id
  if (elements.nodes.length !== 1 || elements.edges.length > 0 || !selectedNodeId) {
    return undefined
  }

  const node = lf.getNodeModelById(selectedNodeId)
  return isConfigurableNode(node) ? node.id : undefined
}

function getPoolPlugin(): any {
  const lf = lfRef.value as any
  return lf?.extension?.PoolElements ?? lf?.graphModel?.dynamicGroup
}

watch(
  behaviorOptions,
  (options) => {
    const plugin = getPoolPlugin()
    if (!plugin) return
    plugin.cascadeDeleteChildren = options.cascadeDeleteChildren
    plugin.minLaneCount = options.minLaneCount
    plugin.collapse = options.collapse
    refreshDebugState()
  },
  { deep: true }
)

function refreshDebugState() {
  const lf = lfRef.value
  if (!lf) return
  const elements = lf.getSelectElements()
  selectedIds.value = [
    ...elements.nodes.map((node) => node.id),
    ...elements.edges.map((edge) => edge.id)
  ]
  activeConfigNodeId.value = resolveActiveConfigNodeId(lf)
  graphVersion.value += 1
}

function pushEvent(name: string, payload: unknown) {
  const data = payload as any
  const detail =
    data?.data?.id ??
    data?.node?.id ??
    data?.lane?.id ??
    data?.id ??
    selectedIds.value.join(', ') ??
    ''

  eventLogs.value.unshift({
    name,
    detail: String(detail || '-'),
    time: new Date().toLocaleTimeString()
  })
  eventLogs.value = eventLogs.value.slice(0, 12)
  refreshDebugState()
}

function patchRejectLane() {
  const lane2 = lfRef.value?.getNodeModelById('lane_2') as any
  if (!lane2) return

  if (!lane2.__originIsAllowAppendIn) {
    lane2.__originIsAllowAppendIn = lane2.isAllowAppendIn.bind(lane2)
  }

  lane2.isAllowAppendIn = rejectLane2.value
    ? (nodeData: LogicFlow.NodeData) => {
        return String(nodeData.id) === 'lane_2' || String(nodeData.type) === 'lane'
          ? false
          : nodeData.id === 'node_c'
      }
    : lane2.__originIsAllowAppendIn

  pushEvent('workbench:reject-lane-2', { id: rejectLane2.value ? 'on' : 'off' })
}

function renderScenario(direction: Direction) {
  activeScenario.value = direction
  rejectLane2.value = false
  lfRef.value?.render(isPoolMode.value ? createPoolGraph(direction) : createDynamicGroupGraph())
  nextTick(() => {
    refreshDebugState()
  })
}

function renderDynamicGroupScenario() {
  rejectLane2.value = false
  lfRef.value?.render(createDynamicGroupGraph())
  nextTick(() => {
    refreshDebugState()
  })
}

function renderEmptyPool(direction: Direction) {
  activeScenario.value = direction
  rejectLane2.value = false
  const isHorizontal = direction === 'horizontal'
  lfRef.value?.render({
    nodes: [
      {
        id: `empty_pool_${direction}`,
        type: 'pool',
        x: 420,
        y: 280,
        text: isHorizontal ? '空横向泳池' : '空竖向泳池',
        properties: {
          direction,
          width: isHorizontal ? 520 : 380,
          height: isHorizontal ? 320 : 460,
          laneConfig: {
            text: '默认泳道'
          }
        }
      }
    ],
    edges: []
  })
  nextTick(() => {
    refreshDebugState()
  })
}

function startDrag(type: string) {
  lfRef.value?.dnd.startDrag({
    type,
    text: type === 'dynamic-group' ? 'DynamicGroup' : type,
    properties:
      type === 'pool'
        ? {
            width: 460,
            height: 300,
            direction: activeScenario.value,
            laneConfig: {
              text: '新泳道'
            }
          }
        : type === 'dynamic-group'
          ? {
              width: 360,
              height: 220,
              collapsible: true,
              isCollapsed: false
            }
          : undefined
  })
}

function getSelectedLane() {
  const selectedNode = selectedNodeModel.value as any
  return selectedNode && String(selectedNode.type) === 'lane' ? selectedNode : null
}

function addLane(position: 'before' | 'after') {
  const lane = getSelectedLane()
  if (!lane) {
    pushEvent('workbench:add-lane-missing-selection', { id: 'select lane first' })
    return
  }

  const pool = lane.getPoolModel?.()
  if (!pool) return

  const isHorizontal = Boolean(pool.isHorizontal)
  if (position === 'before') {
    isHorizontal ? pool.addChildAbove?.(lane.getData()) : pool.addChildLeft?.(lane.getData())
  } else {
    isHorizontal ? pool.addChildBelow?.(lane.getData()) : pool.addChildRight?.(lane.getData())
  }
  refreshDebugState()
}

function deleteSelectedLane() {
  const lane = getSelectedLane()
  if (!lane) {
    pushEvent('workbench:delete-lane-missing-selection', { id: 'select lane first' })
    return
  }
  lane.getPoolModel?.()?.deleteChild?.(lane.id)
  refreshDebugState()
}

function toggleSelectedCollapse() {
  const selectedNode = selectedNodeModel.value as any
  if (!selectedNode) {
    pushEvent('workbench:collapse-missing-selection', { id: 'select node first' })
    return
  }
  selectedNode.toggleCollapse?.()
  refreshDebugState()
}

function openSelection() {
  ;(lfRef.value as any)?.setSelectionSelectMode?.(false)
  ;(lfRef.value as any)?.openSelectionSelect?.()
  pushEvent('workbench:selection-open', { id: 'selection' })
}

function openExclusiveSelection() {
  ;(lfRef.value as any)?.setSelectionSelectMode?.(true)
  ;(lfRef.value as any)?.openSelectionSelect?.()
  pushEvent('workbench:selection-open-exclusive', { id: 'selection' })
}

function closeSelection() {
  ;(lfRef.value as any)?.closeSelectionSelect?.()
  pushEvent('workbench:selection-close', { id: 'selection' })
}

function logGraphData() {
  console.log('pool lane graph data', lfRef.value?.getGraphData())
  console.log('pool lane graph model', lfRef.value?.graphModel)
  console.table(nodeLaneMapRows.value)
}

function buildPlugins() {
  /**
   * 组装当前工作台的插件列表。
   *
   * compare 模式用于同时挂载 DynamicGroup 与 PoolElements，观察二者全局重写能力是否互相影响。
   */
  if (pluginMode.value === 'dynamic-group-only') {
    return [DynamicGroup, SelectionSelect, Control]
  }
  return pluginMode.value === 'compare'
    ? [DynamicGroup, PoolElements, SelectionSelect, Control]
    : [PoolElements, SelectionSelect, Control]
}

function getInitialGraph() {
  return isPoolMode.value ? createPoolGraph(activeScenario.value) : createDynamicGroupGraph()
}

function switchPluginMode(mode: PluginMode) {
  if (pluginMode.value === mode) return
  pluginMode.value = mode
  remountWorkbenchLf()
}

function registerEvents(lf: LogicFlow) {
  const eventNames = [
    'lane:not-allowed',
    'lane:paste-not-allowed',
    'blank:click',
    'edge:click',
    'node:click',
    'node:add',
    'node:drop',
    'node:delete',
    'selection:selected',
    'node:resize',
    'selection:drop',
    'graph:rendered'
  ]

  eventNames.forEach((eventName) => {
    lf.on(eventName, (payload: unknown) => {
      pushEvent(eventName, payload)
    })
  })
}

function destroyWorkbenchLf() {
  resizeObserver?.disconnect()
  resizeObserver = undefined
  lfRef.value?.destroy()
  lfRef.value = null
  delete window.poolLaneLf
}

function mountWorkbenchLf() {
  if (!containerRef.value) return

  const lf = new LogicFlow({
    container: containerRef.value,
    width: containerRef.value.clientWidth,
    height: containerRef.value.clientHeight,
    grid: true,
    allowResize: true,
    multipleSelectKey: 'shift',
    keyboard: {
      enabled: true
    },
    plugins: buildPlugins(),
    pluginsOptions: {
      PoolElements: behaviorOptions.value
    }
  })

  registerEvents(lf)
  lf.render(getInitialGraph())
  lfRef.value = lf
  /**
   * 暴露 LogicFlow 实例到 window，方便验收时在控制台直接调用常用 API。
   */
  window.poolLaneLf = lf
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      lf.resize()
      refreshDebugState()
    })
    resizeObserver.observe(containerRef.value)
  }
  nextTick(() => refreshDebugState())
}

function remountWorkbenchLf() {
  destroyWorkbenchLf()
  activeConfigNodeId.value = undefined
  selectedIds.value = []
  eventLogs.value = []
  rejectLane2.value = false
  nextTick(() => {
    mountWorkbenchLf()
  })
}

onMounted(() => {
  mountWorkbenchLf()
})

onBeforeUnmount(() => {
  destroyWorkbenchLf()
})
</script>

<template>
  <section class="workbench-page full-height">
    <header class="topbar">
      <div>
        <h2>Pool / Lane / DynamicGroup 验证工作台</h2>
        <p>用于逐项观察泳池、泳道、业务节点的归属关系和交互状态。</p>
      </div>
      <div class="top-actions">
        <div class="plugin-mode-actions">
          <button
            :class="{ active: pluginMode === 'pool' }"
            type="button"
            @click="switchPluginMode('pool')"
          >
            只 Pool
          </button>
          <button
            :class="{ active: pluginMode === 'compare' }"
            type="button"
            @click="switchPluginMode('compare')"
          >
            Pool + DynamicGroup
          </button>
          <button
            :class="{ active: pluginMode === 'dynamic-group-only' }"
            type="button"
            @click="switchPluginMode('dynamic-group-only')"
          >
            只 DynamicGroup
          </button>
        </div>
        <el-button v-if="isPoolMode" type="primary" @click="renderScenario('horizontal')">
          横向样例
        </el-button>
        <el-button v-if="isPoolMode" @click="renderScenario('vertical')">纵向样例</el-button>
        <el-button v-if="isPoolMode" @click="renderEmptyPool('horizontal')">空横向 Pool</el-button>
        <el-button v-if="isPoolMode" @click="renderEmptyPool('vertical')">空纵向 Pool</el-button>
        <el-button v-else type="primary" @click="renderDynamicGroupScenario">
          DynamicGroup 样例
        </el-button>
      </div>
    </header>

    <main class="workbench">
      <aside class="panel left-panel">
        <section class="panel-section">
          <h3>拖拽元素</h3>
          <div class="tool-grid">
            <button @mousedown="startDrag('rect')">Rect</button>
            <button @mousedown="startDrag('circle')">Circle</button>
            <button @mousedown="startDrag('diamond')">Diamond</button>
            <button v-if="isPoolMode" @mousedown="startDrag('pool')">Pool</button>
            <button v-if="isDynamicGroupMode" @mousedown="startDrag('dynamic-group')">
              DynamicGroup
            </button>
          </div>
        </section>

        <section v-if="isPoolMode" class="panel-section">
          <h3>Lane 操作</h3>
          <el-button-group>
            <el-button @click="addLane('before')">前方新增</el-button>
            <el-button @click="addLane('after')">后方新增</el-button>
          </el-button-group>
          <el-button class="full-button" type="danger" plain @click="deleteSelectedLane">
            删除选中 Lane
          </el-button>
          <el-button class="full-button" plain @click="toggleSelectedCollapse">
            折叠/展开选中项
          </el-button>
        </section>

        <section v-if="isPoolMode" class="panel-section">
          <h3>行为配置</h3>
          <div class="config-grid">
            <label class="config-row">
              <span>cascadeDeleteChildren</span>
              <el-checkbox v-model="behaviorOptions.cascadeDeleteChildren" />
            </label>
            <label class="config-row">
              <span>minLaneCount</span>
              <el-input-number
                v-model="behaviorOptions.minLaneCount"
                :min="0"
                :max="5"
                size="small"
              />
            </label>
            <label class="config-row">
              <span>collapse.pool</span>
              <el-checkbox v-model="behaviorOptions.collapse.pool" />
            </label>
            <label class="config-row">
              <span>collapse.lane</span>
              <el-checkbox v-model="behaviorOptions.collapse.lane" />
            </label>
          </div>
        </section>

        <section class="panel-section">
          <h3>{{ selectedPanelTitle }}</h3>
          <div v-if="selectedNodeType === 'pool'" class="config-grid">
            <label class="config-row">
              <span>Pool 标题位置</span>
              <el-select
                :model-value="selectedNodeModel?.properties?.titlePosition ?? 'left'"
                size="small"
                @change="
                  (value) => updatePoolPanelConfig({ titlePosition: value as TitlePosition })
                "
              >
                <el-option label="左" value="left" />
                <el-option label="上" value="top" />
                <el-option label="右" value="right" />
                <el-option label="下" value="bottom" />
              </el-select>
            </label>
            <label class="config-row">
              <span>Pool 最小 Lane 数</span>
              <el-input-number
                :model-value="selectedNodeModel?.properties?.minLaneCount ?? 1"
                :min="0"
                :max="10"
                size="small"
                @change="(value) => updatePoolPanelConfig({ minLaneCount: Number(value ?? 0) })"
              />
            </label>
            <label class="config-row">
              <span>Lane 默认标题位置</span>
              <el-select
                :model-value="selectedNodeModel?.properties?.laneConfig?.titlePosition ?? 'left'"
                size="small"
                @change="
                  (value) =>
                    updatePoolPanelConfig({
                      laneConfig: {
                        ...selectedNodeModel?.properties?.laneConfig,
                        titlePosition: value as TitlePosition
                      }
                    })
                "
              >
                <el-option label="左" value="left" />
                <el-option label="上" value="top" />
                <el-option label="右" value="right" />
                <el-option label="下" value="bottom" />
              </el-select>
            </label>
            <label class="config-row">
              <span>折叠间距</span>
              <el-input-number
                :model-value="
                  selectedNodeModel?.properties?.laneConfig?.collapsedLaneGap ?? collapsedLaneGap
                "
                :min="0"
                :max="40"
                size="small"
                @change="
                  (value) =>
                    updatePoolPanelConfig({
                      laneConfig: {
                        ...selectedNodeModel?.properties?.laneConfig,
                        collapsedLaneGap: Number(value ?? 0)
                      }
                    })
                "
              />
            </label>
          </div>
          <div v-else-if="selectedNodeType === 'lane'" class="config-grid">
            <label class="config-row">
              <span>Lane 标题位置</span>
              <el-select
                :model-value="selectedNodeModel?.properties?.titlePosition ?? 'left'"
                size="small"
                @change="
                  (value) => updateLanePanelConfig({ titlePosition: value as TitlePosition })
                "
              >
                <el-option label="左" value="left" />
                <el-option label="上" value="top" />
                <el-option label="右" value="right" />
                <el-option label="下" value="bottom" />
              </el-select>
            </label>
          </div>
          <div v-else-if="selectedNodeType === 'dynamic-group'" class="config-grid">
            <label class="config-row">
              <span>限制子节点拖出</span>
              <el-checkbox
                :model-value="
                  selectedNodeModel?.isRestrict ??
                  selectedNodeModel?.properties?.isRestrict ??
                  false
                "
                @change="(value) => updateDynamicGroupPanelConfig({ isRestrict: Boolean(value) })"
              />
            </label>
            <label class="config-row">
              <span>自动调整尺寸</span>
              <el-checkbox
                :model-value="
                  selectedNodeModel?.autoResize ??
                  selectedNodeModel?.properties?.autoResize ??
                  false
                "
                @change="(value) => updateDynamicGroupPanelConfig({ autoResize: Boolean(value) })"
              />
            </label>
            <label class="config-row">
              <span>容器变换联动子节点</span>
              <el-checkbox
                :model-value="
                  selectedNodeModel?.transformWithContainer ??
                  selectedNodeModel?.properties?.transformWithContainer ??
                  false
                "
                @change="
                  (value) =>
                    updateDynamicGroupPanelConfig({ transformWithContainer: Boolean(value) })
                "
              />
            </label>
            <label class="config-row">
              <span>允许折叠</span>
              <el-checkbox
                :model-value="
                  selectedNodeModel?.collapsible ??
                  selectedNodeModel?.properties?.collapsible ??
                  true
                "
                @change="(value) => updateDynamicGroupPanelConfig({ collapsible: Boolean(value) })"
              />
            </label>
          </div>
          <p v-else class="config-hint">请选择单个 Pool、Lane 或 DynamicGroup 后查看对应配置。</p>
        </section>

        <section class="panel-section selection-panel">
          <h3>框选与异常</h3>
          <div class="selection-actions">
            <el-button type="primary" plain @click="openSelection">空白起点框选</el-button>
            <el-button type="primary" plain @click="openExclusiveSelection">任意起点框选</el-button>
            <el-button plain @click="closeSelection">关闭框选</el-button>
          </div>
          <label class="exception-toggle">
            <span>
              <strong>lane_2 拒绝外部节点</strong>
              <em>用于验证非法投放、归位和事件提示。</em>
            </span>
            <el-checkbox v-model="rejectLane2" @change="patchRejectLane" />
          </label>
          <el-button class="full-button secondary-action" @click="logGraphData">
            打印图数据
          </el-button>
        </section>

        <section class="panel-section">
          <h3>验证项</h3>
          <div v-for="scenario in scenarioInfo" :key="scenario.key" class="check-card">
            <strong>{{ scenario.title }}</strong>
            <ul>
              <li v-for="item in scenario.items" :key="item">{{ item }}</li>
            </ul>
          </div>
        </section>
      </aside>

      <section class="canvas-wrap canvas-fill">
        <div ref="containerRef" class="lf-container canvas-fill" />
      </section>

      <aside class="panel right-panel">
        <section class="panel-section">
          <h3>选中元素</h3>
          <div class="tag-line">
            <el-tag v-for="id in selectedIds" :key="id" effect="plain">{{ id }}</el-tag>
            <span v-if="selectedIds.length === 0" class="muted">未选中</span>
          </div>
        </section>

        <section class="panel-section">
          <h3>Pool children</h3>
          <pre>{{ poolRows }}</pre>
        </section>

        <section class="panel-section">
          <h3>Lane children</h3>
          <pre>{{ laneRows }}</pre>
        </section>

        <section class="panel-section">
          <h3>DynamicGroup children</h3>
          <pre>{{ dynamicGroupRows }}</pre>
        </section>

        <section class="panel-section">
          <h3>Node parent</h3>
          <pre>{{
            childRows.map(({ id, type, parent, x, y }) => ({ id, type, parent, x, y }))
          }}</pre>
        </section>

        <section class="panel-section">
          <h3>nodeLaneMap</h3>
          <pre>{{ nodeLaneMapRows }}</pre>
        </section>

        <section class="panel-section">
          <h3>最近事件</h3>
          <div class="event-list">
            <div v-for="event in eventLogs" :key="`${event.time}-${event.name}-${event.detail}`">
              <span>{{ event.time }}</span>
              <strong>{{ event.name }}</strong>
              <em>{{ event.detail }}</em>
            </div>
          </div>
        </section>

        <section class="panel-section">
          <h3>导出数据</h3>
          <pre class="raw-data">{{ rawDataText }}</pre>
        </section>
      </aside>
    </main>
  </section>
</template>

<style scoped>
.workbench-page {
  height: 100vh;
  padding: 12px;
  color: #1f2937;
  background: #f5f7fb;
  overflow: hidden;
}

.full-height {
  min-height: 100vh;
}

.topbar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #dfe4ec;
  border-radius: 12px;
}

.topbar h2 {
  margin: 0 0 4px;
  font-size: 18px;
}

.topbar p {
  margin: 0;
  color: #667085;
}

.top-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.plugin-mode-actions {
  display: inline-flex;
  padding: 3px;
  background: #eef2f7;
  border: 1px solid #d9e2ef;
  border-radius: 999px;
}

.plugin-mode-actions button {
  padding: 5px 10px;
  color: #475467;
  font-size: 13px;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 999px;
}

.plugin-mode-actions button.active {
  color: #155eef;
  background: #fff;
  box-shadow: 0 1px 3px rgb(16 24 40 / 12%);
}

.workbench {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr) 380px;
  gap: 12px;
  height: calc(100vh - 88px);
  min-height: 0;
}

.panel,
.canvas-wrap {
  min-height: 0;
  background: #fff;
  border: 1px solid #dfe4ec;
  border-radius: 12px;
}

.panel {
  padding: 12px;
  overflow: auto;
}

.panel-section + .panel-section {
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid #edf0f5;
}

.panel-section h3 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #1f2937;
}

.tool-grid,
.move-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.tool-grid button {
  height: 34px;
  color: #1f2937;
  cursor: grab;
  background: #f8fafc;
  border: 1px solid #cfd7e3;
  border-radius: 8px;
}

.full-button {
  width: 100%;
  margin-top: 8px;
}

.config-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: #667085;
}

.config-grid {
  display: grid;
  gap: 10px;
}

.config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  background: #f8fafc;
  border: 1px solid #e5eaf2;
  border-radius: 10px;
}

.config-row > span {
  min-width: 120px;
  color: #344054;
  font-size: 13px;
}

.selection-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

:deep(.selection-actions .el-button) {
  width: 100%;
  margin: 0;
}

.exception-toggle {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin-top: 10px;
  background: #f8fafc;
  border: 1px solid #e5eaf2;
  border-radius: 10px;
}

.exception-toggle span {
  display: grid;
  gap: 2px;
}

.exception-toggle strong {
  color: #344054;
  font-size: 13px;
}

.exception-toggle em {
  color: #667085;
  font-size: 12px;
  font-style: normal;
}

.secondary-action {
  color: #344054;
  background: #fff;
  border-color: #cfd7e3;
}

.check-card {
  padding: 8px;
  background: #f8fafc;
  border: 1px solid #e5eaf2;
  border-radius: 10px;
}

.check-card + .check-card {
  margin-top: 8px;
}

.check-card strong {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
}

.check-card ul {
  padding-left: 18px;
  margin: 0;
  color: #667085;
  font-size: 12px;
}

.canvas-wrap {
  overflow: hidden;
}

.lf-container {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.tag-line {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 24px;
}

.muted {
  color: #98a2b3;
}

pre {
  max-height: 170px;
  padding: 8px;
  margin: 0;
  overflow: auto;
  color: #344054;
  white-space: pre-wrap;
  background: #f8fafc;
  border: 1px solid #edf0f5;
}

.raw-data {
  max-height: 260px;
}

.event-list {
  display: grid;
  gap: 6px;
}

.event-list div {
  display: grid;
  grid-template-columns: 68px 1fr;
  gap: 4px 8px;
  padding: 6px;
  font-size: 12px;
  background: #f8fafc;
  border: 1px solid #edf0f5;
}

.event-list span {
  color: #667085;
}

.event-list strong {
  font-weight: 600;
}

.event-list em {
  grid-column: 2;
  color: #667085;
  font-style: normal;
}
</style>
