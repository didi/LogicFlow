import { EventArgs } from '../type';

export interface EventType {
  readonly callback: Function;
  readonly once: boolean;
}

type EventsType = Record<string, EventType[]>;

export type CallbackType = (...args: any[]) => void;

export { EventEmitter };
/* event-emitter */
export default class EventEmitter {
  private _events: EventsType = {};

  /**
     * 监听一个事件
     * @param evt 事件名称
     * @param callback
     * @param once
     */
  on(evt: string, callback: CallbackType, once?: boolean) {
    evt?.split(',').forEach((evKey) => {
      evKey = evKey.trim();
      if (!this._events[evKey]) {
        this._events[evKey] = [];
      }
      this._events[evKey].push({
        callback,
        once: !!once,
      });
    });
    return this;
  }

  /**
   * 监听一个事件一次
   * @param evt
   * @param callback
   */
  once(evt: string, callback: CallbackType) {
    evt?.split(',').forEach((evKey) => {
      evKey = evKey.trim();
      return this.on(evKey, callback, true);
    });
  }

  /**
     * 触发一个事件
     * @param evt
     * @param args
     */
  emit(evts: string, eventArgs: EventArgs) {
    evts?.split(',').forEach((evt) => {
      evt = evt.trim();
      const events = this._events[evt] || [];
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
    });
  }

  /**
     * 取消监听一个事件，或者一个channel
     * @param evt
     * @param callback
     */
  off(evts?: string, callback?: CallbackType) {
    if (!evts) {
      // evt 为空全部清除
      this._events = {};
    }
    evts.split(',').forEach((evt) => {
      evt = evt.trim();
      if (!callback) {
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
    });
    return this;
  }

  /* 当前所有的事件 */
  getEvents() {
    return this._events;
  }
}
