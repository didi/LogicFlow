class CustomBezierModel extends BezierEdgeModel {
  setAttributes () {
    this.offset = 40;
  }
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    const { properties } = this;
    if (properties.isActived) {
      style.strokeDasharray = '4 4'
    }
    style.stroke = 'orange'
    style.adjustLine.stroke = 'orange'
    style.adjustAnchor.fill = 'orange'
    style.adjustAnchor.stroke = 'orange'
    return style;
  }
}

class CustomBezier extends BezierEdge {}

export default {
  type: "custom-bezier",
  model: CustomBezierModel,
  view: CustomBezier
}