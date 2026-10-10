import { ElementState, h, Rect, TextMode } from '@logicflow/core'
import { DynamicGroupNode } from '../dynamic-group/node'
import { PoolTitleText } from './PoolTitleText'
import { getTitleLayout, getTitleOperateIconPosition } from './utils'

function toRectAttrs(box: {
  x: number
  y: number
  width: number
  height: number
}) {
  return {
    x: box.x - box.width / 2,
    y: box.y - box.height / 2,
    width: box.width,
    height: box.height,
  }
}

export class PoolView extends DynamicGroupNode {
  getText() {
    const { model, graphModel } = this.props
    const { editConfigModel } = graphModel

    if (editConfigModel.nodeTextMode !== TextMode.TEXT) return null
    if (model.state === ElementState.TEXT_EDIT) return null

    const textShape = model.text
      ? h(PoolTitleText, {
          editable: !!(
            editConfigModel.nodeTextEdit &&
            (model.text.editable ?? true)
          ),
          model,
          graphModel,
          draggable: !!(
            editConfigModel.nodeTextDraggable && model.text.draggable
          ),
        })
      : null
    const operateIcon = this.getOperateIcon()
    if (!textShape && !operateIcon) return null

    return h('g', {}, textShape, operateIcon)
  }

  /**
   * Pool 不允许 resize，但选中后仍需保留与 resize 节点一致的虚线边界。
   * 复用 resizeOutline 主题和外扩尺寸，只移除 ResizeControlGroup 中的控制点。
   */
  getSelectionOutline() {
    const { model } = this.props
    if (!model.isSelected) return null

    return h(Rect, {
      className: 'lf-pool-selection-outline',
      ...model.getResizeOutlineStyle(),
      pointerEvents: 'none',
      x: model.x,
      y: model.y,
      width: model.width + 10,
      height: model.height + 10,
    })
  }

  /** Pool 的折叠按钮与名称使用同一个标题区，不能沿用分组左上角的固定坐标。 */
  getOperateIcon() {
    const { model } = this.props
    if (!model.collapsible) return null
    const plugin = model.graphModel.dynamicGroup as any
    if (
      typeof plugin?.isCollapseAllowed === 'function' &&
      !plugin.isCollapseAllowed(model)
    ) {
      return null
    }

    const titleBox = model.getTitleTextBox()
    const { x, y } = getTitleOperateIconPosition(
      titleBox,
      model.getTitleRenderPosition(),
    )
    const iconPath = model.isCollapsed
      ? this.getCollapseIcon(x, y)
      : this.getExpandIcon(x, y)

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
        x,
        y,
        onPointerDown: (e: PointerEvent) => e.stopPropagation(),
        onClick: (e: MouseEvent) => {
          e.stopPropagation()
          model.toggleCollapse(!model.isCollapsed)
        },
        onDblClick: (e: MouseEvent) => e.stopPropagation(),
      }),
      h('path', {
        fill: 'none',
        stroke: '#818281',
        strokeWidth: 2,
        'pointer-events': 'none',
        d: iconPath,
      }),
    ])
  }

  componentDidMount(): void {
    const { graphModel, model } = this.props
    const index = graphModel.nodes.findIndex((node) => node.id === model.id)
    const poolCount = graphModel.nodes.filter(
      (node) => String(node.type) === 'pool',
    ).length
    model.setZIndex(-((poolCount - index) * 100))
    if (
      !model.properties?.children?.length &&
      !model._defaultLaneCreated &&
      !model.virtual
    ) {
      model.createDefaultLane(model.properties?.laneConfig)
      model._defaultLaneCreated = true
    }
  }

  /**
   * 展开态始终按统一标题几何渲染标题区、内容区和分隔线，
   * 这样四边标题与拖拽提示线共用同一套坐标基础。
   */
  getShape() {
    const { model } = this.props
    const { x, y, width, height } = model
    const style = model.getNodeStyle()
    const base = { fill: '#ffffff', stroke: '#000000', strokeWidth: 1 }
    const titleLayout = getTitleLayout(
      { x, y, width, height },
      model.getResolvedTitlePosition(),
      model.titleSize,
    )

    const titleRect = {
      ...base,
      ...style,
      ...toRectAttrs(titleLayout.titleBox),
    }
    if (model.isCollapsed) {
      // Pool 折叠后与 DynamicGroup 一致：固定尺寸的单一节点，不再保留标题/内容分区。
      return h('g', {}, [
        h('rect', {
          ...base,
          ...style,
          x: x - width / 2,
          y: y - height / 2,
          width,
          height,
        }),
        this.getSelectionOutline(),
      ])
    }
    const contentRect = {
      ...base,
      ...style,
      ...toRectAttrs(titleLayout.contentBox),
    }
    return h('g', {}, [
      h('rect', contentRect),
      h('rect', titleRect),
      h('line', {
        ...titleLayout.divider,
        stroke: style.stroke,
        strokeWidth: style.strokeWidth,
        pointerEvents: 'none',
      }),
      this.getSelectionOutline(),
    ])
  }

  /**
   * 获取调整控制点 - 只在展开状态下显示
   */
  getResizeControl() {
    const { resizable, isCollapsed } = this.props.model
    const showResizeControl = resizable && !isCollapsed
    return showResizeControl ? super.getResizeControl() : null
  }
}

export default {
  PoolView,
}
