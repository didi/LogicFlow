import { h, Component } from 'preact';
import GraphModel from '../../model/GraphModel';
import { createUuid } from '../../util/uuid';
import { observer } from '../..';

export type GridOptions = {
  /**
   * 网格格子间距
   */
  size?: number
  /**
   * 网格是否可见
   */
  visible?: boolean,

  graphModel?: GraphModel,
  /**
   * 网格类型
   * 'dot' || 'mesh'
   */
  type?: string,
  config?: {
    color: string,
    thickness?: number,
  }
};

type IProps = GridOptions;
@observer
export default class Grid extends Component<IProps> {
  readonly id = createUuid();
  // 网格类型为点状
  renderDot() {
    const { config: { color, thickness = 2 }, size, visible } = this.props;
    const length = Math.min(Math.max(2, thickness), size / 2); // 2 < length < size /2
    let opacity = 1;
    if (!visible) {
      opacity = 0;
    }
    /* eslint-disable-next-line */
    return <rect width={length} height={length} rx={length / 2} ry={length / 2} fill={color} opacity={opacity} />;
  }
  // 网格类型为交叉线
  // todo: 采用背景缩放的方式，实现更好的体验
  renderMesh() {
    const { config: { color, thickness = 1 }, size, visible } = this.props;
    const strokeWidth = Math.min(Math.max(1, thickness), size / 2); // 1 < strokeWidth < size /2
    const d = `M ${size} 0 H0 M0 0 V0 ${size}`;
    let opacity = 1;
    if (!visible) {
      opacity = 0;
    }
    return <path d={d} stroke={color} strokeWidth={strokeWidth} opacity={opacity} />;
  }
  render() {
    // TODO 生成网格️️️✔、网格支持 options（size）✔
    const { type, size, graphModel: { transformModel } } = this.props;
    const {
      SCALE_X,
      SKEW_Y,
      SKEW_X,
      SCALE_Y,
      TRANSLATE_X,
      TRANSLATE_Y,
    } = transformModel;
    const matrixString = [SCALE_X, SKEW_Y, SKEW_X, SCALE_Y, TRANSLATE_X, TRANSLATE_Y].join(',');
    const transform = `matrix(${matrixString})`;
    // const transitionStyle = {
    //   transition: 'all 0.1s ease',
    // };
    return (
      <div className="lf-grid">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%">
          <defs>
            <pattern
              id={this.id}
              patternUnits="userSpaceOnUse"
              patternTransform={transform}
              x="0"
              y="0"
              width={size}
              height={size}
            >
              {type === 'dot' && this.renderDot()}
              {type === 'mesh' && this.renderMesh()}
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${this.id})`} />
        </svg>
      </div>
    );
  }
}
Grid.defaultProps = {
  size: 20,
  visible: true,
  type: 'dot',
  config: {
    color: '#ababab',
    thickness: 1,
  },
};
