import type LogicFlow from '@logicflow/core'
import type { Scenario } from './types'
import { makeGroup, makeNode } from './customNodes'

export const TITLE_HEADER_GROUP_ID = 'th_group'

export type TitleHeaderConfig = {
  textAlign: 'left' | 'center' | 'right'
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
  overflowMode: 'default' | 'autoWrap' | 'ellipsis'
}

export const defaultTitleHeaderConfig: TitleHeaderConfig = {
  textAlign: 'center',
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  overflowMode: 'default',
}

export const TITLE_ALIGN_OPTIONS: {
  value: TitleHeaderConfig['textAlign']
  label: string
}[] = [
  { value: 'left', label: '左对齐 (textAlign: left)' },
  { value: 'center', label: '居中 (textAlign: center)' },
  { value: 'right', label: '右对齐 (textAlign: right)' },
]

/** 场景初始标题；后续请双击标题区域编辑 */
export const TITLE_HEADER_INITIAL_LABEL = '动态分组标题（双击可编辑）'

function configToProperties(config: TitleHeaderConfig) {
  return {
    textStyle: {
      textAlign: config.textAlign,
      wrapPadding: `${config.paddingTop},${config.paddingRight},${config.paddingBottom},${config.paddingLeft}`,
      overflowMode: config.overflowMode,
    },
  }
}

export function buildTitleHeaderGraph(
  config: TitleHeaderConfig = defaultTitleHeaderConfig,
): LogicFlow.GraphConfigData {
  return {
    nodes: [
      {
        ...makeGroup(TITLE_HEADER_GROUP_ID, 480, 300, ['th_child'], {
          width: 420,
          height: 240,
          ...configToProperties(config),
        }),
        text: TITLE_HEADER_INITIAL_LABEL,
        resizable: true,
      },
      makeNode('th_child', 'rect', 480, 320, {
        properties: { width: 80, height: 50 },
      }),
    ],
    edges: [],
  }
}

export function applyTitleHeaderConfig(
  lf: LogicFlow,
  config: TitleHeaderConfig,
) {
  const group = lf.getNodeModelById(TITLE_HEADER_GROUP_ID) as
    | {
        setProperties: (p: Record<string, unknown>) => void
        setTextPosition: () => void
      }
    | undefined

  if (!group) {
    return false
  }

  group.setProperties(configToProperties(config))
  group.setTextPosition()
  return true
}

export function logTitleHeaderInfo(lf: LogicFlow) {
  const group = lf.getNodeModelById(TITLE_HEADER_GROUP_ID) as
    | {
        width?: number
        height?: number
        collapsible?: boolean
        text?: { x: number; y: number; value: string }
        properties?: Record<string, unknown>
        getTextStyle?: () => Record<string, unknown>
      }
    | undefined

  if (!group) {
    alert('未找到 th_group')
    return
  }

  const style = group.getTextStyle?.() ?? {}
  const text = group.text

  const lines = [
    `分组: ${TITLE_HEADER_GROUP_ID}`,
    `size: ${group.width} x ${group.height}`,
    `textStyle.textAlign: ${style.textAlign ?? '-'}`,
    `textStyle.wrapPadding: ${style.wrapPadding ?? '-'}`,
    `textStyle.overflowMode: ${style.overflowMode ?? 'default'}`,
    `text: "${text?.value ?? ''}" @ (${text?.x}, ${text?.y})`,
    `collapsible: ${group.collapsible ?? true}`,
  ]

  console.log('[title-header]', { group, style })
  alert(lines.join('\n'))
}

export const titleHeaderScenario: Scenario = {
  id: 'title-header',
  title: '标题栏（折叠按钮 + CSS 对齐）',
  issues: ['LOCAL-title-header'],
  fixedIssues: ['LOCAL-title-header'],
  expectedBug:
    '验收顶栏布局：折叠按钮与标题容器合计宽度等于节点宽度；通过 properties.textStyle 的 textAlign / wrapPadding 控制对齐与内边距。',
  steps: [
    '1. 切换 textAlign（left / center / right），观察标题在标题栏内的对齐。',
    '2. 调整 wrapPadding 四向数值，观察标题区域内边距。',
    '3. 拖 resize 改变分组宽度，顶栏仍铺满节点宽度，按钮与标题同行。',
    '4. 双击标题区域编辑文本（需画布已开启 textEdit）。',
    '5. 切换 overflowMode 为 autoWrap / ellipsis，长文本在标题栏内换行或省略。',
    '6. 折叠 / 展开：顶栏在折叠尺寸下仍保持按钮 + 标题布局。',
    '7. 点击「打印文本信息」核对 textStyle 与 text 锚点。',
  ],
  graphData: buildTitleHeaderGraph(defaultTitleHeaderConfig),
}
