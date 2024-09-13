import LogicFlow, { GraphModel, h, RectNode, EventType } from '@logicflow/core'
import { forEach } from 'lodash-es'
import { DynamicGroupNodeModel } from './model'
import { handleResize } from '@logicflow/core/es/util/resize'

import Position = LogicFlow.Position
import { rotatePointAroundCenter } from '../tools/label/utils'

export interface IDynamicGroupNodeProps {
  model: DynamicGroupNodeModel
  graphModel: GraphModel
}

export class DynamicGroupNode<
  P extends IDynamicGroupNodeProps = IDynamicGroupNodeProps,
> extends RectNode<P> {
  componentDidMount() {
    super.componentDidMount()

    const { model: curGroup, graphModel } = this.props
    const { eventCenter } = graphModel

    const childrenPositionMap: Map<string, Position> = new Map()

    // 在 group 旋转时，对组内的所有子节点也进行对应的旋转计算
    eventCenter.on(EventType.NODE_ROTATE, ({ model }) => {
      // DONE: 目前操作是对分组内节点以节点中心旋转节点本身，而按照正常逻辑，应该是以分组中心，旋转节点（跟 Label 旋转操作逻辑一致）
      if (model.id === curGroup.id) {
        const center = { x: curGroup.x, y: curGroup.y }
        forEach(Array.from(curGroup.children), (childId) => {
          const child = graphModel.getNodeModelById(childId)

          if (child) {
            let point: Position = { x: child.x, y: child.y }
            if (childrenPositionMap.has(child.id)) {
              point = childrenPositionMap.get(child.id)!
            } else {
              childrenPositionMap.set(child.id, point)
            }

            // 弧度转角度
            let theta = model.rotate * (180 / Math.PI)
            if (theta < 0) theta += 360
            const radian = theta * (Math.PI / 180)

            const newPoint = rotatePointAroundCenter(point, center, radian)

            child.moveTo(newPoint.x, newPoint.y)
            child.rotate = model.rotate
          }
        })
      }
    })

    // 在 group 缩放时，对组内的所有子节点也进行对应的缩放计算
    eventCenter.on(
      EventType.NODE_RESIZE,
      ({ deltaX, deltaY, index, model }) => {
        // TODO: 目前 Resize 的比例值有问题，导致缩放时，节点会变形，需要修复
        if (model.id === curGroup.id) {
          forEach(Array.from(curGroup.children), (childId) => {
            const child = graphModel.getNodeModelById(childId)
            if (child) {
              // child.rotate = model.rotate
              handleResize({
                deltaX,
                deltaY,
                index,
                nodeModel: child,
                graphModel,
                cancelCallback: () => {},
              })
            }
          })
        }
      },
    )
  }

  getResizeControl(): h.JSX.Element | null {
    const { resizable, isCollapsed } = this.props.model
    const showResizeControl = resizable && !isCollapsed
    return showResizeControl ? super.getResizeControl() : null
  }

  getAppendAreaShape(): h.JSX.Element | null {
    // DONE: 此区域用于初始化 group container, 即元素拖拽进入感应区域
    const { model } = this.props
    const { width, height, x, y, radius, groupAddable } = model
    if (!groupAddable) return null

    const { strokeWidth = 0 } = model.getNodeStyle()
    const style = model.getAddableOutlineStyle()

    const newWidth = width + strokeWidth + 8
    const newHeight = height + strokeWidth + 8
    return h('rect', {
      ...style,
      width: newWidth,
      height: newHeight,
      x: x - newWidth / 2,
      y: y - newHeight / 2,
      rx: radius,
      ry: radius,
    })
  }

  getCollapseIcon(sx: number, sy: number): string {
    return `M ${sx + 3},${sy + 6} ${sx + 11},${sy + 6} M${sx + 7},${sy + 2} ${
      sx + 7
    },${sy + 10}`
  }

  getExpandIcon(sx: number, sy: number): string {
    return `M ${sx + 3},${sy + 6} ${sx + 11},${sy + 6} `
  }

  // 获取操作图标（收起或展开）
  getOperateIcon(): h.JSX.Element | null {
    const { model } = this.props
    const { x, y, width, height } = model
    const sx = x - width / 2 + 10
    const sy = y - height / 2 + 10

    if (!model.collapsible) return null
    const iconPath = model?.isCollapsed
      ? this.getCollapseIcon(sx, sy)
      : this.getExpandIcon(sx, sy)

    const operateIcon = h('path', {
      fill: 'none',
      stroke: '#818281',
      strokeWidth: 2,
      'pointer-events': 'none',
      d: iconPath,
    })

    return h('g', {}, [
      h('rect', {
        height: 12,
        width: 14,
        rx: 2,
        ry: 2,
        strokeWidth: 1,
        fill: '#f4f5f6',
        stroke: '#cecece',
        cursor: 'pointer',
        x: sx,
        y: sy,
        onClick: () => {
          model.toggleCollapse(!model.isCollapsed)
        },
      }),
      operateIcon,
    ])
  }

  getShape(): h.JSX.Element | null {
    return h('g', {}, [
      this.getAppendAreaShape(),
      super.getShape(),
      this.getOperateIcon(),
    ])
  }
}

export default DynamicGroupNode
