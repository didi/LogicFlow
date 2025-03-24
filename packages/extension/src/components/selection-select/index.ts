import LogicFlow from '@logicflow/core'

import Position = LogicFlow.Position
import PointTuple = LogicFlow.PointTuple

export class SelectionSelect {
  static pluginName = 'selectionSelect'
  private container?: HTMLElement
  private wrapper?: HTMLElement
  private lf: LogicFlow
  private startPoint?: Position
  private endPoint?: Position
  private disabled = true
  private isWholeNode = true
  private isWholeEdge = true
  // 用于区分选区和点击事件
  private mouseDownInfo: {
    x: number
    y: number
    time: number
  } | null = null

  constructor({ lf }: LogicFlow.IExtensionProps) {
    this.lf = lf
    // TODO: 有没有既能将方法挂载到lf上，又能提供类型提示的方法？
    lf.openSelectionSelect = () => {
      this.openSelectionSelect()
    }
    lf.closeSelectionSelect = () => {
      this.closeSelectionSelect()
    }
  }

  render(_: LogicFlow, domContainer: HTMLElement) {
    this.container = domContainer
  }

  onToolContainerMouseDown = (e: MouseEvent) => {
    // 避免在其他插件元素上点击时开启选区
    if (e.target !== this.container) {
      return
    }
    this.mouseDownInfo = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    }
    const lf = this.lf
    const domContainer = this.container
    if (!domContainer) {
      return
    }
    if (this.disabled) {
      return
    }
    // 禁用右键框选，修复可能导致画布出现多个框选框不消失的问题，见https://github.com/didi/LogicFlow/issues/985
    const isRightClick = e.button === 2
    if (isRightClick) {
      return
    }
    const {
      domOverlayPosition: { x, y },
    } = lf.getPointByClient(e.clientX, e.clientY)
    this.startPoint = {
      x,
      y,
    }
    this.endPoint = {
      x,
      y,
    }
    const wrapper = document.createElement('div')
    wrapper.className = 'lf-selection-select'
    wrapper.oncontextmenu = function prevent(ev: MouseEvent) {
      ev.preventDefault()
    }
    wrapper.style.top = `${this.startPoint.y}px`
    wrapper.style.left = `${this.startPoint.x}px`
    domContainer.appendChild(wrapper)
    this.wrapper = wrapper
    document.addEventListener('mousemove', this.draw)
    document.addEventListener('mouseup', this.drawOff)
  }

  onToolContainerMouseUp = (e: MouseEvent) => {
    if (this.mouseDownInfo) {
      const { x, y, time } = this.mouseDownInfo
      const now = Date.now()
      // 用 mouseDown 和 mouseUp 的位置偏移及时间间隔来判断是否是点击事件
      const isClickEvent =
        Math.abs(e.clientX - x) < 10 &&
        Math.abs(e.clientY - y) < 10 &&
        now - time < 100
      if (isClickEvent) {
        this.lf.clearSelectElements()
      }
      this.mouseDownInfo = null
    }
  }

  /**
   * 设置选中的灵敏度
   * @param isWholeEdge 是否要边的起点终点都在选区范围才算选中。默认true
   * @param isWholeNode 是否要节点的全部点都在选区范围才算选中。默认true
   */
  setSelectionSense(isWholeEdge = true, isWholeNode = true) {
    this.isWholeEdge = isWholeEdge
    this.isWholeNode = isWholeNode
  }

  /**
   * 开启选区
   */
  openSelectionSelect() {
    if (!this.disabled) {
      this.closeSelectionSelect()
    }
    if (!this.container) {
      return
    }
    this.mouseDownInfo = null
    this.container.addEventListener('mousedown', this.onToolContainerMouseDown)
    this.container.addEventListener('mouseup', this.onToolContainerMouseUp)
    // 取消点击事件的穿透，只让 ToolOverlay 接收事件，避免与图形元素的事件冲突
    this.container.style.pointerEvents = 'auto'
    this.open()
  }

  /**
   * 关闭选区
   */
  closeSelectionSelect() {
    if (!this.container) {
      return
    }
    this.container.style.pointerEvents = 'none'
    this.mouseDownInfo = null
    this.container.removeEventListener(
      'mousedown',
      this.onToolContainerMouseDown,
    )
    this.container.removeEventListener('mouseup', this.onToolContainerMouseUp)
    this.close()
  }

  private draw = (ev: MouseEvent) => {
    const {
      domOverlayPosition: { x: x1, y: y1 },
    } = this.lf.getPointByClient(ev.clientX, ev.clientY)
    this.endPoint = {
      x: x1,
      y: y1,
    }
    if (this.startPoint) {
      const { x, y } = this.startPoint
      let left = x
      let top = y
      let width = x1 - x
      let height = y1 - y
      if (x1 < x) {
        left = x1
        width = x - x1
      }
      if (y1 < y) {
        top = y1
        height = y - y1
      }
      if (this.wrapper) {
        this.wrapper.style.left = `${left}px`
        this.wrapper.style.top = `${top}px`
        this.wrapper.style.width = `${width}px`
        this.wrapper.style.height = `${height}px`
      }
    }
  }
  private drawOff = () => {
    document.removeEventListener('mousemove', this.draw)
    document.removeEventListener('mouseup', this.drawOff)
    if (this.wrapper) {
      this.wrapper.oncontextmenu = null
      this.container?.removeChild(this.wrapper)
    }
    if (this.startPoint && this.endPoint) {
      const { x, y } = this.startPoint
      const { x: x1, y: y1 } = this.endPoint
      // 返回框选范围，左上角和右下角的坐标
      const lt: PointTuple = [Math.min(x, x1), Math.min(y, y1)]
      const rb: PointTuple = [Math.max(x, x1), Math.max(y, y1)]
      this.lf.emit('selection:selected-area', {
        topLeft: lt,
        bottomRight: rb,
      })
      // 选区太小的情况就忽略
      if (Math.abs(x1 - x) < 10 && Math.abs(y1 - y) < 10) {
        return
      }
      const elements = this.lf.graphModel.getAreaElement(
        lt,
        rb,
        this.isWholeEdge,
        this.isWholeNode,
        true,
      )
      const { dynamicGroup, group } = this.lf.graphModel
      const nonGroupedElements: typeof elements = []
      elements.forEach((element) => {
        // 如果节点属于分组，则不选中节点，此处兼容旧版 Group 插件
        if (group) {
          const elementGroup = group.getNodeGroup(element.id)
          if (elements.includes(elementGroup)) {
            // 当被选中的元素的父分组被选中时，不选中该元素
            return
          }
        }
        if (dynamicGroup) {
          const elementGroup = dynamicGroup.getGroupByNodeId(element.id)
          if (elements.includes(elementGroup)) {
            // 当被选中的元素的父分组被选中时，不选中该元素
            return
          }
        }
        this.lf.selectElementById(element.id, true)
        nonGroupedElements.push(element)
      })
      this.lf.emit('selection:selected', {
        elements: nonGroupedElements,
        leftTopPoint: lt,
        rightBottomPoint: rb,
      })
    }
  }

  private open() {
    this.disabled = false
  }

  private close() {
    this.disabled = true
  }
}

export default SelectionSelect
