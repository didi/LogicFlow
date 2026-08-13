import { Component, GraphModel, h, observer } from '@logicflow/core'
import { PoolModel } from './PoolModel'

/**
 * 泳道排序和跨泳池拖入是瞬时反馈。将其绘制在 ToolOverlay 中，避免被 Pool/Lane
 * 的背景节点遮挡，也能让框选的多个泳道共用同一条落位提示线。
 */
export function getPoolLaneDragOverlayShapes(graphModel: GraphModel) {
  return graphModel.nodes.flatMap((node) => {
    if (String(node.type) !== 'pool') return []

    const pool = node as PoolModel
    const indicator = pool.laneDropIndicator
    const shapes: h.JSX.Element[] = []

    if (pool.isLaneDropTarget) {
      const { strokeWidth = 0 } = pool.getNodeStyle()
      const outlineStyle = pool.getAddableOutlineStyle()
      const width = pool.width + strokeWidth + 8
      const height = pool.height + strokeWidth + 8
      shapes.push(
        h('rect', {
          key: `${pool.id}-target-outline`,
          ...outlineStyle,
          x: pool.x - width / 2,
          y: pool.y - height / 2,
          width,
          height,
          rx: pool.radius,
          ry: pool.radius,
          pointerEvents: 'none',
        }),
      )
    }

    if (!indicator) return shapes

    shapes.push(
      h('rect', {
        key: `${pool.id}-lane-drop-indicator`,
        className: 'lf-pool-lane-drop-indicator',
        stroke: '#feb663',
        strokeWidth: 2,
        strokeDasharray: '4 4',
        fill: 'transparent',
        // presentation attribute 会被旧版 CSS 覆盖，内联样式确保与 DynamicGroup 同色。
        style: {
          stroke: '#feb663',
          strokeWidth: 2,
          strokeDasharray: '4 4',
        },
        x: indicator.x,
        y: indicator.y,
        width: indicator.width,
        height: indicator.height,
        pointerEvents: 'none',
      }),
    )
    return shapes
  })
}

type PoolLaneDragOverlayProps = {
  graphModel: GraphModel
}

@observer
export class PoolLaneDragOverlay extends Component<PoolLaneDragOverlayProps> {
  render() {
    const { graphModel } = this.props
    const { transform } = graphModel.transformModel.getTransformStyle()

    return h(
      'svg',
      {
        className: 'lf-pool-lane-drag-overlay',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      },
      h('g', { transform }, getPoolLaneDragOverlayShapes(graphModel)),
    )
  }
}

export default PoolLaneDragOverlay
