class LogicLineEdge extends BezierEdge {}
class LogicLineModel extends BezierEdgeModel {
  initEdgeData(data) {
    if (data.sourceOutputName) {
      data.sourceAnchorId = data.sourceOutputName;
    }
    super.initEdgeData(data);
  }
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    style.strokeWidth = 1;
    style.stroke = this.isSelected ? '#ff7f0e' : '#999';
    return style;
  }
  getData() {
    const data = super.getData();
    data.sourceOutputName = this.sourceAnchorId;
    return data;
  }
}

export default {
  type: 'LogicLine',
  model: LogicLineModel,
  view: LogicLineEdge
}