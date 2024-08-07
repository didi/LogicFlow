import BaseNode from './BaseNode'
import Ellipse from '../shape/Ellipse'
import { GraphModel, EllipseNodeModel } from '../../model'

export type IEllipseNodeProps = {
  model: EllipseNodeModel
  graphModel: GraphModel
}

export class EllipseNode<
  P extends IEllipseNodeProps = IEllipseNodeProps,
> extends BaseNode<P> {
  getShape() {
    const { model } = this.props
    const style = model.getNodeStyle()
    return (
      <Ellipse {...style} x={model.x} y={model.y} rx={model.rx} ry={model.ry} />
    )
  }
}

export default EllipseNode
