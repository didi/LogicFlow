import RectNode from './RectNode'

/**
 * model控制初始化的值
 */
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
