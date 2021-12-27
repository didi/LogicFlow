import { EllipseResize } from '@logicflow/extension'
import { getShapeStyleFuction, getTextStyleFunction } from '../getShapeStyleUtil'

// 圆形
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
  constructor(data, graphData) {
    super(data, graphData)
    this.rx = 35
    this.ry = 35
  }

  setToBottom () {
    this.zIndex = 0
  }
}

export default {
  type: 'pro-circle',
  view: CircleNewNode,
  model: CircleNewModel
}
