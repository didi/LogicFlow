class CustomCircleModel extends CircleNodeModel {
  setAttributes() {
    this.r = 20;
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    if (this.isHovered) {
      style.stroke = 'green'
    }
    return style
  }
}

export default {
  type: 'customCircle',
  model: CustomCircleModel,
  view: CircleNode
}

