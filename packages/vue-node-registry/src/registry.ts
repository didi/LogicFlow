import LogicFlow from '@logicflow/core'
import { VueNodeView } from './view'
import { VueNodeModel } from './model'

import RegisterConfig = LogicFlow.RegisterConfig

export type VueNodeConfig = {
  type: string
  component: any
  effect?: (keyof LogicFlow.PropertiesType)[]
} & Partial<RegisterConfig>

export const vueNodesMap: Record<
  string,
  {
    component: any
    effect?: (keyof LogicFlow.PropertiesType)[]
  }
> = {}

export function register(config: VueNodeConfig, lf: LogicFlow) {
  const {
    type,
    component,
    effect,
    view: CustomNodeView,
    model: CustomNodeModel,
  } = config

  if (!type) {
    throw new Error('You should specify type in config')
  }
  vueNodesMap[type] = {
    component,
    effect,
  }

  lf.register({
    type,
    view: CustomNodeView || VueNodeView,
    model: CustomNodeModel || VueNodeModel,
  })
}
