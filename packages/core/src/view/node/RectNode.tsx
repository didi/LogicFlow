import BaseNode from './BaseNode'
import { Rect } from '../shape'

export class RectNode extends BaseNode {
  getShape() {
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
