import { BezierEdge, BezierEdgeModel } from '@logicflow/core'
import { getShapeStyleFuction, getTextStyleFunction } from './getShapeStyleUtil'

class Model extends BezierEdgeModel {
  constructor (data, graphModel) {
    super(data, graphModel)
    this.strokeWidth = 1
  }
  getTextStyle () {
    const style = super.getTextStyle()
    const attributes = super.getAttributes()
    // console.log(style, attributes.properties)
    return getTextStyleFunction(style, attributes.properties)
  }

  getEdgeStyle () {
    const attributes = super.getEdgeStyle()
    const properties = this.properties;
    return getShapeStyleFuction(attributes, properties)
  }
}
export default {
  type: 'pro-bezier',
  view: BezierEdge,
  model: Model
}
