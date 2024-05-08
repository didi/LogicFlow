export function Circle(props) {
  const { x = 0, y = 0, r = 4, className } = props
  const attrs: Record<string, any> = {
    cx: x,
    cy: y,
    r,
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
  return <circle {...attrs} />
}

export default Circle
