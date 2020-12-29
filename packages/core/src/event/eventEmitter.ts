import { EventArgs } from '../type';

export interface EventType {
  readonly callback: Function;
  readonly once: boolean;
}

type EventsType = Record<string, EventType[]>;

export type CallbackType = (...args: any[]) => void;

const WILDCARD = '*';

export { EventEmitter };
/* event-emitter */
export default class EventEmitter {
  private _events: EventsType = {};

  /**
     * 监听一个事件
     * @param evt
     * @param callback
     * @param once
     */
  on(evt: string, callback: CallbackType, once?: boolean) {
    if (!this._events[evt]) {
      this._events[evt] = [];
    }
    this._events[evt].push({
      callback,
      once: !!once,
    });
    return this;
  }

  /**
     * 监听一个事件一次
     * @param evt
     * @param callback
     */
  once(evt: string, callback: CallbackType) {
    return this.on(evt, callback, true);
  }

  /**
     * 触发一个事件
     * @param evt
     * @param args
     */
  emit(evt: string, eventArgs: EventArgs) {
    const events = this._events[evt] || [];
    const wildcardEvents = this._events[WILDCARD] || [];

    // 实际的处理 emit 方法
    const doEmit = (es: EventType[]) => {
      let { length } = es;
      for (let i = 0; i < length; i++) {
        if (!es[i]) {
          // eslint-disable-next-line no-continue
          continue;
        }
        const { callback, once } = es[i];

        if (once) {
          es.splice(i, 1);

          if (es.length === 0) {
            delete this._events[evt];
          }

          length--;
          i--;
        }

        callback.apply(this, [eventArgs]);
      }
    };

    doEmit(events);
    doEmit(wildcardEvents);
  }

  /**
     * 取消监听一个事件，或者一个channel
     * @param evt
     * @param callback
     */
  off(evt?: string, callback?: CallbackType) {
    if (!evt) {
      // evt 为空全部清除
      this._events = {};
    } else if (!callback) {
      // evt 存在，callback 为空，清除事件所有方法
      delete this._events[evt];
    } else {
      // evt 存在，callback 存在，清除匹配的
      const events = this._events[evt] || [];

      let { length } = events;
      for (let i = 0; i < length; i++) {
        if (events[i].callback === callback) {
          events.splice(i, 1);
          length--;
          i--;
        }
      }

      if (events.length === 0) {
        delete this._events[evt];
      }
    }

    return this;
  }

  /* 当前所有的事件 */
  getEvents() {
    return this._events;
  }
}
