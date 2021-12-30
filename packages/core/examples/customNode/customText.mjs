class CustomTextModel extends TextNodeModel {
  setAttributes() {
    this.rx = 30
    this.ry = 30
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    if (this.properties.isSelected) {
      style.color = 'red'
    }
    return style
  }
}

export default {
  type: 'textNode',
  model: CustomTextModel,
  view: TextNode
}
