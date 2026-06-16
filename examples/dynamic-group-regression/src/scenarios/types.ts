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
  expectedBug: string
  steps: string[]
  graphData: GraphConfigData
  /** 切换场景前注册自定义节点等 */
  prepare?: (lf: LogicFlow) => void
  actions?: ScenarioAction[]
}
