import { NodeData, GraphModel } from "@logicflow/core";

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
    constructor(data: NodeData, graphModel: GraphModel) {
      super(data, graphModel);
      // 多边形的节点属性 points
      this.points = [
        [50, 0],
        [100, 80],
        [0, 80],
      ];
    }
  }
  return {
    view: TriangleNode,
    model: TriangleNodeModel,
  };
};
