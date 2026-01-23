import { PolylineEdge, PolylineEdgeModel } from '@logicflow/core';

class StatusEdgeModel extends PolylineEdgeModel {
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    const { status } = this.properties || {};
    if (status === 'done') {
      style.stroke = '#52c41a'; // 绿色
    } else if (status === 'todo') {
      style.stroke = '#ff4d4f'; // 红色
    }
    style.strokeWidth = 2;
    return style;
  }
}

export const StatusEdge = {
  type: 'status-edge',
  view: PolylineEdge,
  model: StatusEdgeModel,
};
