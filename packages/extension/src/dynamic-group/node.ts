import { GraphModel, h, RectNode } from '@logicflow/core'
import { DynamicGroupNodeModel } from './model'

export interface IDynamicGroupNodeProps {
  model: DynamicGroupNodeModel
  graphModel: GraphModel
}

export class DynamicGroupNode<
  P extends IDynamicGroupNodeProps = IDynamicGroupNodeProps,
> extends RectNode<P> {
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
