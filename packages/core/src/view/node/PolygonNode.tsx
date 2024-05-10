import BaseNode from './BaseNode'
import { Polygon } from '../shape'
import { PolygonNodeModel } from '../../model'

export class PolygonNode extends BaseNode {
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
