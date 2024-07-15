import BaseNode from './BaseNode'
import Polygon from '../shape/Polygon'
import { GraphModel, DiamondNodeModel } from '../../model'

export type IDiamondNodeProps = {
  model: DiamondNodeModel
  graphModel: GraphModel
}

export class DiamondNode<
  P extends IDiamondNodeProps = IDiamondNodeProps,
> extends BaseNode<P> {
  getShape() {
    const { model } = this.props
    const style = model.getNodeStyle()
    return (
      <g>
        <Polygon {...style} points={model.points} x={model.x} y={model.y} />
      </g>
    )
  }
}

export default DiamondNode
