class CustomLineEdgeModel extends LineEdgeModel {
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    const { properties } = this;
    if (properties.isActived) {
      style.strokeDasharray = '4 1'
    }
    style.stroke = 'blue'
    return style;
  }
}

class CustomLine extends LineEdge {}

export default {
  type: "custom-line",
  model: CustomLineEdgeModel,
  view: CustomLine
}