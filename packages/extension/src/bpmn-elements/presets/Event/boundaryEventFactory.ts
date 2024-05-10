/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  CircleNode,
  CircleNodeModel,
  GraphModel,
  h,
  LogicFlow,
} from '@logicflow/core'
import { genBpmnId, groupRule } from '../../utils'
import NodeConfig = LogicFlow.NodeConfig

export function BoundaryEventFactory(lf: any): {
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
      const { definitionType, cancelActivity } = properties
      const { icon } = definition.boundaryEvent?.get(definitionType) || {}
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
          })
      return h(
        'g',
        {},
        h('circle', {
          ...style,
          cx: x,
          cy: y,
          r,
          strokeDasharray: cancelActivity ? '' : '5,5',
          strokeWidth: 1.5,
        }),
        h('circle', {
          ...style,
          cx: x,
          cy: y,
          r: r - 3,
          strokeDasharray: cancelActivity ? '' : '5,5',
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
        definition.boundaryEvent?.get(data.properties?.definitionType) || {}

      data.properties = {
        attachedToRef: '',
        cancelActivity: true,
        ...properties,
        ...data.properties,
      }
      data.properties?.definitionType &&
        (data.properties!.definitionId = `Definition_${genBpmnId()}`)
      super(data, graphModel)
      groupRule.call(this)
    }

    initNodeData(data: any) {
      super.initNodeData(data)
      this.r = 20
      this.autoToFront = false // 不自动设置到最顶部，而是使用自己的zIndex
      this.zIndex = 99999 // 保证边界事件节点用于在最上方
    }

    setAttributes(): void {
      this.r = 18
    }
  }

  return {
    type: 'bpmn:boundaryEvent',
    view,
    model,
  }
}
