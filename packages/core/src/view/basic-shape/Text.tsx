import { h } from 'preact';
import { ElementType, ModelType } from '../../constant/constant';
import { getHtmlTextHeight } from '../../util/node';

export default function Text(props) {
  const {
    x = 0,
    y = 0,
    value,
    color = '#000000',
    fontSize,
    fill = 'currentColor',
    model,
    fontFamily = '',
    lineHeight,
    autoWrap = false,
    wrapPadding = '0, 0',
  } = props;
  const attrs = {
    textAnchor: 'middle',
    'dominant-baseline': 'middle',
    x,
    y,
    fill,
    ...props,
  };

  if (value) {
    // String(value),兼容纯数字的文案
    const rows = String(value).split(/[\r\n]/g);
    const rowsLength = rows.length;
    // 非文本节点设置了自动换行，或连线设置了自动换行并且设置了textWidth
    const { BaseType, width, textWidth, modelType } = model;
    if ((BaseType === ElementType.NODE && modelType !== ModelType.TEXT_NODE && autoWrap)
    || (BaseType === ElementType.EDGE && autoWrap && textWidth)) {
      const textRealWidth = textWidth || width;
      const textHeight = getHtmlTextHeight({
        rows,
        style: {
          fontSize: `${fontSize}px`,
          width: `${textRealWidth}px`,
          fontFamily,
          lineHeight,
          padding: wrapPadding,
        },
        rowsLength,
        className: 'lf-get-text-height',
      });
      const foreignObjectHeight = model.height > textHeight ? model.height : textHeight;
      return (
        <g>
          <foreignObject
            width={textRealWidth}
            height={foreignObjectHeight}
            x={attrs.x - textRealWidth / 2}
            y={attrs.y - foreignObjectHeight / 2}
          >
            <div
              className="lf-node-text-auto-wrap"
              style={{
                minHeight: model.height,
                width: textRealWidth,
                color,
                padding: wrapPadding,
              }}
            >
              <div
                className="lf-node-text-auto-wrap-content"
                style={{
                  fontSize,
                  fontFamily,
                  lineHeight,
                }}
              >
                {rows.map(item => <div>{item}</div>)}
              </div>
            </div>
          </foreignObject>
        </g>
      );
    }
    if (rowsLength > 1) {
      const tspans = rows.map(((row, i) => {
        // 保证文字居中，文字Y轴偏移为当前行数对应中心行数的偏移行 * 行高
        const tspanLineHeight = fontSize + 2;
        const offsetY = (i - (rowsLength - 1) / 2) * tspanLineHeight;
        return (
          <tspan className="lf-text-tspan" x={x} y={y + offsetY}>{row}</tspan>
        );
      }));
      return (
        <text {...attrs}>
          {tspans}
        </text>
      );
    }
    return (
      <text {...attrs}>
        {value}
      </text>
    );
  }
}
