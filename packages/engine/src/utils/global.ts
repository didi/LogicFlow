// 判断当前环境是否为服务端
// const isServer = typeof window === undefined;

// const isServer = process.env.BROWSER === true;

const isInBrowser = typeof window === 'object' && window.window === window

const isInNodeJS = typeof global === 'object' && global.global === global

const isInWebWorker =
  !isInBrowser && typeof self === 'object' && self.constructor

const globalScope: any = (() => {
  if (isInBrowser) {
    return window
  }

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

export {
  // 环境相关方法
  globalScope,
  isInWebWorker,
  isInBrowser,
  isInNodeJS,
}
