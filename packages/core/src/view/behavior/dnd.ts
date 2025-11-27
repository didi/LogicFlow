import { get } from 'lodash-es'
import LogicFlow from '../../LogicFlow'
import { BaseNodeModel } from '../../model'
import { snapToGrid } from '../../util'
import { EventType } from '../../constant'

import Position = LogicFlow.Position
import OnDragNodeConfig = LogicFlow.OnDragNodeConfig

export class Dnd {
  nodeConfig: OnDragNodeConfig | null = null
  lf: LogicFlow
  fakeNode: BaseNodeModel | null = null
  docPointerMove?: (e: PointerEvent) => void
  docPointerUp?: (e: PointerEvent) => void

  constructor(params: { lf: LogicFlow }) {
    const { lf } = params
    this.lf = lf
  }

  clientToLocalPoint({ x, y }: Position): Position {
    const gridSize = get(this.lf.options, ['grid', 'size'])
    // 处理 container 的 offset 等
    const position = this.lf.graphModel.getPointByClient({
      x,
      y,
    })
    // 处理缩放和偏移
    const { x: x1, y: y1 } = position.canvasOverlayPosition
    const {
      editConfigModel: { snapGrid },
    } = this.lf.graphModel
    // x, y 对齐到网格的 size
    return {
      x: snapToGrid(x1, gridSize, snapGrid),
      y: snapToGrid(y1, gridSize, snapGrid),
    }
  }

  startDrag(nodeConfig: OnDragNodeConfig) {
    const { editConfigModel } = this.lf.graphModel
    if (!editConfigModel?.isSilentMode) {
      this.nodeConfig = nodeConfig
      // 指针移动：根据命中结果判断是否在画布覆盖层上，驱动假节点创建/移动或清理
      this.docPointerMove = (e: PointerEvent) => {
        if (!this.nodeConfig) return
        // 获取画布覆盖层元素（仅在其自身或后代命中时视为“在画布内”）
        const overlay = this.lf.graphModel.rootEl.querySelector(
          '[name="canvas-overlay"]',
        ) as HTMLElement | null
        // 获取当前指针位置下最上层的DOM元素，判断当前指针是否“在画布上”
        const topEl = window.document.elementFromPoint(
          e.clientX,
          e.clientY,
        ) as HTMLElement | null
        const inside = topEl === overlay || (topEl && overlay?.contains(topEl))
        // 离开画布：清理吸附线与假节点
        if (!inside) {
          this.onDragLeave()
          return
        }
        // 首次进入画布：创建假节点并初始化位置
        if (!this.fakeNode) {
          this.dragEnter(e)
          return
        }
        // 在画布内移动：更新假节点位置与吸附线
        this.onDragOver(e)
      }
      // 指针抬起：在画布内落点生成节点，否则清理假节点
      this.docPointerUp = (e: PointerEvent) => {
        if (!this.nodeConfig) return
        const overlay = this.lf.graphModel.rootEl.querySelector(
          '[name="canvas-overlay"]',
        ) as HTMLElement | null
        const topEl = window.document.elementFromPoint(
          e.clientX,
          e.clientY,
        ) as HTMLElement | null
        const inside = topEl === overlay || (topEl && overlay?.contains(topEl))
        if (inside) {
          this.onDrop(e)
        } else {
          this.onDragLeave()
        }
        // 阻止默认行为与冒泡，避免滚动/点击穿透
        e.preventDefault()
        e.stopPropagation()
        // 结束拖拽并移除监听
        this.stopDrag()
      }
      window.document.addEventListener('pointermove', this.docPointerMove)
      window.document.addEventListener('pointerup', this.docPointerUp)
    }
  }

  stopDrag = () => {
    this.nodeConfig = null
    if (this.docPointerMove) {
      window.document.removeEventListener('pointermove', this.docPointerMove)
      this.docPointerMove = undefined
    }
    if (this.docPointerUp) {
      window.document.removeEventListener('pointerup', this.docPointerUp)
      this.docPointerUp = undefined
    }
  }
  dragEnter = (e: PointerEvent) => {
    if (!this.nodeConfig || this.fakeNode) return
    this.fakeNode = this.lf.createFakeNode({
      ...this.nodeConfig,
      ...this.clientToLocalPoint({
        x: e.clientX,
        y: e.clientY,
      }),
    })
  }
  onDragOver = (e: MouseEvent) => {
    this.lf.graphModel.eventCenter.emit(EventType.BLANK_CANVAS_MOUSEMOVE, {
      e,
    })
    e.preventDefault()
    if (this.fakeNode) {
      const { x, y } = this.clientToLocalPoint({
        x: e.clientX,
        y: e.clientY,
      })
      this.fakeNode.moveTo(x, y)
      const nodeData = this.fakeNode.getData()
      this.lf.setNodeSnapLine(nodeData)
      this.lf.graphModel.eventCenter.emit(EventType.NODE_DND_DRAG, {
        data: nodeData,
        e,
      })
    }
    return false
  }
  onDragLeave = () => {
    if (this.fakeNode) {
      this.lf.removeNodeSnapLine()
      this.lf.graphModel.removeFakeNode()
      this.fakeNode = null
    }
  }
  onDrop = (e: MouseEvent) => {
    if (!this.lf.graphModel || !e || !this.nodeConfig) {
      return
    }
    this.lf.addNode(
      {
        ...this.nodeConfig,
        ...this.clientToLocalPoint({
          x: e.clientX,
          y: e.clientY,
        }),
      },
      EventType.NODE_DND_ADD,
      e,
    )
    e.preventDefault()
    e.stopPropagation()
    this.nodeConfig = null
    this.lf.removeNodeSnapLine()
    this.lf.graphModel.removeFakeNode()
    this.fakeNode = null
  }

  // eventMap() {
  //   return {
  //     // onPointerEnter: this.dragEnter,
  //     // onPointerOver: this.dragEnter, // IE11
  //     // onMouseMove: this.onDragOver,
  //     // onPointerLeave: this.onDragLeave,
  //     // onMouseOut: this.onDragLeave, // IE11
  //     // onMouseUp: this.onDrop,
  //   }
  // }
}

export default Dnd
