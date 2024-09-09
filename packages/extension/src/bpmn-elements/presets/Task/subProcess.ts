import { h } from '@logicflow/core'
import { GroupNode, GroupNodeModel } from '../../../materials/group'

export function SubProcessFactory(): {
  type: string
  model: any
  view: any
} {
  class view extends GroupNode {
    getFoldIcon() {
      const { model } = this.props
      const { x, y, width, height, properties, foldable } =
        model as GroupNodeModel
      const foldX = model.x - model.width / 2 + 5
      const foldY = model.y - model.height / 2 + 5
      if (!foldable) return null
      const iconIcon = h('path', {
        fill: 'none',
        stroke: '#818281',
        strokeWidth: 2,
        'pointer-events': 'none',
        d: properties.isFolded
          ? `M ${foldX + 3},${foldY + 6} ${foldX + 11},${foldY + 6} M${
              foldX + 7
            },${foldY + 2} ${foldX + 7},${foldY + 10}`
          : `M ${foldX + 3},${foldY + 6} ${foldX + 11},${foldY + 6} `,
      })
      return h('g', {}, [
        h('rect', {
          height: 12,
          width: 14,
          rx: 2,
          ry: 2,
          strokeWidth: 1,
          fill: '#F4F5F6',
          stroke: '#CECECE',
          cursor: 'pointer',
          x: x - width / 2 + 5,
          y: y - height / 2 + 5,
          onClick: (e: any) => {
            e.stopPropagation()
            ;(model as GroupNodeModel).foldGroup?.(!properties.isFolded)
          },
        }),
        iconIcon,
      ])
    }

    getResizeShape() {
      const { model } = this.props
      const { x, y, width, height } = model
      const style = model.getNodeStyle()
      const foldRectAttrs = {
        ...style,
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        stroke: 'black',
        strokeWidth: 2,
        strokeDasharray: '0 0',
      }
      return h('g', {}, [
        // this.getAddAbleShape(),
        h('rect', { ...foldRectAttrs }),
        this.getFoldIcon(),
      ])
    }
  }

  class model extends GroupNodeModel {
    boundaryEvents: any

    initNodeData(data: {
      width: number
      height: number
      properties: Record<string, any>
    }) {
      super.initNodeData(data)
      this.foldable = true
      // this.isFolded = true;
      this.resizable = true
      this.width = 400
      this.height = 200
      // 根据 properties中的配置重设 宽高
      this.resetWidthHeight()
      this.isTaskNode = true // 标识此节点是任务节点，可以被附件边界事件
      this.boundaryEvents = [] // 记录自己附加的边界事件
    }

    // 自定义根据properties.iniProp
    resetWidthHeight() {
      const width = (this.properties.iniProp as any)?.width
      const height = (this.properties.iniProp as any)?.height
      width && (this.width = width)
      height && (this.height = height)
    }

    getNodeStyle() {
      const style = super.getNodeStyle()
      style.stroke = '#989891'
      style.strokeWidth = 1
      style.strokeDasharray = '3 3'
      if (this.isSelected) {
        style.stroke = 'rgb(124, 15, 255)'
      }
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

    addChild(id: string) {
      const model = this.graphModel.getElement(id)
      model?.setProperties({
        parent: this.id,
      })
      super.addChild(id)
    }

    // 隐藏锚点而不是设置锚点数为0
    // 因为分组内部节点与外部节点相连时，
    // 如果折叠分组，需要分组代替内部节点与外部节点相连。
    getAnchorStyle() {
      const style = super.getAnchorStyle()
      style.stroke = '#000'
      style.fill = '#fff'
      if (!style.hover) {
        style.hover = {}
      }
      style.hover.stroke = 'transparent'
      return style
    }

    getOutlineStyle() {
      const style = super.getOutlineStyle()
      style.stroke = 'transparent'
      if (!style.hover) {
        style.hover = {}
      }
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

  return {
    type: 'bpmn:subProcess',
    view,
    model,
  }
}
