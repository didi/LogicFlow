import BaseEdge, { IEdgeState } from './BaseEdge'
import { Path } from '../shape'
import LogicFlow from '../../LogicFlow'
import { getEndTangent } from '../../util'
import { BezierEdgeModel, GraphModel } from '../../model'

import Point = LogicFlow.Point

import ArrowInfo = LogicFlow.ArrowInfo

export type IBezierEdgeProps = {
  model: BezierEdgeModel
  graphModel: GraphModel
}

export class BezierEdge extends BaseEdge<IBezierEdgeProps> {
  /**
   * @overridable 支持重写, 此方法为获取边的形状，如果需要自定义边的形状，请重写此方法。
   * @example https://docs.logic-flow.cn/docs/#/zh/guide/basic/edge?id=%e5%9f%ba%e4%ba%8e-react-%e7%bb%84%e4%bb%b6%e8%87%aa%e5%ae%9a%e4%b9%89%e8%be%b9
   */
  getEdge() {
    const { model } = this.props
    const style = model.getEdgeStyle()
    const { path, isAnimation, arrowConfig } = model as BezierEdgeModel
    const animationStyle = model.getEdgeAnimationStyle()
    const {
      strokeDasharray,
      stroke,
      strokeDashoffset,
      animationName,
      animationDuration,
      animationIterationCount,
      animationTimingFunction,
      animationDirection,
    } = animationStyle

    return (
      <Path
        d={path}
        {...style}
        {...arrowConfig}
        {...(isAnimation
          ? {
              strokeDasharray,
              stroke,
              style: {
                strokeDashoffset,
                animationName,
                animationDuration,
                animationIterationCount,
                animationTimingFunction,
                animationDirection,
              },
            }
          : {})}
      />
    )
  }

  /**
   * @overridable 可重写，在完全自定义边的时候，可以重写此方法，来自定义边的选区。
   */
  getAppendWidth() {
    const { path } = this.props.model as BezierEdgeModel
    return <Path d={path} strokeWidth={10} stroke="transparent" fill="none" />
  }

  /**
   * @deprecated
   */
  getArrowInfo(): ArrowInfo {
    const { model } = this.props
    const { hover } = this.state as IEdgeState
    const { isSelected } = model as BezierEdgeModel
    const { offset } = model.getArrowStyle()
    const points = model.pointsList.map((point) => ({
      x: point.x,
      y: point.y,
    }))
    const [ePre, end] = getEndTangent(points, offset)
    const arrowInfo = {
      start: ePre,
      end,
      hover,
      isSelected,
    }
    return arrowInfo
  }

  getLastTwoPoints(): [Point, Point] {
    const { model } = this.props
    const { offset } = model.getArrowStyle()
    const points = model.pointsList.map((point) => ({
      x: point.x,
      y: point.y,
    }))
    return getEndTangent(points, offset)
  }
}

export default BezierEdge
