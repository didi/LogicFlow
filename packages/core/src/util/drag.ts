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
  event?: MouseEvent | TouchEvent
  [key: string]: unknown
}

/**
 * 缩放参数
 * scale: 缩放比例
 * x: 缩放中心x坐标
 * y: 缩放中心y坐标
 */
export type IZoomParams = {
  scale?: number
  x: number
  y: number
}

export type ICreateDragParams = {
  onDragStart?: (params: Partial<IDragParams>) => void
  onDragging?: (param: IDragParams) => void
  onDragEnd?: (param: Partial<IDragParams>) => void
  onZoom?: (params: IZoomParams) => void
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

/**
 * 获取两指之间的距离
 * @param touch1
 * @param touch2
 * @returns
 */
const getDistance = (touch1: Touch, touch2: Touch): number => {
  const dx = touch2.clientX - touch1.clientX
  const dy = touch2.clientY - touch1.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 获取两指之间的中心点
 * @param touch1
 * @param touch2
 * @returns
 */
const getCenterPoint = (
  touch1: Touch,
  touch2: Touch,
): { x: number; y: number } => {
  const x = (touch1.clientX + touch2.clientX) / 2
  const y = (touch1.clientY + touch2.clientY) / 2
  return { x, y }
}

export class StepDrag {
  onDragStart: (params: Partial<IDragParams>) => void
  onDragging: (params: IDragParams) => void
  onDragEnd: (params: Partial<IDragParams>) => void
  onZoom: (params: IZoomParams) => void

  element: HTMLElement
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

  // 双指初始距离
  initialDistance = 0
  // 缩放比例
  scale = 1
  // 缩放中心点
  zoomCenterPoint = { x: 0, y: 0 }

  constructor({
    onDragStart = noop,
    onDragging = noop,
    onDragEnd = noop,
    onZoom = noop,
    eventType = '',
    eventCenter,
    step = 1,
    isStopPropagation = true,
    model,
    data,
    element,
  }: IStepperDragProps) {
    this.onDragStart = onDragStart
    this.onDragging = onDragging
    this.onDragEnd = onDragEnd
    this.onZoom = onZoom
    this.step = step
    this.isStopPropagation = isStopPropagation
    this.eventType = eventType
    this.eventCenter = eventCenter
    this.model = model
    this.data = data
    this.element = element as HTMLElement
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

  handleTouchStart = (e: TouchEvent) => {
    if (this.isStopPropagation) e.stopPropagation()
    this.isStartDragging = true
    this.startX = e.touches[0].clientX
    this.startY = e.touches[0].clientY

    // 双指
    if (e.touches.length === 2) {
      this.initialDistance = getDistance(e.touches[0], e.touches[1])
      this.scale = 1
      this.zoomCenterPoint = getCenterPoint(e.touches[0], e.touches[1])
    }

    /**
     * 一个布尔值，设置为 true 时，表示 listener 永远不会调用 preventDefault()。
     * 如果 listener 仍然调用了这个函数，客户端将会忽略它并抛出一个控制台警告。
     */
    this.element.addEventListener('touchmove', this.handleTouchMove, {
      capture: false,
      passive: false,
    })

    this.element.addEventListener('touchend', this.handleTouchEnd, {
      capture: false,
      passive: false,
    })

    const elementData = this.model?.getData()

    this.eventCenter?.emit(EventType[`${this.eventType}_TOUCHSTART`], {
      e,
      data: this.data || elementData,
    })
    this.startTime = new Date().getTime()
  }

  handleTouchMove = (e: TouchEvent) => {
    // 阻止默认事件，防止页面滚动
    e.preventDefault()

    if (this.isStopPropagation) e.stopPropagation()
    if (!this.isStartDragging) return

    // 单指拖拽
    if (e.touches.length === 1) {
      this.sumDeltaX += e.touches[0].clientX - this.startX
      this.sumDeltaY += e.touches[0].clientY - this.startY
      this.startX = e.touches[0].clientX
      this.startY = e.touches[0].clientY

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
        Promise.resolve().then(() => {
          this.onDragging({
            deltaX,
            deltaY,
            event: e,
          })
          this.eventCenter?.emit(EventType[`${this.eventType}_TOUCHMOVE`], {
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
    } else if (e.touches.length === 2) {
      // 双指缩放
      const newDistance = getDistance(e.touches[0], e.touches[1])
      const scaleChange = newDistance / this.initialDistance

      // 判断是放大还是缩小
      if (newDistance > this.initialDistance) {
        console.log('双指向外（放大）')
      } else {
        console.log('双指向内（缩小）')
      }

      this.onZoom({
        scale: scaleChange,
        x: this.zoomCenterPoint.x,
        y: this.zoomCenterPoint.y,
      })

      this.scale *= scaleChange
      this.initialDistance = newDistance
    }
  }

  handleTouchEnd = (e: TouchEvent) => {
    this.isStartDragging = false
    if (this.isStopPropagation) e.stopPropagation()
    // fix #568: 如果onDragging在下一个事件循环中触发，而drop在当前事件循环，会出现问题。
    Promise.resolve().then(() => {
      this.element.removeEventListener('touchmove', this.handleTouchMove, {
        capture: false,
      })
      this.element.removeEventListener('touchend', this.handleTouchEnd, {
        capture: false,
      })
      const elementData = this.model?.getData()
      this.eventCenter?.emit(EventType[`${this.eventType}_TOUCHEND`], {
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
}
