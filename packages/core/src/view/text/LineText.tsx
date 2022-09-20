import { h } from 'preact';
import { pick } from 'lodash-es';
import Text from '../basic-shape/Text';
import Rect from '../basic-shape/Rect';
import BaseText from './BaseText';
import { getBytesLength } from '../../util/edge';
import { BaseEdgeModel } from '../../model';
import { getHtmlTextHeight, getSvgTextWidthHeight } from '../../util/node';

export default class LineText extends BaseText {
  constructor(config) {
    super(config);
    this.state = {
      isHoverd: false,
    };
  }
  getBackground() {
    const model = this.props.model as BaseEdgeModel;
    const style = model.getTextStyle();
    const { text } = model;
    let backgroundStyle = style.background || {};
    const { isHoverd } = this.state;
    if (isHoverd && style.hover && style.hover.background) {
      backgroundStyle = { ...backgroundStyle, ...style.hover.background };
    }
    // 存在文本并且文本背景不为透明时计算背景框
    if (text && text.value && backgroundStyle.fill !== 'transparent') {
      const { fontSize, overflowMode, lineHeight, wrapPadding, textWidth } = style;
      const { value } = text;
      let { x, y } = text;
      const rows = String(value).split(/[\r\n]/g);
      // 计算行数
      const rowsLength = rows.length;
      let rectAttr;
      if (overflowMode === 'autoWrap' && textWidth) {
        const textHeight = getHtmlTextHeight({
          rows,
          style: {
            fontSize: `${fontSize}px`,
            width: `${textWidth}px`,
            lineHeight,
            padding: wrapPadding,
          },
          rowsLength,
          className: 'lf-get-text-height',
        });
        rectAttr = {
          ...backgroundStyle,
          x: x - 1,
          y: y - 1,
          width: textWidth,
          height: textHeight,
        };
      } else {
        // 计算文本中最长的一行的字节数
        let longestBytes = 0;
        rows && rows.forEach(item => {
          const rowByteLength = getBytesLength(item);
          longestBytes = rowByteLength > longestBytes ? rowByteLength : longestBytes;
        });
        // 背景框宽度，最长一行字节数/2 * fontsize + 2
        // 背景框宽度， 行数 * fontsize + 2
        let { width, height } = getSvgTextWidthHeight({ rows, fontSize, rowsLength });
        // 根据设置的padding调整width, height, x, y的值
        if (typeof backgroundStyle.wrapPadding === 'string') {
          let paddings = backgroundStyle.wrapPadding.split(',')
            .filter(padding => padding.trim())
            .map(padding => parseFloat(padding.trim()));
          if (paddings.length > 0 && paddings.length <= 4) {
            if (paddings.length === 1) {
              paddings = [paddings[0], paddings[0], paddings[0], paddings[0]];
            } else if (paddings.length === 2) {
              paddings = [paddings[0], paddings[1], paddings[0], paddings[1]];
            } else if (paddings.length === 3) {
              paddings = [paddings[0], paddings[1], paddings[2], paddings[1]];
            }
            width += paddings[1] + paddings[3];
            height += paddings[0] + paddings[2];
            x = x + (paddings[1] - paddings[3]) / 2;
            y = y + (paddings[2] - paddings[0]) / 2;
          }
        }
        rectAttr = {
          ...backgroundStyle,
          x: x - 1,
          y: y - 1,
          width,
          height,
        };
      }
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
    const { model } = this.props;
    const { text } = model;
    const { value, x, y } = text;
    if (!value) return;
    const style = model.getTextStyle();
    const attr = {
      x,
      y,
      className: 'lf-element-text',
      value,
      ...style, // 透传 edageText 属性, 如 color fontSize fontWeight fontFamily textAnchor 等
    };
    return (
      <g
        className="lf-line-text"
        onMouseEnter={this.setHoverON}
        onMouseLeave={this.setHoverOFF}
      >
        {this.getBackground()}
        <Text {...attr} model={model} />
      </g>
    );
  }
}
