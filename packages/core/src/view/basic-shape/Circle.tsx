import { h } from 'preact';

export default function Circle(props) {
  const {
    x = 0,
    y = 0,
    r = 4,
  } = props;
  const attrs = {
    cx: x,
    cy: y,
    r,
    fill: 'transparent',
    fillOpacity: 1,
    strokeWidth: '1',
    stroke: '#000',
    strokeOpacity: 1,
    className: 'lf-basic-shape',
  };
  Object.entries(props).forEach(([k, v]) => {
    const valueType = typeof v;
    if (valueType !== 'object') {
      attrs[k] = v;
    }
  });
  return (
    <circle {...attrs} />
  );
}
