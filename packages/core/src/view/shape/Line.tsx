import { createElement as h } from 'preact/compat'
import { forEach, toPairs } from 'lodash-es'

export type ILineProps = {
  id?: string
  tabindex?: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  stroke?: string // Color
  className?: string
  style?: h.JSX.CSSProperties
  [key: string]: any
}

export function Line(props: ILineProps): h.JSX.Element {
  const attrs: ILineProps = {
    // default
    x1: 10,
    y1: 10,
    x2: 20,
    y2: 20,
    stroke: 'black',
    // ...props
  }

  forEach(toPairs(props), ([k, v]: [k: string, v: any]) => {
    if (k === 'style') {
      attrs[k] = v
    } else if (typeof v !== 'object') {
      attrs[k] = v
    }
  })

  return <line {...attrs} />
}

export default Line
