export interface EventType {
  readonly callback: (params?: any) => void
  readonly once: boolean
}

export type EventArgs = Record<string, unknown>
export type EventsType = Record<string, EventType[]>
export type CallbackType = (...args: unknown[]) => void

export default class EventEmitter {
  private _events: EventsType
  constructor() {
    this._events = {}
  }

  /**
   * 添加一个监听事件
   * @param evtKey 事件名称
   * @param callback 回调方法
   * @param once 是否触发一次
   * @returns 当前 EventEmitter 实例
   */
  on(evtKey: string, callback: CallbackType, once?: boolean) {
    evtKey = evtKey.trim()
    if (!this._events[evtKey]) {
      this._events[evtKey] = []
    }
    this._events[evtKey].push({
      callback,
      once: !!once,
    })
  }

  /**
   * 取消监听一个事件，或者一个 Channel
   * @param evtKey
   * @param callback
   */
  off(evtKey: string, callback?: CallbackType) {
    if (!evtKey) {
      // evtKey 为空全部清除
      this._events = {}
    }
    if (!callback) {
      // evtKey 存在，callback 为空，清除事件所有方法
      delete this._events[evtKey]
    } else {
      // evtKey 存在，callback 存在，清除匹配的
      const events = this._events[evtKey] || []
      let { length } = events
      for (let i = 0; i < length; i++) {
        if (events[i].callback === callback) {
          events.splice(i, 1)
          length--
          i--
        }
      }
      if (events.length === 0) {
        delete this._events[evtKey]
      }
    }
  }

  /**
   * 主动触发事件
   * @param evtKey 触发事件名称
   * @param eventArgs 事件参数
   */
  emit(evtKey: string, eventArgs: EventArgs) {
    const events = this._events[evtKey] || []
    // 实际的处理 emit 方法
    const doEmit = (es) => {
      let { length } = es
      for (let i = 0; i < length; i++) {
        if (!es[i]) {
          // eslint-disable-next-line no-continue
          continue
        }
        const { callback, once } = es[i]
        if (once) {
          es.splice(i, 1)
          if (es.length === 0) {
            delete this._events[evtKey]
          }
          length--
          i--
        }
        callback.apply(this, [eventArgs])
      }
    }
    doEmit(events)
  }

  /**
   * 获取当前所有事件
   * @returns _events
   */
  getEvents() {
    return this._events
  }
}

export { EventEmitter }
