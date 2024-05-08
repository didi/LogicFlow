import BaseNode from './BaseNode'
import { Polygon } from '../shape'

export class PolygonNode extends BaseNode {
  getShape() {
    const { model } = this.props
    const { x, y, width, height, points } = model
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
