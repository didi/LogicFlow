import { EllipseResize } from '@logicflow/extension'
import { getShapeStyleFuction, getTextStyleFunction } from '../getShapeStyleUtil'

// 圆形
class CircleNewModel extends EllipseResize.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.rx = 35
    this.ry = 35
  }

  setToBottom () {
    this.zIndex = 0
  }

  getNodeStyle () {
    const style = super.getNodeStyle()
    const properties = this.getProperties()
    return getShapeStyleFuction(style, properties)
  }

  getTextStyle () {
    const style = super.getTextStyle()
    const properties = this.getProperties()
    return getTextStyleFunction(style, properties)
  }
}

export default {
  type: 'pro-circle',
  view: EllipseResize.view,
  model: CircleNewModel
}
