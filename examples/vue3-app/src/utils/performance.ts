/**
 * 获取页面 dom 数量
 * @returns
 */
export const getTotalDOMNumber = () => document.querySelectorAll('*').length

export type PerformanceLongTaskEntry = {
  type: 'longTask'
  eventType: string
  startTime: number
  duration: number
}

/**
 * 监控长任务事件响应时间：耗费了 50 毫秒或更多时间
 * 如果entry.duration > 100， 判断大于100ms，即可认定为长任务，用户就会感觉卡顿
 */
export const startObservingLongTasks = (callback: any) => {
  const observer = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries()
    entries.forEach((entry) => {
      requestIdleCallback(() => {
        callback(entry)
      })
    })
  })
  observer.observe({ entryTypes: ['longtask', 'resource', 'paint'] })
}
