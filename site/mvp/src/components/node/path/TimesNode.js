import { h } from '@logicflow/core'
import RectNode from '../basic/RectNode'
import { getShapeStyleFuction, getTextStyleFunction } from '../getShapeStyleUtil'

// 乘号
class TimesModel extends RectNode.model {
  initNodeData(data) {
    super.initNodeData(data)
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

class TimesView extends RectNode.view {
  getResizeShape() {
    const { x, y, width, height } = this.props.model
    const style = this.props.model.getNodeStyle()
    const pointList = [
      [x - 1/2 * width, y - 1/3 * height],
      [x - 1/3 * width, y - 1/2 * height],
      [x, y - 1/6 * height],
      [x + 1/3 * width, y - 1/2 * height],
      [x + 1/2 * width, y - 1/3 * height],
      [x + 1/6 * width, y],
      [x + 1/2 * width, y + 1/3 * height],
      [x + 1/3 * width, y + 1/2 * height],
      [x, y + 1/6 * height],
      [x - 1/3 * width, y + 1/2 * height],
      [x - 1/2 * width, y + 1/3 * height],
      [x - 1/6 * width, y],
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
      points: points.join(' ')
    }

    return h('g', {}, [
      h('polygon', { ...attrs })
    ])
  }

}

export default {
  type: 'times',
  view: TimesView,
  model: TimesModel
}