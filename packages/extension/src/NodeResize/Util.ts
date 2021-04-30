export function getRectReizeEdgePoint({ control, point, deltaX, deltaY, width, height }) {
  const { x, y } = point;
  const controlX = control.x;
  const controlY = control.y;
  let afterPoint = {
    x, y,
  };
  if (x === controlX) {
    // 控制点垂直边
    const afterX = x + deltaX;
    const afterY = y + deltaY * (1 - Math.abs(y - controlY) / height);
    afterPoint = { x: afterX, y: afterY };
  } else if (y === controlY) {
    // 控制点水平边
    const afterX = x + deltaX * (1 - Math.abs(x - controlX) / width);
    const afterY = y + deltaY * (1 - Math.abs(y - controlY) / height);
    afterPoint = { x: afterX, y: afterY };
  } else if (Math.abs(x - controlX) === width) {
    // 控制点平行垂直线
    const afterX = x;
    const afterY = y + deltaY * (1 - Math.abs(y - controlY) / height);
    afterPoint = { x: afterX, y: afterY };
  } else {
    // 控制点平行水平线
    const afterX = x + deltaX * (1 - Math.abs(x - controlX) / width);
    const afterY = y;
    afterPoint = { x: afterX, y: afterY };
  }
  return afterPoint;
}
