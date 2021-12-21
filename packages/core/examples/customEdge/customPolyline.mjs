class CustomPolylineModel extends PolylineEdgeModel {
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    const { properties } = this;
    if (properties.isActived) {
      style.strokeDasharray = '4 4'
    }
    style.stroke = 'green'
    return style;
  }
}

class CustomPolyline extends PolylineEdge {}

export default {
  type: "custom-polyline",
  model: CustomPolylineModel,
  view: CustomPolyline
}