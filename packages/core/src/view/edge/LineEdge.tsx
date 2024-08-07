import BaseEdge from './BaseEdge'
import { Line, Path } from '../shape'
import { getAppendAttributes } from '../../util'
import { GraphModel, LineEdgeModel } from '../../model'

export type ILineEdgeProps = {
  model: LineEdgeModel
  graphModel: GraphModel
}

export class LineEdge extends BaseEdge<ILineEdgeProps> {
  /**
   * @overridable 支持重写, 此方法为获取边的形状，如果需要自定义边的形状，请重写此方法。
   * @example https://docs.logic-flow.cn/docs/#/zh/guide/basic/edge?id=%e5%9f%ba%e4%ba%8e-react-%e7%bb%84%e4%bb%b6%e8%87%aa%e5%ae%9a%e4%b9%89%e8%be%b9
   */
  getEdge() {
    const { model } = this.props
    const { startPoint, endPoint, isAnimation, arrowConfig } = model
    const style = model.getEdgeStyle()
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
      <Line
        {...style}
        x1={startPoint.x}
        y1={startPoint.y}
        x2={endPoint.x}
        y2={endPoint.y}
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
    const { model } = this.props
    const { startPoint, endPoint } = model
    const appendInfo = {
      start: startPoint,
      end: endPoint,
    }
    const { d, strokeWidth, fill, strokeDasharray, stroke } =
      getAppendAttributes(appendInfo)
    return (
      <Path
        d={d}
        fill={fill}
        strokeWidth={strokeWidth}
        stroke={stroke}
        strokeDasharray={strokeDasharray}
      />
    )
  }
}

export default LineEdge
