import LogicFlow, { HtmlNodeModel, IHtmlNodeProperties } from '@logicflow/core'
import { cloneDeep, isNil } from 'lodash-es'

export interface VueCustomProperties extends IHtmlNodeProperties {
  // 形状属性
  width?: number
  height?: number
  radius?: number

  // 文字位置属性
  refX?: number
  refY?: number

  // 样式属性
  style?: LogicFlow.CommonTheme
  textStyle?: LogicFlow.TextNodeTheme
}

export class VueNodeModel<
  P extends VueCustomProperties = VueCustomProperties,
> extends HtmlNodeModel<P> {
  setAttributes() {
    // DONE: 解决 width、height、radius 为 0 时的问题
    const { width, height, radius } = this.properties
    if (!isNil(width)) {
      this.width = width
    }
    if (!isNil(height)) {
      this.height = height
    }
    if (!isNil(radius)) {
      this.radius = radius
    }
  }

  getTextStyle(): LogicFlow.TextNodeTheme {
    const { refX = 0, refY = 0, textStyle } = this.properties
    const style = super.getTextStyle()

    // 通过 transform 重新设置 text 的位置
    return {
      ...style,
      ...(cloneDeep(textStyle) || {}),
      transform: `matrix(1 0 0 1 ${refX} ${refY})`,
    }
  }

  getNodeStyle(): LogicFlow.CommonTheme {
    const style = super.getNodeStyle()
    const {
      style: customNodeStyle,
      // radius = 0, // 第二种方式，设置圆角
    } = this.properties

    return {
      ...style,
      ...(cloneDeep(customNodeStyle) || {}),
      // rx: radius,
      // ry: radius,
    }
  }
}

export default VueNodeModel
