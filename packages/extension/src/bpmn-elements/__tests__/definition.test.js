/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-undef */
import LogicFlow from '@logicflow/core'
import { BPMNElements } from '../index'

// const registerEventNodes = new (jest.fn())();
// const registerGatewayNodes = new (jest.fn())();
// const registerFlows = new (jest.fn())();
// const registerTaskNodes = new (jest.fn())();

/** */
describe('Test bpmn elements: definitionConfig', () => {
  LogicFlow.use(BPMNElements)
  const div = document.createElement('div')
  document.body.appendChild(div)
  const lf = new LogicFlow({
    container: div,
  })
  const [definition, setDefinition] = lf.useDefinition()

  //   默认definition配置
  //   const definitionConfig: DefinitionConfigType[] = [
  //     {
  //       nodes: ['startEvent', 'intermediateCatchEvent', 'boundaryEvent'],
  //       definition: [
  //         {
  //           type: 'bpmn:timerEventDefinition',
  //           icon: timerIcon,
  //           properties: {
  //             definitionType: 'bpmn:timerEventDefinition',
  //             timerValue: '',
  //             timerType: '',
  //           },
  //         },
  //       ],
  //     },
  //   ]

  test('nodes startEvent, intermediateCatchEvent, boundaryEvent, contain default definition: bpmn:timerEventDefinition', () => {
    expect(Object.keys(definition)).toEqual([
      'boundaryEvent',
      'intermediateCatchEvent',
      'startEvent',
    ])
    expect(definition.startEvent.has('bpmn:timerEventDefinition')).toBe(true)
    expect(definition.boundaryEvent.has('bpmn:timerEventDefinition')).toBe(true)
    expect(
      definition.intermediateCatchEvent.has('bpmn:timerEventDefinition'),
    ).toBe(true)
  })

  test('after setting new definition by setDefinition for startEvent, startEvent should contain two definition: bpmn:timerEventDefinition, bpmn:messageEventDefinition', () => {
    setDefinition([
      {
        nodes: ['startEvent'],
        definition: [
          {
            type: 'bpmn:messageEventDefinition',
            icon: messageIcon,
            properties: {
              panels: [],
              definitionType: 'bpmn:messageEventDefinition',
            },
          },
        ],
      },
    ])

    expect(Array.from(definition.startEvent.keys()).length).toBe(2)
    expect(definition.startEvent.has('bpmn:messageEventDefinition')).toBe(true)
  })
})
