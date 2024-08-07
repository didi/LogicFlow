class CustomEllipseModel extends EllipseNodeModel {
  setAttributes() {
    this.rx = 30
    this.ry = 60
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
  type: 'ellipseNode',
  model: CustomEllipseModel,
  view: EllipseNode
}
