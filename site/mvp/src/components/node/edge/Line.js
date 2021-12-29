import { LineEdge, LineEdgeModel } from '@logicflow/core'
import { getShapeStyleFuction, getTextStyleFunction } from '../getShapeStyleUtil'

// 直线
class Model extends LineEdgeModel {
  constructor (data, graphModel) {
    super(data, graphModel)
    this.strokeWidth = 1
  }
  getTextStyle () {
    const style = super.getTextStyle()
    const attributes = super.getAttributes()
    return getTextStyleFunction(style, attributes.properties)
  }

  getEdgeStyle () {
    const attributes = super.getEdgeStyle()
    const properties = this.properties;
    const style = getShapeStyleFuction(attributes, properties)
    return { ...style, fill: 'none' }
  }
}
export default {
  type: 'pro-line',
  view: LineEdge,
  model: Model
}
