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

class CustomPolyline extends PolylineEdge {
  getArrow() {
    const { endPoint } = this.props.model
    return h('circle', {
      cx: endPoint.x,
      cy: endPoint.y,
      r: 4,
      fill: 'red'
    })
  }
}

export default {
  type: "custom-polyline",
  model: CustomPolylineModel,
  view: CustomPolyline
}