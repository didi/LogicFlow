import { registerEventNodes } from './presets/Event'
import { registerGatewayNodes } from './presets/Gateway'
import { registerTaskNodes } from './presets/Task'
import { registerFlows } from './presets/Flow'
import { timerIcon } from './presets/icons'
import * as icons from './presets/icons'
import * as bpmnUtils from './utils'

type DefinitionConfigType = {
  nodes: string[]
  definition: EventDefinitionType[] | TaskDefinitionType[]
}

type DefinitionPropertiesType = {
  definitionType: string
  timerType?: TimerType
  timerValue?: string
  [key: string]: any
}

type EventDefinitionType = {
  type: string
  icon: string | Record<string, any>
  toJSON: (data?: unknown) => unknown
  properties: DefinitionPropertiesType
  [key: string]: any
}

type TaskDefinitionType = {
  type: string
  [key: string]: any
}

type TimerType = 'timerCycle' | 'timerDate' | 'timerDuration'

const definitionConfig: DefinitionConfigType[] = [
  {
    nodes: ['startEvent', 'intermediateCatchEvent', 'boundaryEvent'],
    definition: [
      {
        type: 'bpmn:timerEventDefinition',
        icon: timerIcon,
        properties: {
          definitionType: 'bpmn:timerEventDefinition',
          timerValue: '',
          timerType: '',
        },
      },
    ],
  },
]

export function useDefinition(definition: any) {
  function setDefinition(config: DefinitionConfigType[]) {
    function set(
      nodes: any[],
      definitions: EventDefinitionType[] | TaskDefinitionType[],
    ) {
      nodes.forEach((name) => {
        if (!definition?.[name]) {
          definition[name] = new Map()
        }
        const map = definition?.[name]
        definitions.forEach((define) => {
          map.set(define.type, define)
        })
      })
      return definition
    }

    config.forEach((define: any) => {
      set(define.nodes, define.definition)
    })
  }

  return () => [definition, setDefinition]
}

export class BPMNElements {
  static pluginName = 'BpmnElementsPlugin'

  constructor({ lf }: any) {
    lf.definition = {}
    lf.useDefinition = useDefinition(lf.definition)
    const [_definition, setDefinition] = lf.useDefinition()
    console.log('_definition', _definition)
    setDefinition(definitionConfig)

    registerEventNodes(lf)
    registerGatewayNodes(lf)
    registerFlows(lf)
    registerTaskNodes(lf)

    lf.setDefaultEdgeType('bpmn:sequenceFlow')
  }
}

export * from './presets/Event/EndEventFactory'
export * from './presets/Event/IntermediateCatchEvent'
export * from './presets/Event/StartEventFactory'
export * from './presets/Event/boundaryEventFactory'
export * from './presets/Event/IntermediateThrowEvent'
export * from './presets/Flow/sequenceFlow'
export * from './presets/Task/task'
export * from './presets/Task/subProcess'
export * from './presets/Gateway/gateway'
export { icons, bpmnUtils }
