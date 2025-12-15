import { createElement as h } from 'preact/compat'
import { forEach, toPairs } from 'lodash-es'
import { LogicFlow } from '../..'
import { generateRoundedCorners } from '../../util/geometry'

export type IPolygonProps = {
  points: LogicFlow.PointTuple[]
  x?: number
  y?: number
  className?: string
  radius?: number
}

export function Polygon(props: IPolygonProps): h.JSX.Element {
  const { points = [], className, radius } = props
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
    attrs.className = `lf-basic-shape ${className}`
  } else {
    attrs.className = 'lf-basic-shape'
  }
  if (radius) {
    const pointList = points.map((point) => ({ x: point[0], y: point[1] }))
    const rounded = generateRoundedCorners(pointList, radius, true)
    const d = rounded.length
      ? `M ${rounded[0].x} ${rounded[0].y} ${rounded
          .slice(1)
          .map((p) => `L ${p.x} ${p.y}`)
          .join(' ')} Z`
      : ''
    attrs.d = d
    delete attrs.points
    return <path {...attrs} />
  } else {
    attrs.points = points.map((point) => point.join(',')).join(' ')
    return <polygon {...attrs} />
  }
}

export default Polygon
