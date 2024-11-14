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
  private isDefaultStopMoveGraph:
    | boolean
    | 'horizontal'
    | 'vertical'
    | [number, number, number, number] = false
  private isWholeNode = true
  private isWholeEdge = true

  constructor({ lf }: LogicFlow.IExtensionProps) {
    this.lf = lf
    // 初始化isDefaultStopMoveGraph取值
    const { stopMoveGraph } = lf.getEditConfig()
    this.isDefaultStopMoveGraph = stopMoveGraph!
    // TODO: 有没有既能将方法挂载到lf上，又能提供类型提示的方法？
    lf.openSelectionSelect = () => {
      this.openSelectionSelect()
    }
    lf.closeSelectionSelect = () => {
      this.closeSelectionSelect()
    }
  }

  render(lf: LogicFlow, domContainer: HTMLElement) {
    this.container = domContainer
    lf.on('blank:mousedown', ({ e }: { e: MouseEvent }) => {
      const config = lf.getEditConfig()
      // 鼠标控制滚动移动画布的时候，不能选区。
      if (!config.stopMoveGraph || this.disabled) {
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
    })
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
    const { stopMoveGraph } = this.lf.getEditConfig()
    if (!stopMoveGraph) {
      this.isDefaultStopMoveGraph = false
      this.lf.updateEditConfig({
        stopMoveGraph: true,
      })
    }
    this.open()
  }

  /**
   * 关闭选区
   */
  closeSelectionSelect() {
    if (!this.isDefaultStopMoveGraph) {
      this.lf.updateEditConfig({
        stopMoveGraph: false,
      })
    }
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
        if (group && group.getNodeGroup(element.id)) {
          return
        }
        if (dynamicGroup && dynamicGroup.getGroupByNodeId(element.id)) {
          return
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
