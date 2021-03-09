type RegisterGatewayNodeType = {
  PolygonNode: any;
  PolygonNodeModel: any;
};

export const registerGatewayNode: any = ({
  PolygonNode,
  PolygonNodeModel,
}: RegisterGatewayNodeType) => {
  class GatewayNode extends PolygonNode {}
  class GatewayNodeModel extends PolygonNodeModel {
    setAttributes() {
      return {
        points: [
          [50, 0],
          [100, 50],
          [50, 100],
          [0, 50],
        ],
      };
    }
  }
  return {
    view: GatewayNode,
    model: GatewayNodeModel,
  };
};
