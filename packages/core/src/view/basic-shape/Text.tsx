import { h } from 'preact';

export default function Text(props) {
  const {
    x = 0,
    y = 0,
    value,
    fontSize,
    fill = 'currentColor',
    model,
    fontFamily = '',
    lineHeight,
    autoWrap = false,
  } = props;
  const attrs = {
    textAnchor: 'middle',
    'dominant-baseline': 'middle',
    x,
    y,
    fill,
    ...props,
  };
  // 自动换行，获取文案高度
  const getTextHeight = ({ rows, style, rowsLength }) => {
    const dom = document.createElement('div');
    dom.style.display = 'inline-block';
    dom.style.fontSize = style.fontSize;
    dom.style.width = style.width;
    dom.style.lineHeight = style.lineHeight;
    if (style.fontFamily) {
      dom.style.fontFamily = style.fontFamily;
    }
    if (rowsLength > 1) {
      rows.forEach(row => {
        const rowDom = document.createElement('div');
        rowDom.textContent = row;
        dom.appendChild(rowDom);
      });
    } else {
      dom.textContent = rows;
    }
    document.body.appendChild(dom);
    const height = dom.clientHeight;
    document.body.removeChild(dom);
    return height;
  };

  if (value) {
    // String(value),兼容纯数字的文案
    const rows = String(value).split(/[\r\n]/g);
    const rowsLength = rows.length;
    if (autoWrap) {
      const textHeight = getTextHeight({
        rows,
        style: {
          fontSize: `${fontSize}px`,
          width: `${model.width}px`,
          fontFamily,
          lineHeight,
        },
        rowsLength,
      });
      const foreignObjectHeight = model.height > textHeight ? model.height : textHeight;
      return (
        <g>
          <foreignObject
            width={model.width}
            height={foreignObjectHeight}
            x={attrs.x - model.width / 2}
            y={attrs.y - foreignObjectHeight / 2}
          >
            <body
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: model.height,
                width: model.width,
                background: 'transparent',
              }}
              xmlns="http://www.w3.org/1999/xhtml"
            >
              <div
                className="lf-node-text-auto-wrap"
                style={{
                  fontSize,
                  background: 'transparent',
                  textAlign: 'center',
                  wordBreak: 'break-all',
                  fontFamily,
                  lineHeight,
                }}
              >
                {rows.map(item => <div>{item}</div>)}
              </div>
            </body>
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
