// import { RectResize } from '@logicflow/extension'
const RectResize = window.RectResize
/**
 * view控制渲染的值
 */
class RectNewNode extends RectResize.view {
  getShapeStyle () {
    const style = super.getShapeStyle()
    const properties = this.getProperties()
    if (properties.background) {
      style.fill = properties.background
    }
    if (properties.borderColor) {
      style.stroke = properties.borderColor
    }
    if (properties.borderWidth) {
      style.strokeWidth = properties.borderWidth
    }
    return style
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
  type: 'lf-rect',
  view: RectNewNode,
  model: RectNewModel
}
