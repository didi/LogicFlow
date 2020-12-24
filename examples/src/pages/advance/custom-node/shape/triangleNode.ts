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
    constructor(data: any, graphModel: any) {
      super(data, graphModel);
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
