import { PolylineEdge, PolylineEdgeModel } from '@logicflow/core'
import { getBpmnId } from '../getBpmnId'

export class SequenceFlowModel extends PolylineEdgeModel {
  static extendKey = 'SequenceFlowModel'

  constructor(data, graphModel) {
    if (!data.id) {
      data.id = `Flow_${getBpmnId()}`
    }
    super(data, graphModel)
  }
}

export class SequenceFlowView extends PolylineEdge {
  static extendKey = 'SequenceFlowEdge'
}

export const SequenceFlow = {
  type: 'bpmn:sequenceFlow',
  view: SequenceFlowView,
  model: SequenceFlowModel,
}

export default SequenceFlow
