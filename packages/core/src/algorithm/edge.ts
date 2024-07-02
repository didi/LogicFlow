import { reduce, isEmpty, assign, min, max } from 'lodash-es'
import LogicFlow from '../LogicFlow'
import Point = LogicFlow.Point

/**
 * 求两个线段交点入参：线段1端点: ab, 线段2端点： cd,
 * @param a
 * @param b
 * @param c
 * @param d
 * @return：有交点返回交点 Point，无交点返回false
 */
export const getCrossPointOfLine = (a: Point, b: Point, c: Point, d: Point) => {
  /** 1 解线性方程组, 求线段交点. * */
  // 如果分母为0 则平行或共线, 不相交
  const denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y)
  if (denominator === 0) {
    return false
  }
  // 线段所在直线的交点坐标 (x , y)
  const x =
    ((b.x - a.x) * (d.x - c.x) * (c.y - a.y) +
      (b.y - a.y) * (d.x - c.x) * a.x -
      (d.y - c.y) * (b.x - a.x) * c.x) /
    denominator
  const y =
    -(
      (b.y - a.y) * (d.y - c.y) * (c.x - a.x) +
      (b.x - a.x) * (d.y - c.y) * a.y -
      (d.x - c.x) * (b.y - a.y) * c.y
    ) / denominator

  /** 2 判断交点是否在两条线段上 * */
  if (
    // 交点在线段1上
    (x - a.x) * (x - b.x) <= 0 &&
    (y - a.y) * (y - b.y) <= 0 &&
    // 且交点也在线段2上
    (x - c.x) * (x - d.x) <= 0 &&
    (y - c.y) * (y - d.y) <= 0
  ) {
    // 返回交点p
    return {
      x,
      y,
    }
  }
  // 否则不相交
  return false
}

/* 判断一个点是否在线段中
入参点：point, 线段起终点，start,end,
返回值： 在线段中true，否则false
*/
export const isInSegment = (point: Point, start: Point, end: Point) => {
  const { x, y } = point
  const { x: startX, y: startY } = start
  const { x: endX, y: endY } = end
  const k = (endY - startY) / (endX - startX)
  const b = startY - k * startX
  return (
    x >= startX &&
    x <= endX &&
    y >= startY &&
    y <= endY &&
    Math.abs(y - k * x + b) < Number.EPSILON
  )
}

/**
 * 根据边所有点信息计算边的外框坐标信息
 * @param pointList 组成边的点的数组
 * @return bBoxInfo {
 *  minX: 外框在X轴上的最小坐标
 *  maxX: 外框在x轴上的最大坐标
 *  minY: 外框在y轴上的最小坐标
 *  maxY: 外框在y轴上的最大坐标
 * }
 */
export const getEdgeBboxInfo = (pointList: Point[]) => {
  return reduce(
    pointList,
    (result, value) => {
      if (isEmpty(result)) {
        assign(result, {
          minX: value.x,
          minY: value.y,
          maxX: value.x,
          maxY: value.y,
        })
        return result
      }
      const { minX, minY, maxX, maxY } = result as any
      // 双击创建文本时不一定能精准地点在边上，所以增加10的容错空间
      return {
        minX: min([minX, value.x]) - 10,
        minY: min([minY, value.y]) - 10,
        maxX: max([maxX, value.x]) + 10,
        maxY: max([maxY, value.y]) + 10,
      }
    },
    {},
  )
}

/**
 * 计算两点的直线距离
 * @param start 起点
 * @param end 重点
 * @returns 两点之间的直线距离
 */
export const getDistance = (start: Point, end: Point) => {
  const xDistance = start.x - end.x
  const yDistance = start.y - end.y
  //两点的欧几里得距离公式：根号下(x轴距离的平方+y轴距离的平方)
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
}
/**
 * 计算边外点到线段的直线距离
 * @param point 边外点
 * @param segmentStart 线段起点
 * @param segmentEnd 线段中间
 * @returns 点到边的直线距离
 */
export const getDistanceToSegment = (
  point: Point,
  segmentStart: Point,
  segmentEnd: Point,
) => {
  const { x, y } = point
  const { x: startX, y: startY } = segmentStart
  const { x: endX, y: endY } = segmentEnd

  const xDistance = endX - startX // 线段起终点在x轴上的方向向量
  const yDistance = endY - startY // 线段起终点在y轴上的方向向量
  // 如果起终点是同一个点，就直接计算边外点到这个点的距离
  if (!xDistance && !yDistance) {
    return getDistance(point, segmentStart)
  }
  // 计算边外点在线段上的投影点
  const t =
    ((x - startX) * xDistance + (y - startY) * yDistance) /
    (Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
  if (t < 0) {
    return getDistance(point, segmentStart)
  }
  if (t > 1) {
    return getDistance(point, segmentEnd)
  }
  const projection = {
    x: startX + t * xDistance,
    y: startY + t * yDistance,
  }
  return getDistance(point, projection)
}

export const labelIsInSegments = (point, pointList, tolerance = 1) => {
  for (let i = 0; i < pointList.length - 1; i++) {
    const segmentStart = pointList[i]
    const segmentEnd = pointList[i + 1]
    const distance = getDistanceToSegment(point, segmentStart, segmentEnd)
    if (distance <= tolerance) {
      return true
    }
  }
  return false
}

/**
 * 三次贝塞尔曲线的公式
 */

export const pointOnBezier = (t, p0, p1, p2, p3) => {
  const x =
    Math.pow(1 - t, 3) * p0.x +
    3 * Math.pow(1 - t, 2) * t * p1.x +
    3 * (1 - t) * Math.pow(t, 2) * p2.x +
    Math.pow(t, 3) * p3.x -
    10
  const y =
    Math.pow(1 - t, 3) * p0.y +
    3 * Math.pow(1 - t, 2) * t * p1.y +
    3 * (1 - t) * Math.pow(t, 2) * p2.y +
    Math.pow(t, 3) * p3.y -
    10
  return { x, y }
}
