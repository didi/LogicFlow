import BaseNode from './BaseNode'
import Ellipse from '../shape/Ellipse'
import { GraphModel, EllipseNodeModel } from '../../model'

export type IEllipseNodeProps = {
  model: EllipseNodeModel
  graphModel: GraphModel
}

export class EllipseNode extends BaseNode<IEllipseNodeProps> {
  getShape() {
    const { model } = this.props
    const style = model.getNodeStyle()
    return (
      <Ellipse {...style} x={model.x} y={model.y} rx={model.rx} ry={model.ry} />
    )
  }
}

export default EllipseNode
