import LogicFlow, { BaseNodeModel, GraphModel } from '@logicflow/core'
import ReactNodeView from './view'
import ReactNodeModel from './model'
import RegisterConfig = LogicFlow.RegisterConfig

export type ReactNodeProps = {
  node: BaseNodeModel
  graph: GraphModel
}

export type ReactNodeConfig = {
  type: string
  component: React.ComponentType<ReactNodeProps>
  effect?: (keyof LogicFlow.PropertiesType)[]
} & Partial<RegisterConfig>

export const reactNodesMap: Record<
  string,
  {
    component: React.ComponentType<ReactNodeProps>
    effect?: (keyof LogicFlow.PropertiesType)[]
  }
> = {}

export function register(config: ReactNodeConfig, lf: LogicFlow) {
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
  reactNodesMap[type] = {
    component,
    effect,
  }

  lf.register({
    type,
    view: CustomNodeView || ReactNodeView,
    model: CustomNodeModel || ReactNodeModel,
  })
}
