import LogicFlow, {
  h,
  GraphModel,
  RectNode,
  RectNodeModel,
  IRectNodeProperties,
} from '@logicflow/core'
import NodeConfig = LogicFlow.NodeConfig

export type IGroupNodeProps = {
  model: GroupNodeModel
  graphModel: GraphModel
}

// 分组节点默认展开时的大小
const DEFAULT_GROUP_EXPAND_WIDTH = 500
const DEFAULT_GROUP_EXPAND_HEIGHT = 300
// 分组节点默认收起时的大小
const DEFAULT_GROUP_COLLAPSE_WIDTH = 80
const DEFAULT_GROUP_COLLAPSE_HEIGHT = 60

const DEFAULT_BOTTOM_Z_INDEX = -10000

export class GroupNode<
  P extends IGroupNodeProps = IGroupNodeProps,
> extends RectNode<P> {
  getResizeControl(): h.JSX.Element | null {
    const { resizable, properties } = this.props.model
    const showResizeControl = resizable && properties._isCollapsed
    return showResizeControl ? super.getResizeControl() : null
  }

  getGroupShape(): h.JSX.Element | null {
    // TODO: 此区域用于初始化 group container, 即元素拖拽进入感应区域
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
          model.toggleCollapse(!model.properties.isCollapsed)
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

export type IGroupNodeProperties = {
  children?: string[]
  isCollapsed?: boolean
  isRestrict?: boolean
  collapsible?: boolean
  collapsedWidth?: number
  collapsedHeight?: number

  expandWidth?: number
  expandHeight?: number
  zIndex?: number
  autoToFront?: boolean
} & IRectNodeProperties

export class GroupNodeModel extends RectNodeModel<IGroupNodeProperties> {
  readonly isGroup = true

  // 保存组内的节点
  children: Set<string> = new Set()
  // 是否限制组内节点的移动范围。默认不限制
  isRestrict: boolean = false
  // 分组节点是否可以折叠
  collapsible: boolean = true
  // 当前组是否收起状态
  isCollapsed: boolean = false

  // 分组节点 初始化尺寸(默认展开)，后续支持从 properties 中传入 width 和 height 设置
  expandWidth: number = DEFAULT_GROUP_EXPAND_WIDTH
  expandHeight: number = DEFAULT_GROUP_EXPAND_HEIGHT
  // 折叠后
  collapsedWidth: number = DEFAULT_GROUP_COLLAPSE_WIDTH
  collapsedHeight: number = DEFAULT_GROUP_COLLAPSE_HEIGHT

  childrenLastFoldState: Record<string, boolean> = {}

  constructor(data: NodeConfig<IGroupNodeProperties>, graphModel: GraphModel) {
    super(data, graphModel)

    this.setAttributes()
  }

  setAttributes() {
    super.setAttributes()

    const {
      children,
      width,
      height,
      collapsible,
      isCollapsed,
      zIndex,
      isRestrict,
      autoToFront,
    } = this.properties

    if (children) this.children = new Set(children)

    if (width) {
      this.width = width
      this.expandWidth = width
    }
    if (height) {
      this.height = height
      this.expandHeight = height
    }
    this.zIndex = zIndex ?? DEFAULT_BOTTOM_Z_INDEX

    this.isRestrict = isRestrict ?? false
    this.collapsible = collapsible ?? true
    this.autoToFront = autoToFront ?? false

    // 禁用掉 Group 节点的文本编辑能力
    this.text.editable = false
    this.text.draggable = false

    // 当前状态为折叠时，调用一下折叠的方法
    // 确认是否
    isCollapsed && this.collapseGroup()
  }

  /**
   * 折叠 or 展开分组
   * 1. 折叠分组的宽高
   * 2. 处理分组子节点
   * 3. 处理连线
   * @param collapsed
   */
  toggleCollapse(collapsed?: boolean) {
    console.log('collapsed', collapsed)
  }

  collapse() {}

  expand() {}

  /**
   * 重写 Group 节点的 Resize Outline
   */
  getResizeOutlineStyle(): LogicFlow.CommonTheme {
    const style = super.getResizeOutlineStyle()
    style.stroke = 'none'
    return style
  }

  // TODO: 是否是设置 group 节点没有锚点，而不是设置成透明？？？
  getAnchorStyle() {
    const style = super.getAnchorStyle()
    style.stroke = 'transparent'
    return style
  }
}

export const groupNode = {
  type: 'dynamic-group',
  view: GroupNode,
  model: GroupNodeModel,
}

export default groupNode
