export function Line(props) {
  const attrs = {
    // default
    x1: 10,
    y1: 10,
    x2: 20,
    y2: 20,
    stroke: 'black',
    // ...props,
  }
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'style') {
      attrs[k] = v
    } else {
      const valueType = typeof v
      if (valueType !== 'object') {
        attrs[k] = v
      }
    }
  })
  return <line {...attrs} />
}

export default Line
