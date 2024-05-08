import { get } from 'lodash-es'
import LogicFlow from '../../LogicFlow'
import { BaseNodeModel } from '../../model'
import { snapToGrid } from '../../util'
import { EventType } from '../../constant'

import TextConfig = LogicFlow.TextConfig

export type NewNodeConfig = {
  type: string
  text?: TextConfig | string
  properties?: Record<string, unknown>
  [key: string]: any
}

export class Dnd {
  nodeConfig: NewNodeConfig | null = null
  lf: LogicFlow
  fakerNode: BaseNodeModel | null = null

  constructor(params) {
    const { lf } = params
    this.lf = lf
  }

  clientToLocalPoint({ x, y }) {
    const gridSize = get(this.lf.options, ['grid', 'size'])
    // 处理 container 的 offset 等
    const position = this.lf.graphModel.getPointByClient({
      x,
      y,
    })
    // 处理缩放和偏移
    const { x: x1, y: y1 } = position.canvasOverlayPosition
    // x, y 对齐到网格的 size
    return {
      x: snapToGrid(x1, gridSize),
      y: snapToGrid(y1, gridSize),
    }
  }

  startDrag(nodeConfig: NewNodeConfig) {
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
  dragEnter = (e) => {
    if (!this.nodeConfig || this.fakerNode) return
    this.fakerNode = this.lf.createFakerNode({
      ...this.nodeConfig,
      ...this.clientToLocalPoint({
        x: e.clientX,
        y: e.clientY,
      }),
    })
  }
  onDragOver = (e) => {
    e.preventDefault()
    if (this.fakerNode) {
      const { x, y } = this.clientToLocalPoint({
        x: e.clientX,
        y: e.clientY,
      })
      this.fakerNode.moveTo(x, y)
      const nodeData = this.fakerNode.getData()
      this.lf.setNodeSnapLine(nodeData)
      this.lf.graphModel.eventCenter.emit(EventType.NODE_DND_DRAG, {
        data: nodeData,
      })
    }
    return false
  }
  onDragLeave = () => {
    if (this.fakerNode) {
      this.lf.removeNodeSnapLine()
      this.lf.graphModel.removeFakerNode()
      this.fakerNode = null
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
    this.lf.graphModel.removeFakerNode()
    this.fakerNode = null
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
