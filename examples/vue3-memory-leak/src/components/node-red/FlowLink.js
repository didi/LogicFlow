import { BezierEdge, BezierEdgeModel } from '@logicflow/core'

class FlowLinkModel extends BezierEdgeModel {
  getEdgeStyle() {
    const style = super.getEdgeStyle()
    style.strokeWidth = 3
    style.stroke = this.isSelected ? '#ff7f0e' : '#999'
    return style
  }
}
class FlowLink extends BezierEdge {}

export default {
  type: 'flow-link',
  view: FlowLink,
  model: FlowLinkModel,
}
