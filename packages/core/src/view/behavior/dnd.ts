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
      this.docPointerMove = (e: PointerEvent) => {
        if (!this.nodeConfig) return
        const overlay = this.lf.graphModel.rootEl.querySelector(
          '[name="canvas-overlay"]',
        ) as HTMLElement | null
        const topEl = window.document.elementFromPoint(
          e.clientX,
          e.clientY,
        ) as HTMLElement | null
        const inside = topEl === overlay || (topEl && overlay?.contains(topEl))
        if (!inside) {
          this.onDragLeave()
          return
        }
        if (!this.fakeNode) {
          this.dragEnter(e)
          return
        }
        this.onDragOver(e)
      }
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
        e.preventDefault()
        e.stopPropagation()
        this.stopDrag()
      }
      window.document.addEventListener('pointermove', this.docPointerMove)
      window.document.addEventListener('pointerup', this.docPointerUp)
    }
  }

  stopDrag = () => {
    console.log('stop')

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
    console.log('leave canvas')

    if (this.fakeNode) {
      this.lf.removeNodeSnapLine()
      this.lf.graphModel.removeFakeNode()
      this.fakeNode = null
    }
  }
  onDrop = (e: MouseEvent) => {
    console.log(111)

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
