import CircleNode from './CircleNode'

// 椭圆
class EllipseNewModel extends CircleNode.model {
  initNodeData(data) {
    super.initNodeData(data)
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
