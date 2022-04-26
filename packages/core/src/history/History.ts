import {
  debounce, isEqual, last, cloneDeep,
} from 'lodash-es';
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
  model: any;

  constructor(graphModel, isPropertiesChangeHistory) {
    this.eventCenter = graphModel.eventCenter;
    const {
      NODE_ADD,
      EDGE_ADD,
      NODE_DROP,
      EDGE_ADJUST,
      SELECTION_DROP,
      TEXT_DROP,
      NODE_TEXT_UPDATE,
      EDGE_TEXT_UPDATE,
      GRAPH_RENDERED,
      NODE_PROPERTY_UPDATE,
      EDGE_PROPERTY_UPDATE,
      HISTORY_INSERT,
    } = EventType;
    let historyChangeKeys = `
      ${NODE_ADD},
      ${EDGE_ADD},
      ${NODE_DROP},
      ${EDGE_ADJUST},
      ${SELECTION_DROP},
      ${TEXT_DROP},
      ${NODE_TEXT_UPDATE},
      ${EDGE_TEXT_UPDATE},
      ${GRAPH_RENDERED}
    `;
    if (isPropertiesChangeHistory) {
      historyChangeKeys += `,${NODE_PROPERTY_UPDATE},${EDGE_PROPERTY_UPDATE}`;
    }
    this.model = graphModel;
    graphModel.eventCenter.on(historyChangeKeys, this.listenHistoryChange);
    graphModel.eventCenter.on(HISTORY_INSERT, (data) => {
      if (!data) {
        data = this.model.modelToHistoryData();
      }
      this.add(data);
    });
  }

  add(data) {
    // 避免加入相同的快照。
    if (isEqual(last(this.undos), data)) return;
    this.undos.push(data);
    this.redos = [];
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
    this.curData = this.undos[this.undos.length - 1];
    this.emitHistoryChange();
    return cloneDeep(this.curData);
  }

  redoAble() {
    return this.redos.length > 0;
  }

  redo() {
    if (!this.redoAble()) return;
    const curData = this.redos.pop();
    this.curData = curData;
    this.undos.push(this.curData);
    this.emitHistoryChange();
    return curData;
  }

  emitHistoryChange() {
    this.eventCenter.emit(EventType.HISTORY_CHANGE,
      {
        data: {
          undos: this.undos,
          redos: this.redos,
          undoAble: this.undos.length > 1,
          redoAble: this.redos.length > 0,
        },
      });
  }
  listenHistoryChange = () => {
    const data = this.model.modelToHistoryData();
    if (data) {
      this.add(data);
      this.emitHistoryChange();
    }
  };
}

export { History };
export default History;
