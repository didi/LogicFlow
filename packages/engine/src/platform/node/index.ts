import { runInNodeContext } from './nodeVm'

const isInNodeJS = typeof global === 'object' && global.global === global

const globalScope: any = (() => {
  if (typeof self === 'object' && self.self === self) {
    return self
  }

  if (isInNodeJS) {
    return global
  }

  if (typeof globalThis === 'object') {
    return globalThis
  }

  return {
    eval: () => undefined,
  } as Record<string, unknown>
})()

const getExpressionResult = async (code: string, context: any) => {
  const r = await runInNodeContext(code, context)
  return r
}

export { isInNodeJS, globalScope, getExpressionResult }
