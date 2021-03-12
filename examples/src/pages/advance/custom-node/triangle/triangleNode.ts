export const registerTriangleNode: any = ({ PolygonNode, PolygonNodeModel }: any) => {
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
  return {
    view: PolygonNode,
    model: TriangleNodeModel,
  };
};
