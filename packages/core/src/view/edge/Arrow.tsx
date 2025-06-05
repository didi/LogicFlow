import { Component } from 'preact/compat'
import { Path } from '../shape'
import LogicFlow from '../../LogicFlow'
import { getVerticalPointOfLine } from '../../algorithm'
import ArrowInfo = LogicFlow.ArrowInfo

export type ArrowStyle = {
  stroke?: string
  fill?: string
  strokeWidth?: number
  offset: number
  refX?: number
  refY?: number
  verticalLength: number
}

type ArrowAttributesType = {
  d: string
} & ArrowStyle

type IProps = {
  arrowInfo: ArrowInfo
  style: ArrowStyle
}

export class Arrow extends Component<IProps> {
  getArrowAttributes(): ArrowAttributesType {
    const { arrowInfo, style } = this.props
    const { start, end } = arrowInfo
    const config = {
      start,
      end,
      offset: style.offset,
      verticalLength: style.verticalLength,
      type: 'end',
    }
    const { leftX, leftY, rightX, rightY } = getVerticalPointOfLine(config)
    return {
      d: `M${leftX} ${leftY} L${end.x} ${end.y} L${rightX} ${rightY} z`,
      ...style,
    }
  }

  getShape() {
    const { d, strokeWidth, stroke, fill } = this.getArrowAttributes()
    return <Path d={d} fill={fill} strokeWidth={strokeWidth} stroke={stroke} />
  }

  render() {
    return <g className="lf-arrow">{this.getShape()}</g>
  }
}

export default Arrow
