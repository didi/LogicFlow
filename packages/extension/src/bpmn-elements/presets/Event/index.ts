import LogicFlow from '@logicflow/core'
import { EndEventFactory } from './EndEventFactory'
import { IntermediateCatchEventFactory } from './IntermediateCatchEvent'
import { StartEventFactory } from './StartEventFactory'
import { BoundaryEventFactory } from './boundaryEventFactory'
import { IntermediateThrowEventFactory } from './IntermediateThrowEvent'

export function registerEventNodes(lf: LogicFlow) {
  lf.register(StartEventFactory(lf))
  lf.register(EndEventFactory(lf))
  lf.register(IntermediateCatchEventFactory(lf))
  lf.register(IntermediateThrowEventFactory(lf))
  lf.register(BoundaryEventFactory(lf))
}
