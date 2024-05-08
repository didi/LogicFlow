import Circle from '../shape/Circle'
import BaseNode from './BaseNode'

export class CircleNode extends BaseNode {
  getShape() {
    const { model } = this.props
    const { x, y, r } = model
    const style = model.getNodeStyle()
    return <Circle {...style} x={x} y={y} r={r} />
  }
}

export default CircleNode
