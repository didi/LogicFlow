import LogicFlow from '../../LogicFlow'

// TODO: 定义基础图形的类型
export type IPolygonProps = {
  points: LogicFlow.PointTuple[]
  className?: string
  [key: string]: any
}

export function Polygon(props: IPolygonProps) {
  const { points, className } = props
  const attrs: Record<string, any> = {
    fill: 'transparent',
    fillOpacity: 1,
    strokeWidth: 1,
    stroke: '#000',
    strokeOpacity: 1,
    points: '',
  }
  Object.entries(props).forEach(([k, v]) => {
    const valueType = typeof v
    if (valueType !== 'object') {
      attrs[k] = v
    }
  })
  if (className) {
    attrs.className = `lf-basic-shape ${className}`
  } else {
    attrs.className = 'lf-shape'
  }
  attrs.points = points.map((point) => point.join(',')).join(' ')

  return <polygon {...attrs} />
}

export default Polygon
