import { createElement as h } from 'preact/compat'
import { forEach, toPairs } from 'lodash-es'
import { LogicFlow } from '../..'

export type IPolygonProps = {
  points: LogicFlow.PointTuple[]
  x?: number
  y?: number
  className?: string
}

export function Polygon(props: IPolygonProps): h.JSX.Element {
  const { points = [], className } = props
  const attrs: Record<string, any> = {
    fill: 'transparent',
    fillOpacity: 1,
    strokeWidth: 1,
    stroke: '#000',
    strokeOpacity: 1,
    points: '',
  }

  forEach(toPairs(props), ([k, v]: [k: string, v: any]) => {
    if (typeof v !== 'object') {
      attrs[k] = v
    }
  })

  if (className) {
    attrs.classNmae = `lf-basic-shape ${className}`
  } else {
    attrs.className = 'lf-basic-shape'
  }
  attrs.points = points.map((point) => point.join(',')).join(' ')

  return <polygon {...attrs} />
}

export default Polygon
