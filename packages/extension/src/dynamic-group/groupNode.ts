import LogicFlow, { h, RectNode, RectNodeModel } from '@logicflow/core'
import RectSize = LogicFlow.RectSize

export class GroupNode extends RectNode {
  getResizeControl(): h.JSX.Element | null {
    const { resizable, properties } = this.props.model
    const showResizeControl = resizable && properties._isCollapsed
    return showResizeControl ? super.getResizeControl() : null
  }

  getGroupShape(): h.JSX.Element | null {
    return null
  }

  getCollapseIcon(sx: number, sy: number): string {
    return `M ${sx + 3},${sy + 6} ${sx + 11},${sy + 6} M${sx + 7},${sy + 2} ${
      sx + 7
    },${sy + 10}`
  }

  getExpandIcon(sx: number, sy: number): string {
    return `M ${sx + 3},${sy + 6} ${sx + 11},${sy + 6} `
  }

  // 获取操作图标
  getOperateIcon(): h.JSX.Element | null {
    const { model } = this.props
    const { x, y, width, height, properties } = model
    const sx = x - width / 2 + 5
    const sy = y - height / 2 + 5

    if (!model.foldable) return null
    const iconPath = properties?.isFolded
      ? this.getExpandIcon(sx, sy)
      : this.getCollapseIcon(sx, sy)

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
          model.foldGroup(!model.properties.isFolded)
        },
      }),
      operateIcon,
    ])
  }

  getShape(): h.JSX.Element | null {
    return h('g', {}, [
      this.getGroupShape(),
      super.getShape(),
      this.getOperateIcon(),
    ])
  }
}

export class GroupNodeModel extends RectNodeModel {
  readonly isGroup = true

  // 保存组内的节点
  children: Set<string> = new Set()
  // 是否限制组内节点的移动范围。默认不限制
  isRestrict: boolean = false
  // 分组节点是否可以折叠
  foldable: boolean = true
  isFolded: boolean = false

  defaultSize: RectSize = { width: 400, height: 200 }
  expandSize: RectSize = { width: 80, height: 40 }
}

export const groupNode = {
  type: 'dynamic-group',
  view: GroupNode,
  model: GroupNodeModel,
}

export default groupNode
