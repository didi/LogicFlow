import { Component } from 'preact/compat'
import { map, reduce } from 'lodash-es'
import Circle from './shape/Circle'
import LogicFlow from '../LogicFlow'
import { EventType } from '../constant'
import EventEmitter from '../event/eventEmitter'
import { GraphModel, BaseNodeModel } from '../model'
import { StepDrag, TranslateMatrix, Vector } from '../util'

interface IRotateControlProps {
  graphModel: GraphModel
  nodeModel: BaseNodeModel
  eventCenter: EventEmitter
  style: LogicFlow.CommonTheme
}

class RotateControlPoint extends Component<IRotateControlProps> {
  readonly style = {}
  private defaultAngle!: number
  normal!: Vector
  stepperDrag: any

  constructor(props: IRotateControlProps) {
    super(props)
    this.style = props.style
    this.stepperDrag = new StepDrag({
      onDragging: this.onDragging,
    })
  }

  onDragging = ({ event }: any) => {
    const { graphModel, nodeModel, eventCenter } = this.props
    const { selectNodes } = graphModel
    const { x, y } = nodeModel
    const { clientX, clientY } = event
    const {
      canvasOverlayPosition: { x: cx, y: cy },
    } = graphModel.getPointByClient({
      x: clientX,
      y: clientY,
    })
    const v = new Vector(cx - x, cy - y)
    const angle = this.normal?.angle(v) - this.defaultAngle
    const matrix = new TranslateMatrix(-x, -y)
      .rotate(angle)
      .translate(x, y)
      .toString()
    nodeModel.transform = matrix
    nodeModel.rotate = angle

    let nodeIds = map(selectNodes, (node) => node.id)
    if (nodeIds.indexOf(nodeModel.id) === -1) {
      nodeIds = [nodeModel.id]
    }
    const nodeIdMap = reduce(
      nodeIds,
      (acc, nodeId) => {
        const node = graphModel.getNodeModelById(nodeId)
        acc[nodeId] = node?.getMoveDistance(0, 0, false)
        return acc
      },
      {},
    )
    nodeIds.forEach((nodeId) => {
      const edges = graphModel.getNodeEdges(nodeId)
      edges.forEach((edge) => {
        if (nodeIdMap[edge.sourceNodeId]) {
          const model = graphModel.getNodeModelById(edge.sourceNodeId)
          const anchor = model!.anchors.find(
            (item) => item.id === edge.sourceAnchorId,
          )!
          edge.updateStartPoint(anchor)
        }
        if (nodeIdMap[edge.targetNodeId]) {
          const model = graphModel.getNodeModelById(edge.targetNodeId)
          const anchor = model!.anchors.find(
            (item) => item.id === edge.targetAnchorId,
          )!
          edge.updateEndPoint(anchor)
        }
      })
    })

    eventCenter.emit(EventType.NODE_ROTATE, {
      e: event,
      model: nodeModel,
      data: nodeModel.getData(),
    })
  }

  render() {
    const { nodeModel } = this.props
    const { x, y, width, height } = nodeModel
    const cx = x + width / 2 + 20
    const cy = y - height / 2 - 20
    this.normal = new Vector(1, 0)
    this.defaultAngle = this.normal.angle(new Vector(cx - x, cy - y))
    nodeModel.defaultAngle = this.defaultAngle
    return (
      <g className="lf-rotate-control">
        <g
          onMouseDown={(ev) => {
            this.stepperDrag.handleMouseDown(ev)
          }}
        >
          <Circle {...this.style} cx={cx} cy={cy} />
        </g>
      </g>
    )
  }
}

export default RotateControlPoint
