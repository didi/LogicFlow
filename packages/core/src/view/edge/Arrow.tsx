import { h, Component } from 'preact';
import Path from '../basic-shape/Path';
import { getVerticalPointOfLine } from '../../algorithm/index';
import { ArrowInfo } from '../../type/index';

export type ArrowStyle = {
  stroke?: string,
  fill?: string,
  strokeWidth?: number,
  offset: number,
  verticalLength: number,
};

type ArrowAttributesType = {
  d: string,
} & ArrowStyle;

type IProps = {
  arrowInfo: ArrowInfo,
  style: ArrowStyle
};

export default class Arrow extends Component<IProps> {
  getArrowAttibutes(): ArrowAttributesType {
    const { arrowInfo, style } = this.props;
    const { start, end } = arrowInfo;
    const config = {
      start,
      end,
      offset: style.offset,
      verticalLength: style.verticalLength,
      type: 'end',
    };
    const {
      leftX, leftY, rightX, rightY,
    } = getVerticalPointOfLine(config);
    return {
      d: `M${leftX} ${leftY} L${end.x} ${end.y} L${rightX} ${rightY} z`,
      ...style,
    };
  }
  getShape() {
    const {
      d, strokeWidth, stroke, fill,
    } = this.getArrowAttibutes();
    return (
      <Path
        d={d}
        fill={fill}
        strokeWidth={strokeWidth}
        stroke={stroke}
      />
    );
  }
  render() {
    return (
      <g
        className="lf-arrow"
      >
        {this.getShape()}
      </g>
    );
  }
}
