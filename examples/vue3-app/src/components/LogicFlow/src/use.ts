import type { LogicFlow } from '@logicflow/core'
import type { InjectionKey } from 'vue'

import { inject, provide } from 'vue'

const symbol = Symbol('LogicFlow') as InjectionKey<LogicFlow>

export function provideLogicFlow(lf: LogicFlow) {
  provide(symbol, lf)
}

export function useLogicFlow(): LogicFlow {
  const lf = inject(symbol, null)
  if (!lf) {
    throw new Error(
      'LogicFlow instance is not provided. Please ensure you have called provideLogicFlow before using useLogicFlow.'
    )
  }
  return lf
}

export function tryLogicFlow(): LogicFlow | null {
  return inject(symbol, null)
}
