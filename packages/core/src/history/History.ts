import {
  debounce, isEqual, last, cloneDeep,
} from 'lodash-es';
import { deepObserve } from 'mobx-utils';
import EventEmitter from '../event/eventEmitter';
import { EventType } from '../constant/constant';

class History {
  undos = [];
  redos = [];
  callbacks = [];
  stopWatch = null;
  curData = null;
  maxSize = 50;
  // 发生数据变化后，最多再等500ms，把距离上次的数据变更存储起来。
  // 所以waitTime值越小，History对数据变化越敏感，存的undos就越细。
  waitTime = 100;
  eventCenter: EventEmitter;

  constructor(eventCenter) {
    this.eventCenter = eventCenter;
  }

  add(data) {
    if (isEqual(last(this.undos), data)) return;
    this.undos.push(data);
    // 因为undo的时候，会触发add.
    // 所以需要区分这个add是undo触发的，还是用户正常操作触发的。
    // 如果是用户正常操作触发的，需要清空redos
    if (!isEqual(this.curData, data)) {
      this.redos = [];
    }
    this.eventCenter.emit(EventType.HISTORY_CHANGE,
      {
        data: {
          undos: this.undos,
          redos: this.redos,
          undoAble: this.undos.length > 1,
          redoAble: this.redos.length > 0,
        },
      });
    if (this.undos.length > this.maxSize) {
      this.undos.shift();
    }
  }

  undoAble() {
    // undos栈顶就是当前图渲染出来的数据。
    return this.undos.length > 1;
  }
  // 1) undo方法触发
  // 2) graphModel重新渲染nodes和edges
  // 3) graphModel发生变化，触发watch
  // 4) watch触发add
  undo() {
    if (!this.undoAble()) return;
    const preData = this.undos.pop();
    this.redos.push(preData);
    const curData = this.undos.pop();
    this.curData = cloneDeep(curData);
    return curData;
  }

  redoAble() {
    return this.redos.length > 0;
  }

  redo() {
    if (!this.redoAble()) return;
    const curData = this.redos.pop();
    this.curData = cloneDeep(curData);
    return curData;
  }

  watch(model) {
    this.stopWatch && this.stopWatch();

    // 把当前watch的model转换一下数据存起来，无需清空redos。
    this.undos.push(model.modelToGraphData());

    this.stopWatch = deepObserve(model, debounce(() => {
      // 数据变更后，把最新的当前model数据存起来，并清空redos。
      // 因为这个回调函数的触发，一般是用户交互而引起的，所以按正常逻辑需要清空redos。
      const data = model.modelToGraphData();
      this.add(data);
    }, this.waitTime));
  }
}

export { History };
export default History;
