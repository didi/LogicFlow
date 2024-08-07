import { PolylineEdge, PolylineEdgeModel, h } from '@logicflow/core';

class CustomArrow extends PolylineEdge {
  getEndArrow() {
    const { model } = this.props;
    const {
      properties: { arrowType },
    } = model;

    const { stroke, strokeWidth } = model.getArrowStyle();
    const pathAttr = {
      stroke,
      strokeWidth,
    };
    console.log(arrowType, model.getArrowStyle());

    if (arrowType === 'empty') {
      // 空心箭头
      return h('path', {
        ...pathAttr,
        fill: '#FFF',
        d: 'M 0 0  -20 -5 -30 0 -20 5 z',
      });
    } else if (arrowType === 'half') {
      // 半箭头
      return h('path', {
        ...pathAttr,
        d: 'M 0 0 -10 5',
      });
    }
    return h('path', {
      ...pathAttr,
      d: 'M 0 0 -10 -5 -10 5 z',
    });
  }
}

export default {
  type: 'custom-arrow',
  model: PolylineEdgeModel,
  view: CustomArrow,
};
