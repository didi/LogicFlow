import { PolygonNode, PolygonNodeModel } from '@logicflow/core';
class TriangleNodeModel extends PolygonNodeModel {
  setAttributes() {
    // 多边形的节点属性 points
    this.points = [
      [50, 0],
      [100, 80],
      [0, 80],
    ];
  }
}
export const TriangleNode = {
  type: 'triangle',
  view: PolygonNode,
  model: TriangleNodeModel,
};