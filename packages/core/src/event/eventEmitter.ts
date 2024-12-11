import { EventArgs } from './eventArgs'

export type EventType<T extends string = string> = {
  readonly callback: EventCallback<T>
  readonly once: boolean
}

export type EventsType<T extends string = string> = {
  [k in T]?: EventType<k>[]
}

export type CallbackArgs<T extends string = string> = T extends keyof EventArgs
  ? EventArgs[T]
  : // 如果不是内部定义的事件类型，那么允许用户抛出任何类型的参数
    // 这部分的类型定义由用户自己来保证
    any

export type EventCallback<T extends string = string> = (
  args: CallbackArgs<T>,
) => void

const WILDCARD = '*'

/* event-emitter */
export default class EventEmitter {
  private _events: EventsType = {}

  /**
   * 监听一个事件
   * @param evt 事件名称
   * @param callback 回调函数
   * @param once 是否只监听一次
   */
  on<T extends keyof EventArgs>(
    evt: T,
    callback: EventCallback<T>,
    once?: boolean,
  ): void
  on<T extends string>(evt: T, callback: EventCallback<T>, once?: boolean): void
  on(evt: string, callback: EventCallback, once?: boolean) {
    evt?.split(',').forEach((evKey) => {
      evKey = evKey.trim()
      if (!this._events[evKey]) {
        this._events[evKey] = []
      }
      this._events[evKey]!.push({
        callback,
        once: !!once,
      })
    })
  }

  /**
   * 监听一个事件一次
   * @param evt 事件名称
   * @param callback 回调函数
   */
  once<T extends keyof EventArgs>(
    evt: T,
    callback: (args: EventArgs[T]) => void,
  ): void
  once<T extends string>(evt: T, callback: EventCallback<T>): void
  once(evt: string, callback: EventCallback) {
    evt?.split(',').forEach((evKey) => {
      evKey = evKey.trim()
      this.on(evKey, callback, true)
    })
  }

  /**
   * 触发一个事件
   * @param evts
   * @param eventArgs
   */
  emit<T extends keyof EventArgs>(evts: T, eventArgs: CallbackArgs<T>): void
  emit<T extends string>(evts: T, eventArgs: CallbackArgs<T>): void
  emit(evts: string, eventArgs?: EventCallback) {
    evts?.split(',').forEach((evt) => {
      const events = this._events[evt] || []
      const wildcardEvents = this._events[WILDCARD] || []
      // 实际的处理 emit 方法
      const doEmit = (es: EventType[]) => {
        let { length } = es
        for (let i = 0; i < length; i++) {
          if (!es[i]) {
            continue
          }
          const { callback, once } = es[i]
          if (once) {
            es.splice(i, 1)
            if (es.length === 0) {
              delete this._events[evt]
            }
            length--
            i--
          }
          callback.apply(this, [eventArgs])
        }
      }
      doEmit(events)
      doEmit(wildcardEvents)
    })
  }

  /**
   * 取消事件监听
   * @param evts 事件名称
   * @param callback 回调函数
   *
   * - evts 为空时，清除所有事件的监听器
   * - evts 非空，callback 为空时，清除指定事件的所有监听器
   * - evts 非空，callback 非空，进行对象比较，清除指定事件的指定监听器
   */
  off<T extends keyof EventArgs>(
    evts: T,
    callback?: (args: EventArgs[T]) => void,
  ): void
  off<T extends string>(evts: T, callback?: EventCallback<T>): void
  off(evts: string, callback?: EventCallback) {
    if (!evts) {
      // evt 为空全部清除
      this._events = {}
    }
    evts.split(',').forEach((evt) => {
      if (!callback) {
        // evt 存在，callback 为空，清除事件所有方法
        delete this._events[evt]
      } else {
        // evt 存在，callback 存在，清除匹配的
        const events = this._events[evt] || []
        let { length } = events
        for (let i = 0; i < length; i++) {
          if (events[i].callback === callback) {
            events.splice(i, 1)
            length--
            i--
          }
        }
        if (events.length === 0) {
          delete this._events[evt]
        }
      }
    })
  }

  /* 当前所有的事件 */
  getEvents() {
    return this._events
  }

  destroy() {
    this._events = {}
  }
}

export { EventEmitter, EventArgs }
