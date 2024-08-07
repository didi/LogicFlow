import { Component } from 'preact/compat'
import { Circle, Line } from '../shape'
import { observer } from '../..'
import LogicFlow from '../../LogicFlow'
import { EventType, ModelType } from '../../constant'
import { StepDrag, getBezierPoints, IDragParams } from '../../util'
import { GraphModel, BezierEdgeModel } from '../../model'

import Point = LogicFlow.Point

type IProps = {
  graphModel: GraphModel
}

type IAnchorProps = {
  position: Point
  bezierModel: BezierEdgeModel
  graphModel: GraphModel
  type: string
}

type IState = {
  endX: number
  endY: number
}

// bezier曲线的可调整锚点
export class BezierAdjustAnchor extends Component<IAnchorProps, IState> {
  dragHandler: StepDrag

  constructor() {
    super()
    this.dragHandler = new StepDrag({
      onDragging: this.onDragging,
      onDragEnd: this.onDragEnd,
    })
  }

  onDragging = ({ event }: IDragParams) => {
    const { graphModel, bezierModel, type } = this.props
    const {
      canvasOverlayPosition: { x, y },
    } = graphModel.getPointByClient({
      x: event!.clientX,
      y: event!.clientY,
    })
    bezierModel.updateAdjustAnchor(
      {
        x,
        y,
      },
      type,
    )
    graphModel.eventCenter.emit(EventType.EDGE_ADJUST, {
      data: bezierModel.getData(),
    })
  }
  onDragEnd = () => {
    const { bezierModel } = this.props
    bezierModel.isDragging = false
  }

  render() {
    const { position } = this.props
    const { x, y } = position
    const { bezierModel } = this.props
    const { adjustAnchor } = bezierModel.getEdgeStyle()
    return (
      <Circle
        className="lf-bezier-adjust-anchor"
        x={x}
        y={y}
        {...adjustAnchor}
        onMouseDown={(ev) => {
          // if (edgeAddable !== false) {
          this.dragHandler.handleMouseDown(ev)
          // }
        }}
      />
    )
  }
}

@observer
export class BezierAdjustOverlay extends Component<IProps> {
  getBezierAdjust(bezier: BezierEdgeModel, graphModel: GraphModel) {
    const { path, id } = bezier
    const pointsList = getBezierPoints(path)
    const [start, sNext, ePre, end] = pointsList
    const { adjustLine } = bezier.getEdgeStyle()
    const result: any = [] // TODO: 类型定义
    result.push(
      <Line
        x1={start.x}
        y1={start.y}
        x2={sNext.x}
        y2={sNext.y}
        {...adjustLine}
      />,
    )
    result.push(
      <BezierAdjustAnchor
        position={sNext}
        bezierModel={bezier}
        graphModel={graphModel}
        key={`${id}_ePre`}
        type="sNext"
      />,
    )
    result.push(
      <Line x1={end.x} y1={end.y} x2={ePre.x} y2={ePre.y} {...adjustLine} />,
    )
    result.push(
      <BezierAdjustAnchor
        position={ePre}
        bezierModel={bezier}
        graphModel={graphModel}
        key={`${id}_sNext`}
        type="ePre"
      />,
    )
    return result
  }

  // 获取选中bezier曲线，调整操作线和锚点
  selectedBezierEdge() {
    const { graphModel } = this.props
    const edgeList = graphModel.edges
    const edgeAdjust: any = [] // TODO：类型定义
    for (let i = 0; i < edgeList.length; i++) {
      const edge = edgeList[i]
      if (
        edge.isSelected &&
        edge.modelType === ModelType.BEZIER_EDGE &&
        edge.draggable
      ) {
        edgeAdjust.push(
          this.getBezierAdjust(edge as BezierEdgeModel, graphModel),
        )
      }
    }
    return edgeAdjust
  }

  render() {
    return <g className="lf-bezier-adjust">{this.selectedBezierEdge()}</g>
  }
}

export default BezierAdjustOverlay
