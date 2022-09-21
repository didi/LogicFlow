import { h, Component } from 'preact';
import SnaplineModel from '../../model/SnaplineModel';
import Line from '../basic-shape/Line';
import { observer } from '../..';

type IProps = {
  snaplineModel: SnaplineModel;
};

@observer
export default class SnaplineOverlay extends Component<IProps> {
  render() {
    const { snaplineModel } = this.props;
    const {
      position, isShowHorizontal, isShowVertical,
    } = snaplineModel;
    const style = snaplineModel.getStyle();
    const { x = 0, y = 0 } = position;
    // 展示横向，纵向默认-100000,100000 减少计算量
    const horizontalLine = {
      x1: -100000,
      y1: y,
      x2: 100000,
      y2: y,
      ...style,
      stroke: isShowHorizontal ? style.stroke : 'none',
    };
    const verticalLine = {
      x1: x,
      y1: -100000,
      x2: x,
      y2: 100000,
      ...style,
      stroke: isShowVertical ? style.stroke : 'none',
    };
    return (
      <g className="lf-snapline">
        <Line {...horizontalLine} />
        <Line {...verticalLine} />
      </g>
    );
  }
}
