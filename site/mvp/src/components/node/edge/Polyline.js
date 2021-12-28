import { PolylineEdge, PolylineEdgeModel } from '@logicflow/core'
import { getShapeStyleFuction, getTextStyleFunction } from '../getShapeStyleUtil'

 // 折线
class Model extends PolylineEdgeModel {
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
    return getShapeStyleFuction(attributes, properties)
  }
}
export default {
  type: 'pro-polyline',
  view: PolylineEdge,
  model: Model
}
