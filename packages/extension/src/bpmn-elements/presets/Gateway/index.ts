import LogicFlow from '@logicflow/core'
import { exclusiveIcon, parallelIcon, inclusiveIcon } from '../icons'
import { GatewayNodeFactory } from './gateway'

export function registerGatewayNodes(lf: LogicFlow) {
  const ExclusiveGateway = GatewayNodeFactory(
    'bpmn:exclusiveGateway',
    exclusiveIcon,
  )

  const ParallelGateway = GatewayNodeFactory(
    'bpmn:parallelGateway',
    parallelIcon,
  )

  const InclusiveGateway = GatewayNodeFactory(
    'bpmn:inclusiveGateway',
    inclusiveIcon,
  )
  lf.register(ExclusiveGateway)
  lf.register(InclusiveGateway)
  lf.register(ParallelGateway)
}
