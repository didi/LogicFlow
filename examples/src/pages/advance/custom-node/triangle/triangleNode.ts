type RegisterTriangleNodeType = {
  PolygonNode: any;
  PolygonNodeModel: any;
};

export const registerTriangleNode: any = ({
  PolygonNode,
  PolygonNodeModel,
}: RegisterTriangleNodeType) => {
  class TriangleNode extends PolygonNode {}
  class TriangleNodeModel extends PolygonNodeModel {
    setAttributes() {
      return {
        // 多边形的节点属性 points
        points: [
          [50, 0],
          [100, 80],
          [0, 80],
        ],
      };
    }
  }
  return {
    view: TriangleNode,
    model: TriangleNodeModel,
  };
};
