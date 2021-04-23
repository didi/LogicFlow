import { LineEdge, LineEdgeModel } from '@logicflow/core';
import { getBpmnId } from '../getBpmnId';

class SequenceFlowModel extends LineEdgeModel {
  static extendKey = 'SequenceFlowModel';
  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `Flow_${getBpmnId()}`;
    }
    super(data, graphModel);
  }
}

class SequenceFlowView extends LineEdge {
  static extendKey = 'SequenceFlowEdge';
}

const SequenceFlow = {
  view: SequenceFlowView,
  model: SequenceFlowModel,
};

export { SequenceFlowView, SequenceFlowModel };
export default SequenceFlow;
