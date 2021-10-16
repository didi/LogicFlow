// import { CircleNode, CircleNodeModel } from '@logicflow/core'
import { getShapeStyleFuction, getTextStyleFunction } from './getShapeStyleUtil'
// const EllipseResize = window.EllipseResize
const { TextNodeModel, TextNode } = window

/**
 * view控制渲染的值
 */
class TextNewNode extends TextNode {
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
class TextNewModel extends TextNodeModel {
  setAttributes () {
    if (!this.text.value) {
      this.text.value = 'text'
    }
    // this.rx = 50
    // this.ry = 50
  }
}

export default {
  type: 'pro-text',
  view: TextNewNode,
  model: TextNewModel
}
