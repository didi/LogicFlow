import { h } from 'preact';

export default function Polygon(props) {
  const { points, className } = props;
  const attrs = {
    fill: 'transparent',
    fillOpacity: 1,
    strokeWidth: 1,
    stroke: '#000',
    strokeOpacity: 1,
    points: '',
    className: 'lf-basic-shape',
  };
  Object.entries(props).forEach(([k, v]) => {
    const valueType = typeof v;
    if (valueType !== 'object') {
      attrs[k] = v;
    }
  });
  if (className) {
    attrs.className = `lf-basic-shape ${className}`;
  }
  attrs.points = points.map(point => point.join(',')).join(' ');

  return (
    <polygon {...attrs} />
  );
}
