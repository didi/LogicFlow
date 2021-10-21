// import { CircleNode, CircleNodeModel } from '@logicflow/core'
import { EllipseResize } from '@logicflow/extension'
import { getShapeStyleFuction, getTextStyleFunction } from './getShapeStyleUtil'
// const EllipseResize = window.EllipseResize

/**
 * view控制渲染的值
 */
class CircleNewNode extends EllipseResize.view {
  getShapeStyle () {
    const style = super.getShapeStyle()
    const properties = this.getProperties()
    return getShapeStyleFuction(style, properties)
  }

  getTextStyle () {
    const style = super.getTextStyle()
    const properties = this.getProperties()
    return getTextStyleFunction(style, properties)
  }
}
/**
 * model控制初始化的值
 */
class CircleNewModel extends EllipseResize.model {
}

export default {
  type: 'pro-circle',
  view: CircleNewNode,
  model: CircleNewModel
}
