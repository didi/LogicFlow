import { h } from '@logicflow/core'
import { DynamicGroupNode } from '../dynamic-group/node'
import { poolConfig } from './constant'

export class PoolView extends DynamicGroupNode {
  componentDidMount(): void {
    const { graphModel, model } = this.props
    const index = graphModel.nodes.findIndex((node) => node.id === model.id)
    const poolCount = graphModel.nodes.filter(
      (node) => String(node.type) === 'pool',
    ).length
    console.log('index', model, index)
    // 设置一个足够低的z-index，确保泳池在所有节点的最底层
    model.setZIndex(-((poolCount - index) * 100))
  }

  /**
   * 渲染泳池形状 - 根据布局方向分为标题区域和内容区域
   */
  getShape() {
    const { model } = this.props
    const {
      x,
      y,
      width,
      height,
      properties: { textStyle: customTextStyle = {}, style: customStyle = {} },
      isHorizontal,
    } = model
    const style = model.getNodeStyle()
    const base = { fill: '#ffffff', stroke: '#000000', strokeWidth: 1 }
    const left = x - width / 2
    const top = y - height / 2

    const titleRect = {
      ...base,
      ...style,
      x: left,
      y: top,
      width: isHorizontal ? poolConfig.titleSize : width,
      height: isHorizontal ? height : poolConfig.titleSize,
      ...(isHorizontal && customTextStyle),
    }
    const contentRect = {
      ...base,
      ...style,
      x: isHorizontal ? left + poolConfig.titleSize : left,
      y: isHorizontal ? top : top + poolConfig.titleSize,
      width: isHorizontal ? width - poolConfig.titleSize : width,
      height: isHorizontal ? height : height - poolConfig.titleSize,
      ...(isHorizontal && customStyle),
    }
    return h('g', {}, [h('rect', titleRect), h('rect', contentRect)])
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
