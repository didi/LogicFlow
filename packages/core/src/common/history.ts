import { cloneDeep, debounce, isEqual, last } from 'lodash-es'
import { deepObserve, IDisposer } from 'mobx-utils'
import { LogicFlow } from '../LogicFlow'
// import { EventType } from '../constant'
import { GraphModel } from '../model'
import EventEmitter from '../event/eventEmitter'

export type HistoryData = LogicFlow.GraphConfigData

export class History {
  undos: HistoryData[] = []
  redos: HistoryData[] = []
  stopWatch: IDisposer | null = null
  curData: HistoryData | null = null
  maxSize: number = 50
  // 发生数据变化后，最多再等 500ms，把距离上次的数据变更存储起来。
  // 所以 waitTime 值越小，History 对数据变化越敏感，存的 undos 数据就越细
  waitTime: number = 100
  eventCenter: EventEmitter

  constructor(eventCenter: EventEmitter) {
    this.eventCenter = eventCenter
  }

  add(data: HistoryData) {
    if (isEqual(last(this.undos), data)) return
    this.undos.push(data)

    // 因为 undo 的时候会触发 add.
    // 所以需要区分这个 add 是 undo 触发的还是用户正常操作触发的
    // 如果是用户正常操作触发的，需要清空 redos
    if (!isEqual(this.curData, data)) {
      this.redos = []
    }
    // this.eventCenter.emit(EventType.HISTORY_CHANGE, {
    //   data: {
    //     undos: this.undos,
    //     redos: this.redos,
    //     undoAble: this.undos.length > 1,
    //     redoAble: this.redos.length > 0,
    //   },
    // })

    if (this.undos.length > this.maxSize) {
      this.undos.shift()
    }
  }

  undoAble() {
    return this.undos.length > 1
  }

  /**
   * undo 方法触发：
   * graphModel 重新渲染 nodes 和 edges
   * graphModel 发生变化，触发 watch
   * watch 触发 add
   */
  undo() {
    if (!this.undoAble()) return
    const preData = this.undos.pop()
    if (preData) {
      this.redos.push(preData)
    }
    const curData = this.undos.pop()
    if (curData) {
      this.curData = cloneDeep(curData)
    }
    return curData
  }

  redoAble() {
    return this.redos.length > 0
  }

  redo() {
    if (!this.redoAble()) return
    const curData = this.redos.pop()
    if (curData) {
      this.curData = cloneDeep(curData)
    }
    return curData
  }

  watch(model: GraphModel) {
    this.stopWatch && this.stopWatch()

    // 把当前 watch 的 model 转换一下数据存起来，无需清空 redos
    const historyData = model.modelToHistoryData()
    if (historyData) {
      this.undos.push(historyData)
    }

    this.stopWatch = deepObserve(
      model,
      debounce(() => {
        // 数据变更后，把最新的当前 model 数据存起来，并清空 redos
        // 因为这个回调函数的触发，一般是用户交互而引起的，所以按照正常逻辑需要清空 redos
        const data = model.modelToHistoryData()
        if (data) {
          this.add(data)
        }
      }, this.waitTime),
    )
  }
}

export default History
