import { h } from '@logicflow/core'

export default function Polygon({
  fillOpacity = 1,
  strokeWidth = 1,
  strokeOpacity = 1,
  fill = 'transparent',
  stroke = '#000',
  points,
  className = 'lf-basic-shape',
}: any): h.JSX.Element {
  const attrs = {
    fill,
    fillOpacity,
    strokeWidth,
    stroke,
    strokeOpacity,
    points: '',
    className,
  }
  attrs.points = points.map((point: any) => point.join(',')).join(' ')

  return <polygon {...attrs} />
}
