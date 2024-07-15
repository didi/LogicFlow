import Circle from '../shape/Circle'
import BaseNode from './BaseNode'
import { GraphModel, CircleNodeModel } from '../../model'

export type ICircleNodeProps = {
  model: CircleNodeModel
  graphModel: GraphModel
}

export class CircleNode<
  P extends ICircleNodeProps = ICircleNodeProps,
> extends BaseNode<P> {
  getShape() {
    const { model } = this.props
    const { x, y, r } = model
    const style = model.getNodeStyle()
    return <Circle {...style} x={x} y={y} r={r} />
  }
}

export default CircleNode
