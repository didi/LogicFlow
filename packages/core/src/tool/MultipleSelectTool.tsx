import { Component } from 'preact/compat'
import { IToolProps } from '.'
import { Model, observer } from '..'
import LogicFlow from '../LogicFlow'
import { StepDrag, IDragParams } from '../util'
import { ElementType, EventType } from '../constant'
import { getNodeOutline, getEdgeOutline } from '../algorithm/outline'

import GraphData = LogicFlow.GraphData

@observer
export default class MultipleSelect extends Component<IToolProps> {
  static toolName = 'multiple-select-tool'
  stepDrag: StepDrag

  constructor(props: IToolProps) {
    super(props)
    const {
      graphModel: { gridSize, eventCenter },
    } = props
    this.stepDrag = new StepDrag({
      onDragging: this.onDragging,
      step: gridSize,
      eventType: 'SELECTION',
      eventCenter,
    })
  }

  handleMouseDown = (ev: MouseEvent) => {
    this.stepDrag.handleMouseDown(ev)
  }
  // 使多选区域的滚轮事件可以触发画布的滚轮事件
  handleWheelEvent = (ev: WheelEvent) => {
    ev.preventDefault()
    const { deltaX, deltaY, clientX, clientY, ctrlKey } = ev
    const newEvent = new WheelEvent('wheel', {
      deltaX,
      deltaY,
      clientX,
      clientY,
      ctrlKey,
    })
    this.props.lf.container
      ?.querySelector('.lf-canvas-overlay[name="canvas-overlay"]')
      ?.dispatchEvent(newEvent)
  }
  onDragging = ({ deltaX, deltaY }: IDragParams) => {
    const { graphModel, lf } = this.props
    const { SCALE_X, SCALE_Y } = lf.getTransform()
    const selectElements = graphModel.getSelectElements(true)
    graphModel.moveNodes(
      selectElements.nodes.map((node) => node.id),
      deltaX / SCALE_X,
      deltaY / SCALE_Y,
    )
  }
  handleContextMenu = (ev: MouseEvent) => {
    ev.preventDefault()
    const {
      graphModel,
      graphModel: { eventCenter, selectElements },
    } = this.props
    const position = graphModel.getPointByClient({
      x: ev.clientX,
      y: ev.clientY,
    })
    const selectGraphData: GraphData = {
      nodes: [],
      edges: [],
    }
    const models = [...selectElements.values()]
    models.forEach((model) => {
      if (model.BaseType === ElementType.NODE) {
        selectGraphData.nodes.push(model.getData())
      }
      if (model.BaseType === ElementType.EDGE) {
        selectGraphData.edges.push(model.getData())
      }
    })
    eventCenter.emit(EventType.SELECTION_CONTEXTMENU, {
      data: selectGraphData,
      e: ev,
      position,
    })
  }

  render() {
    const {
      graphModel: { selectElements, transformModel },
    } = this.props
    const { SCALE_X, SCALE_Y } = this.props.lf.getTransform()
    if (selectElements.size <= 1) return
    let x = Number.MAX_SAFE_INTEGER
    let y = Number.MAX_SAFE_INTEGER
    let x1 = Number.MIN_SAFE_INTEGER
    let y1 = Number.MIN_SAFE_INTEGER
    selectElements.forEach((element) => {
      let outline: Model.OutlineInfo | undefined
      if (element.BaseType === ElementType.NODE) {
        outline = getNodeOutline(element)
      }
      if (element.BaseType === ElementType.EDGE) {
        outline = getEdgeOutline(element)
      }

      if (outline !== undefined) {
        x = Math.min(x, outline.x)
        y = Math.min(y, outline.y)
        x1 = Math.max(x1, outline.x1)
        y1 = Math.max(y1, outline.y1)
      }
    })
    ;[x, y] = transformModel.CanvasPointToHtmlPoint([x, y])
    ;[x1, y1] = transformModel.CanvasPointToHtmlPoint([x1, y1])
    const style = {
      left: `${x - (20 * SCALE_X) / 2}px`,
      top: `${y - (20 * SCALE_Y) / 2}px`,
      width: `${x1 - x + 20 * SCALE_X}px`,
      height: `${y1 - y + 20 * SCALE_Y}px`,
      'border-width': `${2 * SCALE_X}px`,
    }
    return (
      <div
        className="lf-multiple-select"
        style={style}
        onMouseDown={this.handleMouseDown}
        onContextMenu={this.handleContextMenu}
        onWheel={this.handleWheelEvent}
      />
    )
  }
}
