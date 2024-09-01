export interface SimplePoint {
  x: number
  y: number
}

/**
 * 根据两个点获取中心点坐标
 */
export function getNewCenter(startPoint: SimplePoint, endPoint: SimplePoint) {
  const { x: x1, y: y1 } = startPoint
  const { x: x2, y: y2 } = endPoint
  const newCenter = {
    x: x1 + (x2 - x1) / 2,
    y: y1 + (y2 - y1) / 2,
  }
  return newCenter
}

/**
 * 旋转矩阵公式，可以获取某一个坐标旋转angle后的坐标
 * @param p 当前坐标
 * @param center 旋转中心
 * @param angle 旋转角度（不是弧度）
 */
export function calculatePointAfterRotateAngle(
  p: SimplePoint,
  center: SimplePoint,
  angle: number,
) {
  const radian = angleToRadian(angle)
  const dx = p.x - center.x
  const dy = p.y - center.y
  const x = dx * Math.cos(radian) - dy * Math.sin(radian) + center.x
  const y = dx * Math.sin(radian) + dy * Math.cos(radian) + center.y
  return {
    x,
    y,
  }
}

/**
 * 角度转弧度
 * @param angle 角度
 */
export function angleToRadian(angle: number) {
  return (angle * Math.PI) / 180
}

/**
 * 弧度转角度
 * @param radian 弧度
 */
export function radianToAngle(radian: number) {
  return (radian / Math.PI) * 180
}
