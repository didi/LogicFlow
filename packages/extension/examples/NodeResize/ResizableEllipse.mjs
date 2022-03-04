class ResizableEllipseModel extends EllipseResize.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.rx = 30
    this.ry = 30
  }
  setAttributes() {
    this.text.editable = false;
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.fill = '#f1a131';
    style.strokeWidth = 1;
    return style;
  }
}
// eslint-disable-next-line no-undef
class ResizableEllipseView extends EllipseResize.view {}

export default {
  type: 'resizable-ellipse',
  view: ResizableEllipseView,
  model: ResizableEllipseModel,
};
