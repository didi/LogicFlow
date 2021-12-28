class CustomPolygonModel extends PolygonNodeModel {
  setAttributes() {
    this.points = [
      [45, 0],
      [20, 90],
      [90, 30],
      [0, 30],
      [80, 90]
    ];
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    if (this.properties.isSelected) {
      style.fill = 'red'
    }
    if (this.isHovered) {
      style.stroke = 'red'
    }
    return style
  }
}

export default {
  type: 'polygonNode',
  model: CustomPolygonModel,
  view: PolygonNode
}
