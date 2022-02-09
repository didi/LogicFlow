const getRectWidthAndPositon = (model, deltaX, deltaY) => {
  return {
    x: model.x + deltaX / 2,
    y: model.y + deltaY / 2,
    width: model.width + deltaX,
    height: model.height + deltaY
  }
}


