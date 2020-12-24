import { h, Component } from 'preact';

import * as type from '../type';
import Rect from './basic-shape/Rect';

const STROKE_DASH_ARRAY = '4, 4';

type IProps = {
  visiable: boolean,
  outlineColor: string,
} & type.Point & type.Size;

class Outline extends Component<IProps> {
  render() {
    const {
      x, y, width, height, visiable, outlineColor,
    } = this.props;
    return (
      <Rect
        className="lf-outline"
        {...{
          x, y, width, height,
        }}
        radius={0}
        stroke={visiable ? outlineColor : 'none'}
        strokeDasharray={STROKE_DASH_ARRAY}
      />
    );
  }
}

export default Outline;
