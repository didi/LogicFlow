import { RectResize } from '@logicflow/extension'
import { getShapeStyleFuction, getTextStyleFunction } from './getShapeStyleUtil'
// const RectResize = window.RectResize

/**
 * view控制渲染的值
 */
class RectNewNode extends RectResize.view {
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
    // console.log('getTextStyle', getTextStyleFunction(style, properties))
    return getTextStyleFunction(style, properties)
  }
}

export default {
  type: 'pro-rect',
  view: RectNewNode,
  model: RectNewModel
}
