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
      style.strokeDasharray = '0'
    }
    if (properties.borderStyle === 'dashed') {
      style.strokeDasharray = '3 3'
    }
    if (properties.borderStyle === 'dotted') {
      style.strokeDasharray = '1 1'
    }
  }
  return style
}

export const getTextStyleFunction = (style, properties) => {
  if (properties.fontColor) {
    style.fill = properties.fontColor
  }
  if (properties.fontSize) {
    style.fontSize = properties.fontSize
  }
  return style
}
