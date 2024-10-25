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
  event?: MouseEvent
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
  model?: Model.BaseModel | unknown
  data?: Record<string, unknown>
  [key: string]: unknown
} & Partial<ICreateDragParams>

// 支持拖拽的时候，按照指定step进行。
// 因为在绘制的过程中因为放大缩小，移动的真实的step则是变化的。
export class StepDrag {
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
  model?: Model.BaseModel | any // TODO: 如何兼容 LabelModel 类型。 LabelModel 能否是 BaseModel 的实现呢？
  data?: Record<string, unknown>

  // 运行时
  isDragging = false
  isStartDragging = false

  startX = 0
  startY = 0
  sumDeltaX = 0
  sumDeltaY = 0

  startTime?: number

  constructor({
    onDragStart = noop,
    onDragging = noop,
    onDragEnd = noop,
    eventType = '',
    eventCenter,
    step = 1,
    isStopPropagation = true,
    model,
    data,
  }: IStepperDragProps) {
    this.onDragStart = onDragStart
    this.onDragging = onDragging
    this.onDragEnd = onDragEnd
    this.step = step
    this.isStopPropagation = isStopPropagation
    this.eventType = eventType
    this.eventCenter = eventCenter
    this.model = model
    this.data = data
  }

  setStep(step: number) {
    this.step = step
  }

  setModel(model: Model.BaseModel) {
    this.model = model
  }

  handleMouseDown = (e: MouseEvent) => {
    const DOC: any = window?.document
    if (e.button !== LEFT_MOUSE_BUTTON_CODE) return
    if (this.isStopPropagation) e.stopPropagation()
    this.isStartDragging = true
    this.startX = e.clientX
    this.startY = e.clientY

    DOC.addEventListener('mousemove', this.handleMouseMove, false)
    DOC.addEventListener('mouseup', this.handleMouseUp, false)
    const elementData = this.model?.getData()
    this.eventCenter?.emit(EventType[`${this.eventType}_MOUSEDOWN`], {
      e,
      data: this.data || elementData,
    })
    this.startTime = new Date().getTime()
  }

  handleMouseMove = (e: MouseEvent) => {
    if (this.isStopPropagation) e.stopPropagation()
    if (!this.isStartDragging) return
    this.sumDeltaX += e.clientX - this.startX
    this.sumDeltaY += e.clientY - this.startY
    this.startX = e.clientX
    this.startY = e.clientY
    if (
      this.step <= 1 ||
      Math.abs(this.sumDeltaX) > this.step ||
      Math.abs(this.sumDeltaY) > this.step
    ) {
      const remainderX = this.sumDeltaX % this.step
      const remainderY = this.sumDeltaY % this.step
      const deltaX = this.sumDeltaX - remainderX
      const deltaY = this.sumDeltaY - remainderY
      this.sumDeltaX = remainderX
      this.sumDeltaY = remainderY
      const elementData = this.model?.getData()
      /**
       * 为了区分点击和拖动，在鼠标没有拖动时，不触发dragstart。
       */
      if (!this.isDragging) {
        this.eventCenter?.emit(EventType[`${this.eventType}_DRAGSTART`], {
          e,
          data: this.data || elementData,
        })
        this.onDragStart({ event: e })
      }
      this.isDragging = true
      // 为了让dragstart和drag不在同一个事件循环中，使drag事件放到下一个消息队列中。
      // TODO: 放到下一个消息队列中是否会有延迟，比如
      // 限制某个元素的拖拽范围，如果在dragstart中设置了拖拽范围，那么在drag中就会有延迟。
      Promise.resolve().then(() => {
        this.onDragging({
          deltaX,
          deltaY,
          event: e,
        })
        this.eventCenter?.emit(EventType[`${this.eventType}_MOUSEMOVE`], {
          deltaX,
          deltaY,
          e,
          data: this.data || elementData,
        })
        this.eventCenter?.emit(EventType[`${this.eventType}_DRAG`], {
          e,
          data: this.data || elementData,
        })
      })
    }
  }

  handleMouseUp = (e: MouseEvent) => {
    const DOC = window.document

    this.isStartDragging = false
    if (this.isStopPropagation) e.stopPropagation()
    // fix #568: 如果onDragging在下一个事件循环中触发，而drop在当前事件循环，会出现问题。
    Promise.resolve().then(() => {
      DOC.removeEventListener('mousemove', this.handleMouseMove, false)
      DOC.removeEventListener('mouseup', this.handleMouseUp, false)
      const elementData = this.model?.getData()
      this.eventCenter?.emit(EventType[`${this.eventType}_MOUSEUP`], {
        e,
        data: this.data || elementData,
      })
      if (!this.isDragging) return
      this.isDragging = false
      this.onDragEnd({ event: e })
      this.eventCenter?.emit(EventType[`${this.eventType}_DROP`], {
        e,
        data: this.data || elementData,
      })
    })
  }
  cancelDrag = () => {
    const DOC: any = window?.document

    DOC.removeEventListener('mousemove', this.handleMouseMove, false)
    DOC.removeEventListener('mouseup', this.handleMouseUp, false)
    this.onDragEnd({ event: undefined })
    this.isDragging = false
  }

  destroy = () => {
    if (this.isStartDragging) {
      // https://github.com/didi/LogicFlow/issues/1934
      // https://github.com/didi/LogicFlow/issues/1926
      // cancelDrag()->onDragEnd()->updateEdgePointByAnchors()触发线的重新计算
      // 我们的本意是为了防止mousemove和mouseup没有及时被移除
      // 因此这里增加if(this.isStartDragging)的判断，isStartDragging=true代表没有触发handleMouseUp()，此时监听还没被移除
      // 在拖拽情况下(isStartDragging=true)，此时注册了监听，在组件突然销毁时，强制触发cancelDrag进行监听事件的移除
      this.cancelDrag()
    }
  }
}
