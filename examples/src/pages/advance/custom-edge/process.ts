export const registerProcess: any = ({ LineEdge, LineEdgeModel }: any) => {
  class ProcessModel extends LineEdgeModel {
    setAttributes() {
      const {
        properties: { isExecuted },
      } = this;

      if (isExecuted) {
        this.stroke = "green";
      }
    }
  }
  return {
    type: 'process',
    view: LineEdge,
    model: ProcessModel,
  };
};
