// import { CircleNode, CircleNodeModel } from '@logicflow/core'
const EllipseResize = window.EllipseResize

/**
 * view控制渲染的值
 */
class CircleNewNode extends EllipseResize.view {
  getShapeStyle () {
    const style = super.getShapeStyle()
    const properties = this.getProperties()
    if (properties.fill) {
      style.fill = properties.fill
    }
    return style
  }
}
/**
 * model控制初始化的值
 */
class CircleNewModel extends EllipseResize.model {
  setAttributes () {
    // this.rx = 50
    // this.ry = 50
  }
}

export default {
  type: 'circle',
  view: CircleNewNode,
  model: CircleNewModel
}
