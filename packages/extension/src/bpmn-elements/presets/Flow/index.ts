import LogicFlow from '@logicflow/core'
import { sequenceFlowFactory } from './sequenceFlow'

export const SequenceFlow = sequenceFlowFactory()

export function registerFlows(lf: LogicFlow) {
  lf.register(SequenceFlow)
}
