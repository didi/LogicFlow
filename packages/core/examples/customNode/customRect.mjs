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
}

export default {
  type: 'customNode',
  model: CustomNodeModel,
  view: RectNode
}
