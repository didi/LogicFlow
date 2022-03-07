import { h } from '@logicflow/core'
import RectNode from '../basic/RectNode'
import { getShapeStyleFuction, getTextStyleFunction } from '../getShapeStyleUtil'

// 七边形
class SeptagonModel extends RectNode.model {
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

class SeptagonView extends RectNode.view {
  getResizeShape() {
    const { x, y, width, height } = this.props.model
    const style = this.props.model.getNodeStyle()
    const pointList = [
      [x, y - 0.5 * height],
      [x + 0.395 * width, y - 0.3 * height],
      [x + 0.5 * width, y + 0.145 * height],
      [x + 0.225 * width, y + 0.5 * height],
      [x - 0.225 * width, y + 0.5 * height],
      [x - 0.5 * width, y + 0.145 * height],
      [x - 0.395 * width, y - 0.3 * height]
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
  type: 'septagon',
  view: SeptagonView,
  model: SeptagonModel
}