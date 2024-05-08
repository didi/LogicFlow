import BaseNode from './BaseNode'
import Ellipse from '../shape/Ellipse'

export class EllipseNode extends BaseNode {
  getShape() {
    const { model } = this.props
    const style = model.getNodeStyle()
    return (
      <Ellipse {...style} x={model.x} y={model.y} rx={model.rx} ry={model.ry} />
    )
  }
}

export default EllipseNode
