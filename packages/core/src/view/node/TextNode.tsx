import { h } from 'preact';
import Text from '../basic-shape/Text';
import Rect from '../basic-shape/Rect';
import BaseNode from './BaseNode';
import { getBytesLength } from '../../util/edge';
import { getSvgTextWidthHeight } from '../../util/node';

export default class TextNode extends BaseNode {
  getBackgroud() {
    const { text } = this.getAttributes();
    const style = this.getTextStyle();
    if (text && text.value && style.backgroundStyle && style.backgroundStyle.fill !== 'transparnet') {
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
      const { width, height } = getSvgTextWidthHeight({ rows, fontSize, rowsLength });
      const rectAttr = {
        ...style.backgroundStyle,
        x: x - 1,
        y: y - 1,
        width,
        height,
      };
      return <Rect {...rectAttr} />;
    }
  }
  getShape() {
    const { x, y } = this.getAttributes();
    const style = this.getShapeStyle();
    return (
      <g>
        {this.getBackgroud()}
        <Text
          {...style}
          x={x}
          y={y}
        />
      </g>
    );
  }
}
