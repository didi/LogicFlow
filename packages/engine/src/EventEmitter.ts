export default class EventEmitter {
  _events: Record<string, any>;
  constructor() {
    this._events = {};
  }
  on(evKey, callback, once = false) {
    evKey = evKey.trim();
    if (!this._events[evKey]) {
      this._events[evKey] = [];
    }
    this._events[evKey].push({
      callback,
      once: !!once,
    });
  }
  emit(evt, eventArgs) {
    const events = this._events[evt] || [];
    // 实际的处理 emit 方法
    const doEmit = (es) => {
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
  }
  off(evt, callback) {
    if (!evt) {
      // evt 为空全部清除
      this._events = {};
    }
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
  }
}
