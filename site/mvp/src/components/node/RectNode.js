// import { RectResize } from '@logicflow/extension'
import { getShapeStyleFuction, getTextStyleFunction } from './getShapeStyleUtil'
const RectResize = window.RectResize

/**
 * view控制渲染的值
 */
class RectNewNode extends RectResize.view {
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

  toFront () {
    // const { isAlwaysBottom } = this.getProperties()
    // if (!isAlwaysBottom) {
    //   super.toFront()
    // }
  }
}
/**
 * model控制初始化的值
 */
class RectNewModel extends RectResize.model {
  setAttributes () {
    this.strokeWidth = 1
    // this.maxWidth = 500
  }

  setToBottom () {
    this.zIndex = 0
  }
}

export default {
  type: 'pro-rect',
  view: RectNewNode,
  model: RectNewModel
}
