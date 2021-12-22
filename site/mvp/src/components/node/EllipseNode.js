import CircleNode from './CircleNode'

class EllipseNewModel extends CircleNode.model {
  setAttributes () {
    super.setAttributes()
    this.rx = 80
    this.ry = 50
  }
}
export default {
  type: 'pro-ellipse',
  view: CircleNode.view,
  model: EllipseNewModel
}
