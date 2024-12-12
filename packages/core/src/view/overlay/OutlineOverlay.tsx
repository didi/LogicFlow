import { Component } from 'preact/compat'
import { Rect } from '../shape'
import { observer } from '../..'
import { ModelType } from '../../constant'
import {
  GraphModel,
  LineEdgeModel,
  BezierEdgeModel,
  PolylineEdgeModel,
} from '../../model'
import { points2PointsList, getBezierPoints, getBBoxOfPoints } from '../../util'

type IProps = {
  graphModel: GraphModel
}

@observer
export class OutlineOverlay extends Component<IProps> {
  // 节点outline
  getNodesOutline() {
    const { graphModel } = this.props
    const {
      nodes,
      editConfigModel: { hoverOutline, nodeSelectedOutline },
    } = graphModel
    const nodeOutline: any = []
    nodes.forEach((element) => {
      if (element.isHovered || element.isSelected) {
        const { isHovered, isSelected, x, y, width, height } = element
        if (
          (nodeSelectedOutline && isSelected) ||
          (hoverOutline && isHovered)
        ) {
          const style = element.getOutlineStyle()
          let attributes = {}
          Object.keys(style).forEach((key) => {
            if (key !== 'hover') {
              attributes[key] = style[key]
            }
          })
          if (isHovered) {
            const hoverStyle = style.hover
            attributes = {
              ...attributes,
              ...hoverStyle,
            }
          }
          nodeOutline.push(
            <Rect
              transform={element.transform}
              className="lf-outline-node"
              {...{
                x,
                y,
                // width: width + 10,
                // height: height + 10,
                width: width + 10,
                height: height + 10,
              }}
              {...attributes}
            />,
          )
        }
      }
    })
    return nodeOutline
  }

  // 边的outline
  getEdgeOutline() {
    const {
      graphModel: {
        edges: edgeList,
        editConfigModel: { edgeSelectedOutline, hoverOutline },
      },
    } = this.props
    const edgeOutline: any = []
    for (let i = 0; i < edgeList.length; i++) {
      const edge = edgeList[i]
      if (
        (edgeSelectedOutline && edge.isSelected) ||
        (hoverOutline && edge.isHovered)
      ) {
        if (edge.modelType === ModelType.LINE_EDGE) {
          edgeOutline.push(this.getLineOutline(edge as LineEdgeModel))
        } else if (edge.modelType === ModelType.POLYLINE_EDGE) {
          edgeOutline.push(this.getPolylineOutline(edge as PolylineEdgeModel))
        } else if (edge.modelType === ModelType.BEZIER_EDGE) {
          edgeOutline.push(this.getBezierOutline(edge as BezierEdgeModel))
        }
      }
    }
    return edgeOutline
  }

  // 直线outline
  getLineOutline(line: LineEdgeModel) {
    const { startPoint, endPoint } = line
    const x = (startPoint.x + endPoint.x) / 2
    const y = (startPoint.y + endPoint.y) / 2
    const width = Math.abs(startPoint.x - endPoint.x) + 10
    const height = Math.abs(startPoint.y - endPoint.y) + 10
    const style = line.getOutlineStyle()
    return (
      <Rect
        className="lf-outline-edge"
        {...{
          x,
          y,
          width,
          height,
        }}
        {...style}
      />
    )
  }

  // 折线outline
  getPolylineOutline(polyline: PolylineEdgeModel) {
    const { points } = polyline
    const pointsList = points2PointsList(points)
    const bbox = getBBoxOfPoints(pointsList, 8)
    const { x, y, width, height } = bbox
    const style = polyline.getOutlineStyle()
    return (
      <Rect
        className="lf-outline"
        {...{
          x,
          y,
          width,
          height,
        }}
        {...style}
      />
    )
  }

  // 曲线outline
  getBezierOutline(bezier: BezierEdgeModel) {
    const { path } = bezier
    const pointsList = getBezierPoints(path)
    const bbox = getBBoxOfPoints(pointsList, 8)
    const { x, y, width, height } = bbox
    const style = bezier.getOutlineStyle()
    return (
      <Rect
        className="lf-outline"
        {...{
          x,
          y,
          width,
          height,
        }}
        {...style}
      />
    )
  }

  render() {
    return (
      <g className="lf-outline">
        {this.getNodesOutline()}
        {this.getEdgeOutline()}
      </g>
    )
  }
}

export default OutlineOverlay
