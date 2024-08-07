import { PolylineEdge, PolylineEdgeModel, LogicFlow } from '@logicflow/core';
import EdgeTextTheme = LogicFlow.EdgeTextTheme;

class SequenceModel extends PolylineEdgeModel {
  // 设置边样式
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    const { properties } = this;
    if (properties.isstrokeDashed) {
      style.strokeDasharray = '4, 4';
    }
    style.stroke = 'orange';
    return style;
  }

  // 设置边文本样式
  getTextStyle() {
    const style: EdgeTextTheme = super.getTextStyle();
    style.color = '#3451F1';
    style.fontSize = 20;
    style.background = Object.assign({}, style.background, {
      fill: '#F2F131',
    });
    return style;
  }

  // 设置 hover 轮廓样式
  getOutlineStyle() {
    const style = super.getOutlineStyle();
    style.stroke = 'blue';
    return style;
  }
}

export default {
  type: 'sequence',
  view: PolylineEdge,
  model: SequenceModel,
};
