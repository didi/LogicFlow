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
