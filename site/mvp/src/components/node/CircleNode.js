import { CircleNode, CircleNodeModel } from '@logicflow/core'

/**
 * view控制渲染的值
 */
class CircleNewNode extends CircleNode {
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
class CircleNewModel extends CircleNodeModel {
  // setAttributes () {
  //   const properties = this.properties
  //   if (properties.fill) {
  //     this.fill = properties.fill
  //   }
  // }
}

export default {
  type: 'circle',
  view: CircleNewNode,
  model: CircleNewModel
}
