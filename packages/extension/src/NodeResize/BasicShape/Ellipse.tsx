import { h } from '@logicflow/core'

function Ellipse(props: Record<string, any>): h.JSX.Element {
  const { x = 0, y = 0, rx = 4, ry = 4 } = props

  const attrs = {
    cx: x,
    cy: y,
    rx,
    ry,
    fill: 'transparent',
    fillOpacity: 1,
    strokeWidth: 1,
    stroke: '#000',
    strokeOpacity: 1,
    ...props,
  }

  return <ellipse {...attrs} />
}

export default Ellipse
