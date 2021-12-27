import { h } from '@logicflow/core'
import { RectResize } from '@logicflow/extension'
import { getShapeStyleFuction, getTextStyleFunction } from './getShapeStyleUtil'

class ActorModel extends RectResize.model {
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

class ActorView extends RectResize.view {
  getResizeShape() {
    const { x, y, width, height } = this.props.model
    const style = this.props.model.getNodeStyle()
    // 人物头部圆形
    const circleAttrs = {
      ...style,
      cx: x,
      cy: y - 1/3 * height,
      r: 1/8 * width,
      width,
      height
    }
    // 人物肩膀横线
    const pathAAttrs = {
      ...style,
      d: `M ${x - 1/5 * width} ${y - 1/8 * height} L ${x + 1/5 * width} ${y - 1/8 * height}`
    }
    // 人物身体躯干竖线
    const pathBAttrs = {
      ...style,
      d: `M ${x} ${y - 1/3 * height + 1/8 * width} L ${x} ${y + 1/5 * height}`
    }
    // 人物左腿斜线
    const pathCAttrs = {
      ...style,
      d: `M ${x} ${y + 1/5 * height} L ${x - 1/5 * width} ${y + 1/2 * height}`
    }
    // 人物右腿斜线
    const pathDAttrs = {
      ...style,
      d: `M ${x} ${y + 1/5 * height} L ${x + 1/5 * width} ${y + 1/2 * height}`
    }
    // 人物透明背景板
    const bgAttrs = {
      x: x - 1/5 * width,
      y: y - 1/2 * height,
      width: 2/5 * width,
      height,
      style: 'fill: transparent'
    }
    return h('g', {}, [
      h('circle', {
        ...circleAttrs,
      }),
      h('path', {
        ...pathAAttrs,
      }),
      h('path', {
        ...pathBAttrs
      }),
      h('path', {
        ...pathCAttrs
      }),
      h('path', {
        ...pathDAttrs
      }),
      h('rect', {
        ...bgAttrs
      })
    ]
    );
  }
}

export default {
  type: 'actor',
  view: ActorView,
  model: ActorModel
}