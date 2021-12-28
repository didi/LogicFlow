import { h } from '@logicflow/core'
import RectNode from '../basic/RectNode'
import { getShapeStyleFuction, getTextStyleFunction } from '../getShapeStyleUtil'

// 除号
class DivideModel extends RectNode.model {
  constructor(data, graphData) {
    super(data, graphData)
    this.width = 80
    this.height = 80
  }
  getNodeStyle() {
    const style = super.getNodeStyle()
    const properties = this.getProperties()
    return getShapeStyleFuction(style, properties)
  }

  getTextStyle() {
    const style = super.getTextStyle()
    const properties = this.getProperties()
    return getTextStyleFunction(style, properties)
  }
}

class DivideView extends RectNode.view {
  getResizeShape() {
    const { x, y, width, height } = this.props.model
    const style = this.props.model.getNodeStyle()
    const pointList = [
      [x - 1/2 * width, y - 1/8 * height],
      [x + 1/2 * width, y - 1/8 * height],
      [x + 1/2 * width, y + 1/8 * height],
      [x - 1/2 * width, y + 1/8 * height],
    ]
    const points = pointList.map(item => {
      return `${item[0]},${item[1]}`
    })

    const attrs = {
      ...style,
      x,
      y,
      width,
      height,
    }

    // 除号中间横线
    const lineAttrs = {
      ...attrs,
      points: points.join(' ')
    }

    // 除号上圆点
    const upCircleAttrs = {
      ...attrs,
      cy: y - 3/8 * height,
      cx: x,
      r: 1/8 * height
    }

    // 除号下圆点
    const downCircleAttrs = {
      ...attrs,
      cy: y + 3/8 * height,
      cx: x,
      r: 1/8 * height
    }

    return h('g', {}, [
      h('polygon', { ...lineAttrs }),
      h('circle', { ...upCircleAttrs }),
      h('circle', { ...downCircleAttrs })
    ])
  }

}

export default {
  type: 'divide',
  view: DivideView,
  model: DivideModel
}