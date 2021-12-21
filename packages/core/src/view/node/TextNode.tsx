import { h } from 'preact';
import Text from '../basic-shape/Text';
import Rect from '../basic-shape/Rect';
import BaseNode from './BaseNode';

export default class TextNode extends BaseNode {
  getBackgroud() {
    const { model } = this.props;
    const style = model.getNodeStyle();
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
  getText() {
    return null;
  }
  getShape() {
    const { model } = this.props;
    const style = model.getNodeStyle();
    return (
      <g>
        {this.getBackgroud()}
        <Text
          {...style}
          model={model}
          className="lf-element-text"
          value={model.text.value}
          x={model.x}
          y={model.y}
        />
      </g>
    );
  }
}
