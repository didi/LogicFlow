import { getBpmnId } from '../getBpmnId';
import { PolylineEdgeModelContractor, PolylineEdgeViewContractor } from '../../type/index';

export const getSequenceFlowModel = (
  LineEdgeModel: PolylineEdgeModelContractor,
): PolylineEdgeModelContractor => {
  class SequenceFlowModel extends LineEdgeModel {
    static extendKey = 'SequenceFlowModel';
    constructor(data, graphModel) {
      if (!data.id) {
        data.id = `Flow_${getBpmnId()}`;
      }
      super(data, graphModel);
    }
  }
  return SequenceFlowModel;
};

export const getSequenceFlowView = (
  LineEdge: PolylineEdgeViewContractor,
): PolylineEdgeViewContractor => {
  class SequenceFlowEdge extends LineEdge {
    static extendKey = 'SequenceFlowEdge';
  }
  return SequenceFlowEdge;
};
