import { LineEdge, LineEdgeModel } from '@logicflow/core'
export const registerProcess: any = () => {
    class ProcessModel extends LineEdgeModel {
    setAttributes() {
      const {
         // @ts-ignore
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
