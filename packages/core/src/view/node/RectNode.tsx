import { createElement as h } from 'preact/compat'
import BaseNode from './BaseNode'
import { Rect } from '../shape'
import { GraphModel, RectNodeModel } from '../../model'

export type IRectNodeProps = {
  model: RectNodeModel
  graphModel: GraphModel
}

export class RectNode<
  P extends IRectNodeProps = IRectNodeProps,
> extends BaseNode<P> {
  getShape(): h.JSX.Element | null {
    const { model } = this.props
    const style = model.getNodeStyle()
    return (
      <Rect
        {...style}
        x={model.x}
        y={model.y}
        width={model.width}
        height={model.height}
        radius={model.radius}
      />
    )
  }
}

export default RectNode
