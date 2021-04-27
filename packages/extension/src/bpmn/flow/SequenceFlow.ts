import { PolylineEdge, PolylineEdgeModel } from '@logicflow/core';
import { getBpmnId } from '../getBpmnId';

class SequenceFlowModel extends PolylineEdgeModel {
  static extendKey = 'SequenceFlowModel';
  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `Flow_${getBpmnId()}`;
    }
    super(data, graphModel);
  }
}

class SequenceFlowView extends PolylineEdge {
  static extendKey = 'SequenceFlowEdge';
}

const SequenceFlow = {
  type: 'bpmn:sequenceFlow',
  view: SequenceFlowView,
  model: SequenceFlowModel,
};

export { SequenceFlowView, SequenceFlowModel };
export default SequenceFlow;
