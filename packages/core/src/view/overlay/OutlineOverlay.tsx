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
  // 通用渲染函数：根据点集合与样式计算包围盒并返回矩形轮廓
  private renderRectOutline(
    pointsList: any[],
    style: Record<string, unknown>,
    className: string,
    defaultOffsets: { widthOffset: number; heightOffset: number },
  ) {
    const {
      widthOffset = defaultOffsets.widthOffset,
      heightOffset = defaultOffsets.heightOffset,
    } = (style || {}) as any
    const { x, y, width, height } = getBBoxOfPoints(
      pointsList,
      widthOffset,
      heightOffset,
    )
    return (
      <Rect className={className} {...{ x, y, width, height }} {...style} />
    )
  }
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
                width: width + 4,
                height: height + 4,
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
    const style = line.getOutlineStyle()
    return this.renderRectOutline(
      [startPoint, endPoint],
      style,
      'lf-outline-edge',
      { widthOffset: 10, heightOffset: 10 },
    )
  }

  // 折线outline
  getPolylineOutline(polyline: PolylineEdgeModel) {
    const { points } = polyline
    const pointsList = points2PointsList(points)
    const style = polyline.getOutlineStyle()
    return this.renderRectOutline(pointsList, style, 'lf-outline', {
      widthOffset: 8,
      heightOffset: 16,
    })
  }

  // 曲线outline
  getBezierOutline(bezier: BezierEdgeModel) {
    const { path } = bezier
    const pointsList = getBezierPoints(path)
    const style = bezier.getOutlineStyle()
    return this.renderRectOutline(pointsList, style, 'lf-outline', {
      widthOffset: 8,
      heightOffset: 16,
    })
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
