type RegisterBeginNodeType = {
  RectNode: any;
  RectNodeModel: any;
};

export const registerBeginNode: any = ({
  RectNode,
  RectNodeModel,
}: RegisterBeginNodeType) => {
  class BeginNode extends RectNode {}
  class BeginNodeModel extends RectNodeModel {
    constructor(data: any, graphModel: any) {
      super(data, graphModel);
      const { size } = data.properties;
      if (size === 'big') {
        this.width = this.width * 1.3;
        this.height = this.height * 1.3;
      }
    }
  }
  return {
    view: BeginNode,
    model: BeginNodeModel,
  };
};
