import { PolylineEdge, PolylineEdgeModel } from '@logicflow/core';

export class PropertyHoverEdgeModel extends PolylineEdgeModel {
  initEdgeData(data: any) {
    super.initEdgeData(data);
    // 初始化 hover 状态
    this.properties.isHover = false;
  }

  // 这个方法可以在需要时读取
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    const { isHover } = this.properties;

    if (isHover) {
      return {
        ...style,
        stroke: '#ff4d4f',
        strokeWidth: 3,
      };
    }

    return {
      ...style,
      stroke: '#999',
      strokeWidth: 5,
    };
  }
}

export const HoverEdge = {
  type: 'hover-edge',
  view: PolylineEdge,
  model: PropertyHoverEdgeModel,
};
