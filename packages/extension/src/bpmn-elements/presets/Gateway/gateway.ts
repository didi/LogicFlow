import LogicFlow, {
  h,
  Polygon,
  GraphModel,
  PolygonNode,
  PolygonNodeModel,
} from '@logicflow/core'
import { genBpmnId, groupRule } from '../../utils'

import NodeConfig = LogicFlow.NodeConfig

export const gateway = {
  exclusive: 0,
  inclusive: 1,
  parallel: 2,
}

/**
 * index 0 排他网关
 * index 1 包容网关
 * index 2 并行网关
 */
export const gatewayComposable = [
  [1, 1, 0],
  [0, 0, 1],
  [0, 1, 1],
]

/**
 * @param type 网关节点的type, 对应其XML定义中的节点名，如<bpmn:inclusiveGateway /> 其type为bpmn:inclusiveGateway
 * @param icon 网关节点左上角的图标，可以是svg path，也可以是h函数生成的svg
 * @param props (可选) 网关节点的属性
 * @returns { type: string, model: any, view: any }
 */
export function GatewayNodeFactory(
  type: string,
  icon: string | object,
  props?: any,
): {
  type: string
  model: any
  view: any
} {
  class view extends PolygonNode {
    getShape() {
      const { model } = this.props
      const { x, y, width, height, points } = model as PolygonNodeModel
      const style = model.getNodeStyle()
      return h(
        'g',
        {
          transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
        },
        h(Polygon, {
          ...style,
          x,
          y,
          points,
        }),
        typeof icon === 'string'
          ? h('path', {
              d: icon,
              ...style,
              fill: 'rgb(34, 36, 42)',
              strokeWidth: 1,
            })
          : icon,
      )
    }
  }

  class model extends PolygonNodeModel {
    constructor(data: NodeConfig, graphModel: GraphModel) {
      if (!data.id) {
        data.id = `Gateway_${genBpmnId()}`
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
      data.properties = {
        ...(props || {}),
        ...data.properties,
      }
      super(data, graphModel)
      this.points = [
        [25, 0],
        [50, 25],
        [25, 50],
        [0, 25],
      ]
      groupRule.call(this)
    }
  }

  return {
    type,
    view,
    model,
  }
}
