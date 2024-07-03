import { createElement as h } from 'preact/compat'
import { forEach, toPairs } from 'lodash-es'
import { LogicFlow } from '../..'

export type ICircleProps = {
  x?: number
  y?: number
  r?: number
  className?: string
} & LogicFlow.CommonTheme

export function Circle(props: ICircleProps): h.JSX.Element {
  const { x = 0, y = 0, r = 4, className } = props

  const attrs: ICircleProps = {
    cx: x,
    cy: y,
    r,
    fill: 'transparent',
    fillOpacity: 1,
    strokeWidth: 1,
    stroke: '#000',
    strokeOpacity: 1,
  }

  forEach(toPairs(props), ([k, v]: [k: string, v: any]) => {
    if (typeof v !== 'object') {
      attrs[k] = v
    }
  })

  if (className) {
    attrs.className = `lf-basic-shape ${className}`
  } else {
    attrs.className = `lf-basic-shape`
  }

  return <circle {...attrs} />
}

export default Circle
