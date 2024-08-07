class CustomCircleModel extends CircleNodeModel {
  setAttributes() {
    this.r = 20;
    this.anchorsOffset = [
      [this.r, 0], // x 轴上偏移 size / 2
      [-this.r, 0], // x 轴上偏移 -size / 2
    ];
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    if (this.isHovered) {
      style.stroke = 'green'
    }
    if (this.properties.isConnectable) {
      style.fill = 'green'
    }
    return style
  }
}

export default {
  type: 'customCircle',
  model: CustomCircleModel,
  view: CircleNode
}

