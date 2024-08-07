class CustomDiamondModel extends DiamondNodeModel {
  setAttributes() {
    this.rx = 30
    this.ry = 30
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    if (this.properties.isSelected) {
      style.fill = 'red'
    }
    if (this.isHovered) {
      style.stroke = 'red'
    }
    if (this.state === 5) {
      style.fill = 'red'
    }
    return style
  }
}

export default {
  type: 'diamondNode',
  model: CustomDiamondModel,
  view: DiamondNode
}
