import { BezierEdge, BezierEdgeModel } from '@logicflow/core'

class AnimationEdge extends BezierEdge {}

class AnimationEdgeModel extends BezierEdgeModel {
  getEdgeAnimationStyle() {
    const style = super.getEdgeAnimationStyle()
    style.stroke = 'blue'
    style.animationDuration = '30s'
    style.animationDirection = 'reverse'
    return style
  }
}

export default {
  type: 'animation-edge',
  view: AnimationEdge,
  model: AnimationEdgeModel,
}
