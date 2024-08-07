import LogicFlow, {
  h,
  GraphModel,
  RectNode,
  RectNodeModel,
} from '@logicflow/core'
import { parallelMarker, sequentialMarker, loopMarker } from '../icons'
import { genBpmnId, groupRule } from '../../utils'

import NodeConfig = LogicFlow.NodeConfig

export const multiInstanceIcon: any = {
  parallel: parallelMarker,
  sequential: sequentialMarker,
  loop: loopMarker,
}

type TaskType = {
  multiInstanceType: string
  properties: Record<string, any>
  [key: string]: any
}

/**
 * @param type 任务节点的type, 对应其XML定义中的节点名，如<bpmn:userTask /> 其type为bpmn:userTask
 * @param icon 任务节点左上角的图标，可以是svg path，也可以是h函数生成的svg
 * @param props (可选) 任务节点的属性
 * @returns { type: string, model: any, view: any }
 */
export function TaskNodeFactory(
  type: string,
  icon: string | any[],
  props?: any,
): {
  type: string
  model: any
  view: any
} {
  class view extends RectNode {
    getLabelShape() {
      // @ts-ignore
      const { model } = this.props
      const { x, y, width, height } = model
      const style = model.getNodeStyle()
      const i = Array.isArray(icon)
        ? h(
            'g',
            {
              transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
            },
            ...icon,
          )
        : h('path', {
            fill: style.stroke,
            d: icon,
          })
      return h(
        'svg',
        {
          x: x - width / 2 + 5,
          y: y - height / 2 + 5,
          width: 25,
          height: 25,
          viewBox: '0 0 1274 1024',
        },
        i,
      )
    }

    getShape() {
      // @ts-ignore
      const { model } = this.props
      const { x, y, width, height, radius, properties } = model
      const style = model.getNodeStyle()
      return h('g', {}, [
        h('rect', {
          ...style,
          x: x - width / 2,
          y: y - height / 2,
          rx: radius,
          ry: radius,
          width,
          height,
          opacity: 0.95,
        }),
        this.getLabelShape(),
        h(
          'g',
          {
            transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
          },
          h('path', {
            fill: 'white',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            stroke: 'rgb(34, 36, 42)',
            strokeWidth: '2',
            d: multiInstanceIcon[properties.multiInstanceType as any] || '', // TODO: 确认 properties.multiInstanceType 的类型
          }),
        ),
      ])
    }
  }

  class model extends RectNodeModel {
    boundaryEvents: any // TODO: 确认该属性类型，可移除查看其导致的问题

    constructor(data: NodeConfig, graphModel: GraphModel) {
      if (!data.id) {
        data.id = `Activity_${genBpmnId()}`
      }
      const properties: TaskType = {
        ...(props || {}),
        ...data.properties,
        // multiInstanceType: '',
        // panels: ['multiInstance'],
      }
      data.properties = properties
      super(data, graphModel)
      properties?.boundaryEvents?.forEach((id: string) => {
        this.addBoundaryEvent(id)
      })
      this.deleteProperty('boundaryEvents')
      groupRule.call(this)
    }

    initNodeData(data: any) {
      super.initNodeData(data)
      this.isTaskNode = true // 标识此节点是任务节点，可以被附件边界事件
      this.boundaryEvents = [] // 记录自己附加的边界事件
    }

    getNodeStyle() {
      const style = super.getNodeStyle()
      // isBoundaryEventTouchingTask属性用于标识拖动边界节点是否靠近此节点
      // 如果靠近，则高亮提示
      // style.fill = 'rgb(255, 230, 204)';
      const { isBoundaryEventTouchingTask } = this.properties
      if (isBoundaryEventTouchingTask) {
        style.stroke = '#00acff'
        style.strokeWidth = 2
      }
      return style
    }

    getOutlineStyle() {
      const style = super.getOutlineStyle()
      style.stroke = 'transparent'
      !style.hover && (style.hover = {})
      style.hover.stroke = 'transparent'
      return style
    }

    /**
     * 提供方法给插件在判断此节点被拖动边界事件节点靠近时调用，从而触发高亮
     */
    setTouching(flag: boolean) {
      this.setProperty('isBoundaryEventTouchingTask', flag)
    }

    /**
     * 附加后记录被附加的边界事件节点Id
     */
    addBoundaryEvent(nodeId: string) {
      this.setTouching(false)
      if (this.boundaryEvents.find((item: string) => item === nodeId)) {
        return false
      }
      const boundaryEvent = this.graphModel.getNodeModelById(nodeId)
      boundaryEvent?.setProperties({
        attachedToRef: this.id,
      })
      this.boundaryEvents.push(nodeId)
      return true
    }

    /**
     * 被附加的边界事件节点被删除时，移除记录
     */
    deleteBoundaryEvent(nodeId: string) {
      this.boundaryEvents = this.boundaryEvents.filter(
        (item: string) => item !== nodeId,
      )
    }
  }

  // @ts-ignore
  return {
    type,
    view,
    model,
  }
}
