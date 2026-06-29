import type LogicFlow from '@logicflow/core'
import type { Scenario } from './types'
import { makeGroup, makeNode } from './customNodes'

export const RESIZE_BOUNDS_GROUP_ID = 'rb_group'

export type ResizeBoundsConfig = {
  isRestrict: boolean
  autoResize: boolean
}

export const defaultResizeBoundsConfig: ResizeBoundsConfig = {
  isRestrict: false,
  autoResize: false,
}

export function buildResizeBoundsGraph(
  config: ResizeBoundsConfig,
): LogicFlow.GraphConfigData {
  const childIds = ['rb_child_a', 'rb_child_b']
  const groupNode = makeGroup(RESIZE_BOUNDS_GROUP_ID, 420, 280, childIds, {
    width: 380,
    height: 260,
    isRestrict: config.isRestrict,
    autoResize: config.autoResize,
  })
  return {
    nodes: [
      groupNode,
      makeNode('rb_child_a', 'rect', 340, 240, {
        properties: { width: 100, height: 60 },
      }),
      makeNode('rb_child_b', 'rect', 500, 320, {
        properties: { width: 100, height: 60 },
      }),
    ],
    edges: [],
  }
}

export function logResizeBoundsInfo(lf: LogicFlow) {
  const group = lf.getNodeModelById(RESIZE_BOUNDS_GROUP_ID) as
    | {
        width?: number
        height?: number
        x?: number
        y?: number
        isRestrict?: boolean
        autoResize?: boolean
        properties?: Record<string, unknown>
        getBounds?: () => {
          minX: number
          minY: number
          maxX: number
          maxY: number
        }
      }
    | undefined

  if (!group) {
    alert('未找到验收分组 rb_group')
    return
  }

  const props = group.properties ?? {}
  const bounds = group.getBounds?.()
  const childLines = ['rb_child_a', 'rb_child_b'].map((id) => {
    const child = lf.getNodeModelById(id) as
      | {
          getBounds?: () => {
            minX: number
            minY: number
            maxX: number
            maxY: number
          }
        }
      | undefined
    const b = child?.getBounds?.()
    return b
      ? `${id}: [${b.minX.toFixed(0)}, ${b.minY.toFixed(0)}] - [${b.maxX.toFixed(0)}, ${b.maxY.toFixed(0)}]`
      : `${id}: (missing)`
  })

  const lines = [
    `分组: ${RESIZE_BOUNDS_GROUP_ID}`,
    `size: ${group.width} x ${group.height}`,
    `center: (${group.x}, ${group.y})`,
    `isRestrict: ${group.isRestrict ?? props.isRestrict ?? false}`,
    `autoResize: ${group.autoResize ?? props.autoResize ?? false}`,
    bounds
      ? `group bounds: [${bounds.minX.toFixed(0)}, ${bounds.minY.toFixed(0)}] - [${bounds.maxX.toFixed(0)}, ${bounds.maxY.toFixed(0)}]`
      : '',
    '--- 子节点 bounds ---',
    ...childLines,
  ].filter(Boolean)

  console.log('[resize-bounds]', { group, childLines })
  alert(lines.join('\n'))
}

export function syncResizeBoundsMembership(lf: LogicFlow) {
  const group = lf.getNodeModelById(RESIZE_BOUNDS_GROUP_ID) as
    | { addChild: (id: string) => void }
    | undefined
  group?.addChild('rb_child_a')
  group?.addChild('rb_child_b')
}

export const resizeBoundsScenario: Scenario = {
  id: 'resize-bounds',
  title: 'DG 缩小 resize 最小边界',
  issues: ['LOCAL-resize-bounds'],
  expectedBug:
    '验收项：缩小分组时外框不得小于子节点占地面积（默认行为，不依赖 isRestrict）；isRestrict 仅限制子节点拖出分组。',
  steps: [
    '1. 默认 isRestrict=false、autoResize=false：选中分组，拖右下角缩小，应无法缩到子节点以下。',
    '2. 仅勾选 isRestrict：子节点应无法拖出分组（硬边界）。',
    '3. 同时勾选 isRestrict + autoResize：子节点可拖出框外，分组随子节点移动自动扩大（现有行为）。',
    '4. 取消 isRestrict：子节点可拖出分组，缩小 resize 仍受最小边界约束。',
    '5. 点击「打印分组信息」核对 isRestrict / autoResize 与 bounds。',
  ],
  graphData: buildResizeBoundsGraph(defaultResizeBoundsConfig),
}
