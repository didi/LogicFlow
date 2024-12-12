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
      window.document.addEventListener('mouseup', this.stopDrag)
    }
  }

  stopDrag = () => {
    this.nodeConfig = null
    window.document.removeEventListener('mouseup', this.stopDrag)
  }
  dragEnter = (e: MouseEvent) => {
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

  eventMap() {
    return {
      onMouseEnter: this.dragEnter,
      onMouseOver: this.dragEnter, // IE11
      onMouseMove: this.onDragOver,
      onMouseLeave: this.onDragLeave,
      // onMouseOut: this.onDragLeave, // IE11
      onMouseUp: this.onDrop,
    }
  }
}

export default Dnd
