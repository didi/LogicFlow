import { h } from 'preact';

export default function Polygon({
  fillOpacity = 1,
  strokeWidth = 1,
  strokeOpacity = 1,
  fill = 'transparent',
  stroke = '#000',
  points,
  className = 'lf-basic-shape',
}) {
  const attrs = {
    fill,
    fillOpacity,
    strokeWidth,
    stroke,
    strokeOpacity,
    points: '',
    className,
  };
  attrs.points = points.map(point => point.join(',')).join(' ');

  return (
    <polygon {...attrs} />
  );
}
