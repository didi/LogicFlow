import RectNode from './RectNode'

// 带圆角的矩形
class RectRadiusModel extends RectNode.model {
  setAttributes () {
    super.setAttributes()
    this.radius = 20
  }
}
export default {
  type: 'rect-radius',
  view: RectNode.view,
  model: RectRadiusModel
}
