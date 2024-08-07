class ResizableDiamondModel extends DiamondResize.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.text.draggable = true;
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.fill = "#f1a131";
    style.strokeWidth = 1;
    return style;
  }
}
class ResizableDiamondView extends DiamondResize.view {
}

export default {
  type: "resizable-diamond",
  view: ResizableDiamondView,
  model: ResizableDiamondModel
};
