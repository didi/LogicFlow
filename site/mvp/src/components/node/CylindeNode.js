import { h } from '@logicflow/core'
import { RectResize } from '@logicflow/extension'
import { getShapeStyleFuction, getTextStyleFunction } from './getShapeStyleUtil'

class CylindeModel extends RectResize.model {
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

class CylindeView extends RectResize.view {
  getResizeShape () {
    const { x, y, width, height } = this.props.model
    const style = this.props.model.getNodeStyle()
    // 圆柱体顶部椭圆
    const ellipseAttrs = {
      ...style,
      cx: x,
      cy: y - 1/3 * height,
      rx: 1/3 * width,
      ry: 1/10 * height,
      width,
      height
    }
    // 圆柱体左直线 
    const pathAAttrs = {
      ...style,
      d: `M ${x - 1/3 * width} ${y - 1/3 * height} L ${x - 1/3 * width} ${y + 1/3 * height}`
    }
    // 圆柱体右直线
    const pathBAttrs = {
      ...style,
      d: `M ${x + 1/3 * width} ${y - 1/3 * height} L ${x + 1/3 * width} ${y + 1/3 * height}`
    }
    // 圆柱体下曲线
    const pathCAttrs = {
      ...style,
      d: `M ${x - 1/3 * width} ${y + 1/3 * height}
      Q ${x} ${y + 5/9 * height} ${x + 1/3 * width} ${y + 1/3 * height}`
    }
    // 圆柱体中间填充部分
    const rectAttrs = {
      x: x - 1/3 * width,
      y: y - 1/3 * height,
      width: 2/3 * width,
      height: 2/3 * height,
      style: 'fill: transparent'
    }
    return h('g', {}, [
      h('ellipse', {
        ...ellipseAttrs
      }),
      h('path', {
        ...pathAAttrs
      }),
      h('path', {
        ...pathBAttrs
      }),
      h('path', {
        ...pathCAttrs
      }),
      h('rect', {
        ...rectAttrs
      })
    ])
  }
}

export default {
  type: 'cylinde',
  model: CylindeModel,
  view: CylindeView
}