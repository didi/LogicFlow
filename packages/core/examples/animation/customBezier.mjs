class CustomBezierModel extends BezierEdgeModel {
  setAttributes () {
    this.offset = 40;
  }
  getAnimation() {
    const animation = super.getAnimation();
    animation.stroke = "blue";
    return animation;
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
  getTextStyle() {
    const style = super.getTextStyle();
    style.color = "red";
    style.overflowMode = "autoWrap";
    style.textAlign = "right";
    style.fontSize = 40;
    return style;
  }
}

class CustomBezier extends BezierEdge {}

export default {
  type: "custom-bezier",
  model: CustomBezierModel,
  view: CustomBezier
}