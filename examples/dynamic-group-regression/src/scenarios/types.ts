import type LogicFlow from '@logicflow/core'
import type { GraphConfigData } from '@logicflow/core'

export type ScenarioAction = {
  key: string
  label: string
  description?: string
  run: (lf: LogicFlow) => void
}

export type Scenario = {
  id: string
  title: string
  issues: string[]
  /** issues 中已修复的子集 */
  fixedIssues?: string[]
  /** issues 中当前无法复现的子集 */
  unreproducibleIssues?: string[]
  expectedBug: string
  steps: string[]
  graphData: GraphConfigData
  /** 切换场景前注册自定义节点等 */
  prepare?: (lf: LogicFlow) => void
  /** render 完成后执行（如 addChild 等需图已加载的操作） */
  afterRender?: (lf: LogicFlow) => void
  actions?: ScenarioAction[]
}
