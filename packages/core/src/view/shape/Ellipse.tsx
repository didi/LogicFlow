export function Ellipse(props) {
  const { x = 0, y = 0, rx = 4, ry = 4, className } = props
  const attrs: Record<string, any> = {
    cx: x,
    cy: y,
    rx,
    ry,
    fill: 'transparent',
    fillOpacity: 1,
    strokeWidth: '1',
    stroke: '#000',
    strokeOpacity: 1,
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
  return <ellipse {...attrs} />
}

export default Ellipse
