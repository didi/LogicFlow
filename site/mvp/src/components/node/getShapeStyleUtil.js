export const getShapeStyleFuction = (style, properties) => {
  if (properties.backgroundColor) {
    style.fill = properties.backgroundColor
  }
  if (properties.gradientColor && style.fill !== properties.gradientColor) {
    style.fillGradient = properties.gradientColor
  }
  if (properties.borderColor) {
    style.stroke = properties.borderColor
  }
  if (properties.borderWidth) {
    style.strokeWidth = properties.borderWidth
  }
  if (properties.borderStyle) {
    if (properties.borderStyle === 'solid') {
      style.strokeDashArray = '0'
      // nodeResize里的bug导致的,array小写了
      style.strokeDasharray = '0'
    }
    if (properties.borderStyle === 'dashed') {
      style.strokeDashArray = '3 3'
      style.strokeDasharray = '3 3'
    }
    if (properties.borderStyle === 'dotted') {
      style.strokeDashArray = '1 1'
      style.strokeDasharray = '1 1'
    }
    if (properties.borderStyle === 'hidden') {
      style.stroke = style.fill
    }
  }
  return style
}

export const getTextStyleFunction = (style = {}, properties) => {
  if (properties.fontColor) {
    style.color = properties.fontColor
  }
  if (properties.fontSize) {
    style.fontSize = properties.fontSize
  }
  if (properties.fontFamily) {
    style.fontFamily = properties.fontFamily
  }
  if (properties.lineHeight) {
    style.lineHeight = properties.lineHeight
  }
  if (properties.textAlign) {
    style.textAlign = properties.textAlign
  }
  if (properties.fontWeight) {
    style.fontWeight = properties.fontWeight
  }
  if (properties.textDecoration) {
    style.textDecoration = properties.textDecoration
  }
  if (properties.fontStyle) {
    style.fontStyle = properties.fontStyle
  }
  return style
}
