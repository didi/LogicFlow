class CustomTextModel extends TextNodeModel {
  setAttributes() {
    this.rx = 30
    this.ry = 30
  }
  getTextStyle() {
    const style = super.getTextStyle();
    if (this.properties.isSelected) {
      style.color = 'red'
    }
    style.fontSize = 40;
    return style
  }
}

export default {
  type: 'textNode',
  model: CustomTextModel,
  view: TextNode
}
