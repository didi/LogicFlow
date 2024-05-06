import { runInBrowserContext } from './browserVm'

const isInBrowser = typeof window === 'object' && window.window === window

const globalScope: any = (() => {
  if (isInBrowser) {
    return window
  }

  if (typeof self === 'object' && self.self === self) {
    return self
  }

  if (typeof globalThis === 'object') {
    return globalThis
  }

  return {
    eval: () => undefined,
  } as Record<string, unknown>
})()

const getExpressionResult = async (code: string, context: any) => {
  const r = await runInBrowserContext(code, context)
  return r
}

export { isInBrowser, globalScope, getExpressionResult }
