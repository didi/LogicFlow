import { h } from 'preact';

export default function Text(props) {
  const {
    x = 0,
    y = 0,
    value,
    fontSize,
    fill = 'currentColor',
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
    if (rowsLength > 1) {
      const tspans = rows.map(((row, i) => {
        // 保证文字居中，文字Y轴偏移为当前行数对应中心行数的偏移行 * 行高
        const lineHeight = fontSize + 2;
        const offsetY = (i - (rowsLength - 1) / 2) * lineHeight;
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
