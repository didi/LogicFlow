import { noop } from 'lodash-es'
import { Model } from '../model'
import { EventType } from '../constant'
import EventEmitter from '../event/eventEmitter'

// TODO：这种方式在同构项目中，会报错，该如何解决（是否要求用户控制在浏览器环境时才初始化）
// const DOC: any = window?.document
const LEFT_MOUSE_BUTTON_CODE = 0

export type IDragParams = {
  deltaX: number
  deltaY: number
  event: MouseEvent | null
  [key: string]: unknown
}

export type ICreateDragParams = {
  onDragStart?: (params: Partial<IDragParams>) => void
  onDragging?: (param: IDragParams) => void
  onDragEnd?: (param: Partial<IDragParams>) => void
  step?: number
  isStopPropagation?: boolean
}

export type IStepperDragProps = {
  eventType?:
    | 'NODE'
    | 'BLANK'
    | 'SELECTION'
    | 'ADJUST_POINT'
    | 'TEXT'
    | 'LABEL'
    | ''
  eventCenter?: EventEmitter
  model?: Model.BaseModel
  data?: Record<string, unknown>
  [key: string]: unknown
} & Partial<ICreateDragParams>
/**
 * 支持拖拽时按步长进行移动
 * REMIND：在绘制的过程中因为放大缩小，移动的真实 step 是变化的
 */
export class StepperDrag {
  // 初始化
  onDragStart: (params: Partial<IDragParams>) => void
  onDragging: (params: IDragParams) => void
  onDragEnd: (params: Partial<IDragParams>) => void

  step: number
  isStopPropagation: boolean
  eventType:
    | 'NODE'
    | 'BLANK'
    | 'SELECTION'
    | 'ADJUST_POINT'
    | 'TEXT'
    | 'LABEL'
    | ''
  eventCenter?: EventEmitter
  model?: Model.BaseModel
  data?: Record<string, unknown>

  // 运行时
  isDragging: boolean = false
  isStartDrag: boolean = false

  startX: number = 0
  startY: number = 0
  totalDeltaX: number = 0
  totalDeltaY: number = 0

  startTime?: number
  constructor({
    onDragStart = noop,
    onDragging = noop,
    onDragEnd = noop,
    step = 1,
    eventType = '',
    isStopPropagation = true,
    eventCenter,
    model,
    data,
  }: IStepperDragProps) {
    this.onDragStart = onDragStart
    this.onDragging = onDragging
    this.onDragEnd = onDragEnd
    this.step = step
    this.eventType = eventType
    this.isStopPropagation = isStopPropagation
    this.eventCenter = eventCenter
    this.model = model
    this.data = data
  }

  setStep(step: number) {
    this.step = step
  }

  handleMouseMove = (e: MouseEvent) => {
    if (this.isStopPropagation) e.stopPropagation()
    if (!this.isStartDrag) return

    this.totalDeltaX += e.clientX - this.startX
    this.totalDeltaY += e.clientY - this.startY
    this.startX = e.clientX
    this.startY = e.clientY

    if (
      this.step <= 1 ||
      Math.abs(this.totalDeltaX) > this.step ||
      Math.abs(this.totalDeltaY) > this.step
    ) {
      const remainderX = this.totalDeltaX % this.step
      const remainderY = this.totalDeltaY % this.step

      const deltaX = this.totalDeltaX - remainderX
      const deltaY = this.totalDeltaY - remainderY

      this.totalDeltaX = remainderX
      this.totalDeltaY = remainderY

      const elementData = this.model?.getData()
      // REMIND: 为了区分点击和拖动，在鼠标没有拖动时，不触发 dragstart。
      if (!this.isDragging) {
        if (this.eventType) {
          this.eventCenter?.emit(EventType[`${this.eventType}_DRAGSTART`], {
            e,
            data: this.data || elementData,
          })
        }
        this.onDragStart({ event: e })
      }

      this.isDragging = true
      // REMIND: 为了让 dragstart 和 drag 不在同一个事件循环中，将 drag 事件放在下一个任务队列中。
      // TODO: 测试用例是否可覆盖？？？
      Promise.resolve().then(() => {
        this.onDragging({ deltaX, deltaY, event: e })
        if (this.eventType) {
          this.eventCenter?.emit(EventType[`${this.eventType}_MOUSEMOVE`], {
            e,
            data: this.data || elementData,
          })
          this.eventCenter?.emit(EventType[`${this.eventType}_DRAG`], {
            e,
            data: this.data || elementData,
          })
        }
      })
    }
  }

  handleMouseUp = (e: MouseEvent) => {
    const DOC: any = window?.document

    this.isStartDrag = false
    if (this.isStopPropagation) e.stopPropagation()

    // fix: issue#568, 如果 onDragging 在下一个时间循环中触发，而 drop 在当前事件循环，会出现问题
    Promise.resolve().then(() => {
      DOC?.removeEventListener('mousemove', this.handleMouseMove, true)
      DOC?.removeEventListener('mouseup', this.handleMouseUp, true)

      const elementData = this.model?.getData()
      if (this.eventType) {
        this.eventCenter?.emit(EventType[`${this.eventType}_MOUSEUP`], {
          e,
          data: this.data || elementData,
        })
      }

      if (!this.isDragging) return
      this.isDragging = false
      this.onDragEnd({ event: e })
      if (this.eventType) {
        this.eventCenter?.emit(EventType[`${this.eventType}_DROP`], {
          e,
          data: this.data || elementData,
        })
      }
    })
  }

  handleMouseDown = (e: MouseEvent) => {
    const DOC: any = window?.document

    // issue: LogicFlow交流群-3群 8.10 号抛出的事件相关的问题，是否是这引起的？？？
    if (e.button !== LEFT_MOUSE_BUTTON_CODE) return
    if (this.isStopPropagation) e.stopPropagation()

    this.isStartDrag = true
    this.startX = e.clientX
    this.startY = e.clientY

    DOC?.addEventListener('mousemove', this.handleMouseMove, true)
    DOC?.addEventListener('mouseup', this.handleMouseUp, true)

    const elementData = this.model?.getData()
    if (this.eventType) {
      this.eventCenter?.emit(EventType[`${this.eventType}_MOUSEDOWN`], {
        e,
        data: this.data || elementData,
      })
    }
    this.startTime = new Date().getTime()
  }

  cancelDrag = () => {
    const DOC: any = window?.document

    DOC?.removeEventListener('mousemove', this.handleMouseMove, true)
    DOC?.removeEventListener('mouseup', this.handleMouseUp, true)

    this.onDragEnd({ event: null })
    this.isDragging = false
  }
}

export default StepperDrag
