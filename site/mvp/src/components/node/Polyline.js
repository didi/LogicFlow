// import { PolylineEdge, PolylineEdgeModel } from '@logicflow/core'
import { getShapeStyleFuction, getTextStyleFunction } from './getShapeStyleUtil'
const PolylineEdge = window.PolylineEdge
const PolylineEdgeModel = window.PolylineEdgeModel
class View extends PolylineEdge {

}
class Model extends PolylineEdgeModel {
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
  type: 'pro-polyline',
  view: View,
  model: Model
}
