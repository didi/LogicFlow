import CircleNode from './CircleNode'

class EllipseNewModel extends CircleNode.model {
  constructor(data, graphData) {
    super(data, graphData)
    this.rx = 60
    this.ry = 30
  }
  getNodeStyle() {
    const style = super.getNodeStyle()
    return {...style}
  }
}
export default {
  type: 'pro-ellipse',
  view: CircleNode.view,
  model: EllipseNewModel
}
