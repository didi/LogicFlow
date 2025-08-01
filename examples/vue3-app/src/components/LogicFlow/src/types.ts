import type { LogicFlow, Options } from '@logicflow/core'

export type DefaultOptions = Partial<Options.Common>

export interface LoadEvent {
  lf: LogicFlow
}

export type OnLoad = (e: LoadEvent) => void
