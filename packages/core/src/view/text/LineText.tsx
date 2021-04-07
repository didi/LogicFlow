import { h } from 'preact';
import { pick } from 'lodash-es';
import Text from '../basic-shape/Text';
import Rect from '../basic-shape/Rect';
import BaseText from './BaseText';
import { getBytesLength } from '../../util/edge';

export default class LineText extends BaseText {
  constructor(config) {
    super(config);
    this.state = {
      isHoverd: false,
    };
  }
  getBackgroud() {
    const { model: { text }, style } = this.props;
    let backgroundStyle = pick(style.background, 'fill', 'stroke', 'radius');
    const { isHoverd } = this.state;
    if (isHoverd && style.hoverBackground) {
      backgroundStyle = style.hoverBackground;
    }
    // 存在文本并且文本背景不为透明时计算背景框
    if (text && text.value && backgroundStyle.fill !== 'transparnet') {
      const { fontSize } = style;
      const { value, x, y } = text;
      const rows = String(value).split(/[\r\n]/g);
      // 计算行数
      const rowsLength = rows.length;
      // 计算文本中最长的一行的字节数
      let longestBytes = 0;
      rows && rows.forEach(item => {
        const rowByteLength = getBytesLength(item);
        longestBytes = rowByteLength > longestBytes ? rowByteLength : longestBytes;
      });
      // 背景框宽度，最长一行字节数/2 * fontsize + 2
      // 背景框宽度， 行数 * fontsize + 2
      const rectAttr = {
        x: x - 1,
        y: y - 1,
        width: Math.ceil(longestBytes / 2) * fontSize + fontSize / 4,
        height: rowsLength * (fontSize + 2) + fontSize / 4,
        ...backgroundStyle,
      };
      return <Rect {...rectAttr} />;
    }
  }
  setHoverON = () => {
    this.setState({
      isHoverd: true,
    });
  };
  setHoverOFF = () => {
    this.setState({
      isHoverd: false,
    });
  };
  getShape() {
    const { model: { text }, style } = this.props;
    const { value, x, y } = text;
    const textStyle = pick(style, 'color', 'fontSize', 'fontWeight', 'fontFamily');
    const attr = {
      x,
      y,
      className: 'lf-element-text',
      value,
      ...textStyle,
    };
    return (
      <g
        className="lf-line-text"
        onMouseEnter={this.setHoverON}
        onMouseLeave={this.setHoverOFF}
      >
        {this.getBackgroud()}
        <Text {...attr} />
      </g>
    );
  }
}
