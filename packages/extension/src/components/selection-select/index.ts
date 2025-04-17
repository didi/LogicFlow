import LogicFlow from '@logicflow/core'
import { cloneDeep } from 'lodash-es'

import Position = LogicFlow.Position
import PointTuple = LogicFlow.PointTuple

export interface SelectionConfig {
  exclusiveMode?: boolean
}

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
  exclusiveMode = false // 框选独占模式：true 表示只能进行框选操作，false 表示可以同时进行其他画布操作
  // 用于区分选区和点击事件
  private mouseDownInfo: {
    x: number
    y: number
    time: number
  } | null = null
  // 记录原始的 stopMoveGraph 设置
  private originalStopMoveGraph:
    | boolean
    | 'horizontal'
    | 'vertical'
    | [number, number, number, number] = false

  constructor({ lf, options }: LogicFlow.IExtensionProps) {
    this.lf = lf

    this.exclusiveMode = (options?.exclusiveMode as boolean) ?? false

    // TODO: 有没有既能将方法挂载到lf上，又能提供类型提示的方法？
    lf.openSelectionSelect = () => {
      this.openSelectionSelect()
    }
    lf.closeSelectionSelect = () => {
      this.closeSelectionSelect()
    }
    // 新增切换独占模式的方法
    lf.setSelectionSelectMode = (exclusive: boolean) => {
      this.setExclusiveMode(exclusive)
    }
    // 绑定方法的 this 上下文
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.draw = this.draw.bind(this)
    this.drawOff = this.drawOff.bind(this)
  }

  render(_: LogicFlow, domContainer: HTMLElement) {
    this.container = domContainer
  }

  /**
   * 清理选区状态
   */
  private cleanupSelectionState() {
    // 清理当前的选区状态
    if (this.wrapper) {
      this.wrapper.oncontextmenu = null
      if (this.container && this.wrapper.parentNode === this.container) {
        this.container.removeChild(this.wrapper)
      }
      this.wrapper = undefined
    }
    this.startPoint = undefined
    this.endPoint = undefined

    // 移除事件监听
    document.removeEventListener('mousemove', this.draw)
    document.removeEventListener('mouseup', this.drawOff)
  }

  /**
   * 切换框选模式
   * @param exclusive 是否为独占模式。true 表示只能进行框选操作，false 表示可以同时进行其他画布操作
   */
  setExclusiveMode(exclusive: boolean = false) {
    if (this.exclusiveMode === exclusive) return

    this.cleanupSelectionState()
    this.exclusiveMode = exclusive
    if (this.container && !this.disabled) {
      // 切换事件监听方式
      this.removeEventListeners()
      this.addEventListeners()
    }
  }

  private addEventListeners() {
    if (!this.container) return

    if (this.exclusiveMode) {
      // 独占模式：监听 container 的 mousedown 事件
      this.container.style.pointerEvents = 'auto'
      this.container.addEventListener('mousedown', this.handleMouseDown)
    } else {
      // 非独占模式：监听画布的 blank:mousedown 事件
      this.container.style.pointerEvents = 'none'
      // 使用实例方法而不是箭头函数，这样可以正确移除事件监听
      this.lf.on('blank:mousedown', this.handleBlankMouseDown)
    }
  }

  private removeEventListeners() {
    if (this.container) {
      this.container.style.pointerEvents = 'none'
      this.container.removeEventListener('mousedown', this.handleMouseDown)
    }
    // 移除 blank:mousedown 事件监听
    this.lf.off('blank:mousedown', this.handleBlankMouseDown)
  }

  /**
   * 处理画布空白处鼠标按下事件（非独占模式）
   */
  private handleBlankMouseDown = ({ e }: { e: MouseEvent }) => {
    this.handleMouseDown(e)
  }

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown(e: MouseEvent) {
    if (!this.container || this.disabled) return

    // 禁用右键框选
    const isRightClick = e.button === 2
    if (isRightClick) return

    // 清理之前可能存在的选区状态
    this.cleanupSelectionState()

    // 记录原始设置并临时禁止画布移动
    this.originalStopMoveGraph = this.lf.getEditConfig().stopMoveGraph!
    this.lf.updateEditConfig({
      stopMoveGraph: true,
    })

    const {
      domOverlayPosition: { x, y },
    } = this.lf.getPointByClient(e.clientX, e.clientY)

    this.startPoint = { x, y }
    this.endPoint = { x, y }

    const wrapper = document.createElement('div')
    wrapper.className = 'lf-selection-select'
    wrapper.oncontextmenu = function prevent(ev: MouseEvent) {
      ev.preventDefault()
    }
    wrapper.style.top = `${this.startPoint.y}px`
    wrapper.style.left = `${this.startPoint.x}px`
    this.container?.appendChild(wrapper)
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
    this.cleanupSelectionState()
    this.addEventListeners()
    this.open()
  }

  /**
   * 关闭选区
   */
  closeSelectionSelect() {
    if (!this.container) {
      return
    }
    // 如果还有未完成的框选，先触发 drawOff 完成框选
    if (this.wrapper && this.startPoint && this.endPoint) {
      // 记录上一次的结束点，用于触发 mouseup 事件
      const lastEndPoint = cloneDeep(this.endPoint)
      const lastEvent = new MouseEvent('mouseup', {
        clientX: lastEndPoint.x,
        clientY: lastEndPoint.y,
      })
      this.drawOff(lastEvent)
    }
    this.cleanupSelectionState()
    this.removeEventListeners()
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
  private drawOff = (e: MouseEvent) => {
    const curStartPoint = cloneDeep(this.startPoint)
    const curEndPoint = cloneDeep(this.endPoint)
    document.removeEventListener('mousemove', this.draw)
    if (!this.exclusiveMode) {
      document.removeEventListener('mouseup', this.drawOff)
    }

    // 恢复原始的 stopMoveGraph 设置
    this.lf.updateEditConfig({
      stopMoveGraph: this.originalStopMoveGraph,
    })

    if (curStartPoint && curEndPoint) {
      const { x, y } = curStartPoint
      const { x: x1, y: y1 } = curEndPoint
      // 返回框选范围，左上角和右下角的坐标
      const lt: PointTuple = [Math.min(x, x1), Math.min(y, y1)]
      const rb: PointTuple = [Math.max(x, x1), Math.max(y, y1)]
      this.lf.emit('selection:selected-area', {
        topLeft: lt,
        bottomRight: rb,
      })
      // 选区太小的情况就忽略
      if (Math.abs(x1 - x) < 10 && Math.abs(y1 - y) < 10) {
        if (this.wrapper) {
          this.wrapper.oncontextmenu = null
          if (this.container && this.wrapper.parentNode === this.container) {
            this.container.removeChild(this.wrapper)
          }
          this.wrapper = undefined
        }
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
      const selectedElements = this.lf.getSelectElements()
      // 同时记录节点和边的ID
      const selectedIds = new Set([
        ...selectedElements.nodes.map((node) => node.id),
        ...selectedElements.edges.map((edge) => edge.id),
      ])

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
        // 在独占模式下，如果元素已经被选中，则取消选中
        if (this.exclusiveMode && selectedIds.has(element.id)) {
          this.lf.deselectElementById(element.id)
          return
        }

        // 非独占模式下，或者元素未被选中时，选中元素
        this.lf.selectElementById(element.id, true)
        nonGroupedElements.push(element)
      })
      // 重置起始点和终点
      // 注意：这两个值必须在触发closeSelectionSelect方法前充值，否则会导致独占模式下元素无法选中的问题
      this.startPoint = undefined
      this.endPoint = undefined
      // 如果有选中的元素，触发 selection:drop 事件
      if (nonGroupedElements.length > 0) {
        this.lf.emit('selection:drop', { e })
      }
      // 触发 selection:selected 事件
      this.lf.emit('selection:selected', {
        elements: nonGroupedElements,
        leftTopPoint: lt,
        rightBottomPoint: rb,
      })
    }

    if (this.wrapper) {
      this.wrapper.oncontextmenu = null
      if (this.container && this.wrapper.parentNode === this.container) {
        this.container.removeChild(this.wrapper)
      }
      this.wrapper = undefined
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
