import { h } from 'preact';
import Rect from '../basic-shape/Rect';
import BaseNode from './BaseNode';

export default class TextNode extends BaseNode {
  getBackground() {
    const { model } = this.props;
    const style = model.getTextStyle();
    const { text } = model;
    if (text && text.value && style.background && style.background.fill !== 'transparnet') {
      const { x, y } = text;
      // 背景框宽度，最长一行字节数/2 * fontsize + 2
      // 背景框宽度， 行数 * fontsize + 2
      const { width, height } = model;
      const rectAttr = {
        ...style.background,
        x,
        y: y - 1,
        width,
        height,
      };
      return <Rect {...rectAttr} />;
    }
  }
  getShape() {
    return (
      <g>
        {this.getBackground()}
      </g>
    );
  }
}
