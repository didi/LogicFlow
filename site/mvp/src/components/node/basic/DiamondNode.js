import { DiamondResize } from '@logicflow/extension'
import { getShapeStyleFuction, getTextStyleFunction } from '../getShapeStyleUtil'

// 菱形
class DiamondNode extends DiamondResize.view {
  getShapeStyle () {
    const style = super.getShapeStyle()
    const properties = this.getPrsoperties()
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
class DiamondModel extends DiamondResize.model {
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
  type: 'pro-diamond',
  view: DiamondNode,
  model: DiamondModel
}
