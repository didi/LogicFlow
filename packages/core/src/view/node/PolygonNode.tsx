import BaseNode from './BaseNode'
import { Polygon } from '../shape'
import { GraphModel, PolygonNodeModel } from '../../model'

export type IPolygonNodeProps = {
  model: PolygonNodeModel
  graphModel: GraphModel
}

export class PolygonNode<
  P extends IPolygonNodeProps = IPolygonNodeProps,
> extends BaseNode<P> {
  getShape() {
    const { model } = this.props
    const { x, y, width, height, points } = model as PolygonNodeModel
    const style = model.getNodeStyle()
    const attr = {
      transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
    }
    return (
      <g {...attr}>
        <Polygon {...style} points={points} x={x} y={y} />
      </g>
    )
  }
}

export default PolygonNode
