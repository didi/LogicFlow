import { createElement as h } from 'preact/compat'
import { forEach, toPairs } from 'lodash-es'

export type IPolylineProps = {
  points: string
  pathLength?: number | 'none'
  className?: string
}

export function Polyline(props: IPolylineProps): h.JSX.Element {
  const { className } = props
  const attrs: Record<string, unknown> = {
    points: '',
    fill: 'none',
  }

  forEach(toPairs(props), ([k, v]: [k: string, v: unknown]) => {
    if (k === 'style') {
      attrs[k] = v
    } else if (typeof v !== 'object') {
      attrs[k] = v
    }
  })
  if (className) {
    attrs.className = `${className}`
  }

  return <polyline {...attrs} />
}

export default Polyline
