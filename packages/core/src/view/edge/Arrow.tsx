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
// function getArrowMarker( type = 'solid', color = '#000') {

//   let path = '';

//   switch (type) {
//     case 'solid':
//       path = `<path d="M0,0 L10,5 L0,10 Z" fill="${color}" />`;
//       break;
//     case 'hollow':
//       path = `<path d="M0,0 L10,5 L0,10 Z" fill="none" stroke="${color}" />`;
//       break;
//     case 'line':
//       path = `<path d="M0,5 L10,5" stroke="${color}" stroke-width="2" />`;
//       break;
//     case 'diamond':
//       path = `<path d="M0,5 L5,0 L10,5 L5,10 Z" fill="${color}" />`;
//       break;
//     case 'circle':
//       path = `<circle cx="5" cy="5" r="4" fill="${color}" />`;
//       break;
//     default:
//       path = `<path d="M0,0 L10,5 L0,10 Z" fill="${color}" />`; // fallback to solid
//   }
//   return path;
// }

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
    console.log(
      'leftX',
      leftX,
      'leftY',
      leftY,
      'rightX',
      rightX,
      'rightY',
      rightY,
    )
    return {
      d: `M${leftX} ${leftY} L${end.x - 20} ${end.y}z`,
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
