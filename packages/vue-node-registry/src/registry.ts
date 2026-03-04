import LogicFlow, { GraphModel } from '@logicflow/core'
import { VueNodeView } from './view'
import { VueNodeModel } from './model'

import RegisterConfig = LogicFlow.RegisterConfig

export type VueNodeConfig = {
  type: string
  component: any
  effect?: (keyof LogicFlow.PropertiesType)[]
} & Partial<RegisterConfig>

type VueNodeEntry = {
  component: any
  effect?: (keyof LogicFlow.PropertiesType)[]
}

// Per-instance map: entries are eligible for garbage collection once the associated GraphModel instance is no longer referenced
const vueNodesMaps = new WeakMap<GraphModel, Map<string, VueNodeEntry>>()

/**
 * @deprecated Use {@link getVueNodeConfig} instead for multi-instance support.
 * This global map is still populated for backward compatibility but does NOT
 * isolate registrations across different LogicFlow instances.
 */
export const vueNodesMap: Record<string, VueNodeEntry> = Object.create(
  null,
) as Record<string, VueNodeEntry>

/**
 * Retrieve the Vue node configuration scoped to a specific LogicFlow instance.
 */
export function getVueNodeConfig(
  type: string,
  graphModel?: GraphModel | null,
): VueNodeEntry | undefined {
  if (typeof graphModel !== 'object' || graphModel === null) {
    return undefined
  }
  return vueNodesMaps.get(graphModel)?.get(type)
}

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

  const entry: VueNodeEntry = { component, effect }

  // Scope to this LogicFlow instance
  let map = vueNodesMaps.get(lf.graphModel)
  if (!map) {
    map = new Map<string, VueNodeEntry>()
    vueNodesMaps.set(lf.graphModel, map)
  }
  map.set(type, entry)

  // Also populate global map for backward compatibility
  vueNodesMap[type] = entry

  lf.register({
    type,
    view: CustomNodeView || VueNodeView,
    model: CustomNodeModel || VueNodeModel,
  })
}
