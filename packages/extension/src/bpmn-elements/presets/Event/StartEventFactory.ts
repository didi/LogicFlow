/* eslint-disable @typescript-eslint/naming-convention */
import {
  h,
  CircleNode,
  CircleNodeModel,
  GraphModel,
  LogicFlow,
} from '@logicflow/core'
import { genBpmnId } from '../../utils'
import NodeConfig = LogicFlow.NodeConfig

export function StartEventFactory(lf: any): {
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
      const { definitionType, isInterrupting } = properties
      const { icon } = definition.startEvent?.get(definitionType) || {}
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
            style:
              'fill: white; stroke-linecap: round; stroke-linejoin: round; stroke: rgb(34, 36, 42); stroke-width: 1px;',
          })
      return h(
        'g',
        {},
        h('circle', {
          ...style,
          cx: x,
          cy: y,
          r,
          strokeDasharray: isInterrupting ? '5,5' : '',
          strokeWidth: 2,
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
        definition.startEvent?.get(data.properties?.definitionType) || {}
      data.properties = {
        ...properties,
        ...data.properties,
      }
      data.properties?.definitionType &&
        (data.properties!.definitionId = `Definition_${genBpmnId()}`)
      super(data, graphModel)
    }

    setAttributes(): void {
      this.r = 18
    }

    getConnectedTargetRules() {
      const rules = super.getConnectedTargetRules()
      const notAsSource = {
        message: '起始节点不能作为边的终点',
        validate: (_source: any, target: any) => {
          if (target === this) {
            return false
          }
          return true
        },
      }
      rules.push(notAsSource)
      return rules
    }
  }

  return {
    type: 'bpmn:startEvent',
    view,
    model,
  }
}
