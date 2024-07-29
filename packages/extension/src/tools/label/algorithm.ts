import LogicFlow from '@logicflow/core'
import Point = LogicFlow.Point

/**
 * 三次贝塞尔曲线公式
 */
export const getPointOnBezier = (
  t: number,
  P0: Point,
  P1: Point,
  P2: Point,
  P3: Point,
) => {
  const x =
    (1 - t) ** 3 * P0.x +
    3 * (1 - t) ** 2 * t * P1.x +
    3 * (1 - t) * t ** 2 * P2.x +
    t ** 3 * P3.x
  const y =
    (1 - t) ** 3 * P0.y +
    3 * (1 - t) ** 2 * t * P1.y +
    3 * (1 - t) * t ** 2 * P2.y +
    t ** 3 * P3.y

  return { x: x, y: y }
}

/**
 * 计算两个节点间的距离
 * @param point1
 * @param point2
 * @param gridSize
 */
export const calcTwoPointsDistance = (
  point1: Point,
  point2: Point,
  gridSize: number = 1,
): number => {
  const dx = (point1.x - point2.x) / gridSize
  const dy = (point1.y - point2.y) / gridSize
  return Math.sqrt(dx ** 2 + dy ** 2)
}
