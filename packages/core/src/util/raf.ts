import { createUuid } from './uuid'

const rafIdMap = new Map()

export const createRaf = (callback: () => void) => {
  const rafId = createUuid()

  function run() {
    callback()
    const eId = rafIdMap.get(rafId)
    if (eId) {
      const nId = window.requestAnimationFrame(run)
      rafIdMap.set(rafId, nId)
    }
  }

  const id = window.requestAnimationFrame(run)
  rafIdMap.set(rafId, id)
  return rafId
}

export const cancelRaf = (rafId: string) => {
  const eId = rafIdMap.get(rafId)
  if (eId) {
    window.cancelAnimationFrame(eId)
    rafIdMap.delete(rafId)
  }
}

/**
 * RAF节流：将高频调用合并为每帧最多执行一次
 * 保留最后一次调用的参数，确保最终状态正确
 */
export const rafThrottle = <T extends (...args: any[]) => void>(fn: T) => {
  let ticking = false
  let lastArgs: Parameters<T> | null = null

  return (...args: Parameters<T>) => {
    lastArgs = args
    if (!ticking) {
      ticking = true
      window.requestAnimationFrame(() => {
        ticking = false
        if (lastArgs) {
          fn(...lastArgs)
          lastArgs = null
        }
      })
    }
  }
}

/**
 * 时间节流：在指定时间间隔内最多执行一次
 */
export const timeThrottle = <T extends (...args: any[]) => void>(
  fn: T,
  delay: number = 16,
) => {
  let lastTime = 0
  let timeoutId: number | null = null
  let lastArgs: Parameters<T> | null = null

  return (...args: Parameters<T>) => {
    const now = Date.now()
    lastArgs = args

    if (now - lastTime >= delay) {
      lastTime = now
      fn(...args)
      lastArgs = null
    } else if (!timeoutId) {
      timeoutId = window.setTimeout(
        () => {
          timeoutId = null
          if (lastArgs) {
            lastTime = Date.now()
            fn(...lastArgs)
            lastArgs = null
          }
        },
        delay - (now - lastTime),
      )
    }
  }
}
