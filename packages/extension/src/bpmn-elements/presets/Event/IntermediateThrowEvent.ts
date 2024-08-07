import {
  h,
  CircleNode,
  CircleNodeModel,
  GraphModel,
  LogicFlow,
} from '@logicflow/core'
import { genBpmnId, groupRule } from '../../utils'

import NodeConfig = LogicFlow.NodeConfig

export function IntermediateThrowEventFactory(lf: any): {
  type: string
  model: any
  view: any
} {
  const [definition] = lf.useDefinition()

  class view extends CircleNode {
    getAnchorStyle() {
      return {
        visibility: 'hidden',
      }
    }

    getShape() {
      // @ts-ignore
      const { model } = this.props
      const style = model.getNodeStyle()
      const { x, y, r, width, height, properties } = model as CircleNodeModel
      const { definitionType } = properties
      const { icon } =
        definition.intermediateThrowEvent?.get(definitionType) || {}

      const i = Array.isArray(icon)
        ? h(
            'g',
            {
              transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
            },
            ...icon,
          )
        : h('path', {
            transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
            d: icon,
            style: 'fill: black',
          })
      return h(
        'g',
        {},
        h('circle', {
          ...style,
          cx: x,
          cy: y,
          r,
          strokeWidth: 1.5,
        }),
        h('circle', {
          ...style,
          cx: x,
          cy: y,
          r: r - 3,
          strokeWidth: 1.5,
        }),
        i,
      )
    }
  }

  class model extends CircleNodeModel {
    constructor(data: NodeConfig, graphModel: GraphModel) {
      if (!data.id) {
        data.id = `Event_${genBpmnId()}`
      }
      if (!data.text) {
        data.text = ''
      }
      if (data.text && typeof data.text === 'string') {
        data.text = {
          value: data.text,
          x: data.x,
          y: data.y + 40,
        }
      }
      const { properties = {} } =
        definition.intermediateThrowEvent?.get(
          data.properties?.definitionType,
        ) || {}
      data.properties = {
        ...properties,
        ...data.properties,
      }
      data.properties?.definitionType &&
        (data.properties!.definitionId = `Definition_${genBpmnId()}`)
      super(data, graphModel)
      groupRule.call(this)
    }

    setAttributes(): void {
      this.r = 18
    }
  }

  return {
    type: 'bpmn:intermediateThrowEvent',
    view,
    model,
  }
}
