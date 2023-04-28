import { h } from 'preact';
import Rect from '../basic-shape/Rect';
import BaseNode from './BaseNode';

export default class TextNode extends BaseNode {
  getBackground() {
    const { model } = this.props;
    const style = model.getTextStyle();
    // 背景框宽度，最长一行字节数/2 * fontsize + 2
    // 背景框宽度， 行数 * fontsize + 2
    // FIX: #1067
    const { width, height, x, y } = model;
    const rectAttr = {
      ...style.background,
      x,
      y: y - 1,
      width,
      height,
    };
    return <Rect {...rectAttr} />;
  }
  getShape() {
    return (
      <g>
        {this.getBackground()}
      </g>
    );
  }
}
