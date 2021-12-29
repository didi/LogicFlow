class CustomNodeModel extends RectNodeModel {
  getNodeStyle() {
    const style = super.getNodeStyle();
    if (this.properties.isSelected) {
      style.fill = 'red'
    }
    if (this.isSelected) {
      style.stroke = 'red'
    }
    return style
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

export default {
  type: 'customNode',
  model: CustomNodeModel,
  view: RectNode
}
