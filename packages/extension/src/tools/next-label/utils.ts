import LogicFlow, {
  BaseEdgeModel,
  BaseNodeModel,
  getNodeOutline,
  getEdgeOutline,
  Model,
  ModelType,
  BezierEdgeModel,
  isInSegment,
  getBezierPoints,
  points2PointsList,
  getBBoxOfPoints,
} from '@logicflow/core'
import { head, isEmpty, last, min } from 'lodash-es'
import { calcTwoPointsDistance, getPointOnBezier } from './algorithm'

import Point = LogicFlow.Point
import LabelConfig = LogicFlow.LabelConfig
import OutlineInfo = Model.OutlineInfo

export type BBoxInfo = {
  x: number
  y: number
  width: number
  height: number
}

// 工具函数：计算「缩放」后 某坐标点 相对中心位置比例不变的 新坐标点
// 前提条件: 当缩放一个矩形时，如果你希望矩形中的某个点的位置相对于矩形保持不变
//
// 1.	原始矩形的左上角坐标为 (x1, y1)，宽度为 w1，高度为 h1。
// 2.	缩放后的矩形的左上角坐标为 (x2, y2)，宽度为 w2，高度为 h2。
// 3.	矩形中的某个点在原始矩形中的坐标为 (px1, py1)。
//
// 目标
// 计算该点在缩放后矩形中的新坐标 (px2, py2)。
//
// 步骤
// 1.	计算相对位置：首先计算点 (px1, py1) 在原始矩形中的相对位置。
// relativeX = (px1 - x1) / w1
// relativeY = (py1 - y1) / h1
//
// 2.	计算新坐标：然后，使用相对位置计算该点在缩放后矩形中的新坐标。
// px2 = x2 + relativeX * w2
// py2 = y2 + relativeY * h2
export function calcPointAfterResize(
  origin: BBoxInfo,
  scaled: BBoxInfo,
  point: Point,
): Point {
  const { x: x1, y: y1, width: w1, height: h1 } = origin
  const { x: x2, y: y2, width: w2, height: h2 } = scaled
  const { x: px1, y: py1 } = point

  // 计算点在原始矩形中的相对位置
  const relativeX = (px1 - x1) / w1
  const relativeY = (py1 - y1) / h1

  // 计算点在缩放后矩形中的新坐标
  const px2 = x2 + relativeX * w2
  const py2 = y2 + relativeY * h2

  return { x: px2, y: py2 }
}

// 工具函数：计算「旋转」后 某坐标点 相对中心位置比例不变的 新坐标点
// 要计算以点 x1 = (x1, y1) 为中心，点 x2 = (x2, y2) 旋转 θ 度后的坐标位置，可以使用旋转矩阵进行计算。
//
// 旋转公式如下：
// 	1. 首先将点  x2  平移到以  x1  为原点的坐标系：
//  x' = x2 - x1
//  y' = y2 - y1
// 2.	然后应用旋转矩阵进行旋转：
//  x'' = x' * cos(θ) - y' * sin(θ)
//  y'' = x' * sin(θ) + y' * cos(θ)
// 3.	最后将结果平移回原来的坐标系：
//  x_new = x'' + x1
//  y_new = y'' + y1
//
// 综合起来，旋转后的新坐标  (x_new, y_new)  计算公式如下：
//
//  x_new = (x2 - x1) * cos(θ) - (y2 - y1) * sin(θ) + x1
//  y_new = (x2 - x1) * sin(θ) + (y2 - y1) * cos(θ) + y1
//
// 其中，θ 需要用弧度表示，如果你有的是角度，可以用以下公式转换为弧度：
//
// rad = deg * π / 180
export function rotatePointAroundCenter(
  target: Point,
  center: Point,
  radian: number,
): Point {
  // Rotate point (x2, y2) around point (x1, y1) by theta degrees.
  //
  // Parameters:
  //   x1, y1: Coordinates of the center point.
  //   x2, y2: Coordinates of the point to rotate.
  //   theta_degrees: Angle in degrees to rotate the point.
  //
  // Returns:
  //   Tuple of new coordinates (x_new, y_new) after rotation.

  const { x: x1, y: y1 } = center
  const { x: x2, y: y2 } = target

  // Translate point to origin
  const xPrime = x2 - x1
  const yPrime = y2 - y1

  // Rotate point
  const xDoublePrime = xPrime * Math.cos(radian) - yPrime * Math.sin(radian)
  const yDoublePrime = xPrime * Math.sin(radian) + yPrime * Math.cos(radian)

  // Translate point back
  const xNew = xDoublePrime + x1
  const yNew = yDoublePrime + y1

  return {
    x: xNew,
    y: yNew,
  }
}

/** Edge 相关工具方法 */

/**
 * 获取某点在一个矩形图形（节点 or 边的 outline）内的偏移量
 * @param point 目标点（此处即 Label 的坐标信息）
 * @param element 目标元素
 */
export const getPointOffsetOfElementOutline = (
  point: Point,
  element: BaseNodeModel | BaseEdgeModel,
) => {
  const baseType = element.BaseType
  const bboxInfo: OutlineInfo | undefined =
    baseType === 'node' ? getNodeOutline(element) : getEdgeOutline(element)

  if (bboxInfo) {
    const { x, y } = point
    const { x: minX, y: minY, x1: maxX, y1: maxY } = bboxInfo
    let xDeltaPercent: number = 0.5
    let yDeltaPercent: number = 0.5
    let xDeltaDistance: number = x - maxX
    let yDeltaDistance: number = y - maxY
    /**
     * 文本在由路径点组成的凸包内，就记录偏移比例
     * 文本在凸包外，记录绝对距离
     * 用于边路径变化时计算文本新位置
     */
    if (minX && maxX && minX < x && x < maxX) {
      xDeltaPercent = min([(x - minX) / (maxX - minX), 1]) as number
    } else if (x <= minX) {
      xDeltaDistance = x - minX
    } else {
      xDeltaDistance = x - maxX
    }
    if (minY && maxY && minY < y && y < maxY) {
      yDeltaPercent = min([(y - minY) / (maxY - minY), 1]) as number
    } else if (y <= minY) {
      yDeltaDistance = y - minY
    } else {
      yDeltaDistance = y - maxY
    }
    return {
      xDeltaPercent,
      yDeltaPercent,
      xDeltaDistance,
      yDeltaDistance,
    }
  }
}

/**
 * 判断节点是否在折线上
 * @param point 目标点坐标
 * @param points 折线上的点坐标
 */
const isPointOnPolyline = (point: Point, points: Point[]): boolean => {
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]
    const end = points[i + 1]
    if (isInSegment(point, start, end)) {
      return true
    }
  }

  return false
}

/**
 * 给定一个点  P = (x_0, y_0)  和线段的两个端点  A = (x_1, y_1)  和  B = (x_2, y_2) ，可以使用以下步骤计算点到线段的距离：
 * 1.	计算向量  AB  和  AP 。
 * 2.	计算  AB  的平方长度。
 * 3.	计算点  P  在直线  AB  上的投影点  Q 。
 * 4.	判断  Q  是否在线段  AB  上。
 * 5.	根据  Q  是否在线段上，计算点到线段的距离。
 *
 * 计算点到线段质检的距离
 * @param point
 * @param start
 * @param end
 */
export const pointToSegmentDistance = (
  point: Point,
  start: Point,
  end: Point,
): number => {
  const { x: px, y: py } = point
  const { x: sx, y: sy } = start
  const { x: ex, y: ey } = end

  const SEx = ex - sx
  const SEy = ey - sy
  const SPx = px - sx
  const SPy = py - sy

  const SE_SE = SEx ** 2 + SEy ** 2
  const SP_SE = SPx * SEx + SPy * SEy
  let t = SP_SE / SE_SE
  if (t < 0) t = 0
  if (t > 1) t = 1

  const qx = sx + t * SEx
  const qy = sy + t * SEy
  return Math.sqrt((px - qx) ** 2 + (py - qy) ** 2)
}

export const calcPolylineTotalLength = (points: Point[]) => {
  let length = 0
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]
    const end = points[i + 1]
    length += calcTwoPointsDistance(start, end)
  }
  return length
}

/**
 * TODO: 确认该函数的意义，写完还是没看懂什么意思
 * @param point
 * @param points
 */
export const pointPositionRatio = (point: Point, points: Point[]): number => {
  let length = 0
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]
    const end = points[i + 1]
    const segmentLength = calcTwoPointsDistance(start, end)

    if (pointToSegmentDistance(point, start, end) <= 20) {
      const d1 = calcTwoPointsDistance(point, start)
      length += d1
      const totalLength = calcPolylineTotalLength(points)
      // 小数点后保留一位（四舍五入）
      return Math.round((length / totalLength) * 10) / 10
    } else {
      length += segmentLength
    }
  }
  return 0
}

/**
 * 计算一个坐标在贝塞尔曲线上最近的一个点
 * @param point
 * @param edge
 * @param step
 */
export const calcClosestPointOnBezierEdge = (
  point: Point,
  edge: BezierEdgeModel,
  step: number = 5,
): Point => {
  let minDistance = Infinity
  let closestPoint: Point = point

  const pointsList = getBezierPoints(edge.path)
  if (isEmpty(pointsList)) return closestPoint

  const [start, sNext, ePre, end] = pointsList
  for (let i = 0; i <= step; i++) {
    const t = i / step
    const bezierPoint = getPointOnBezier(t, start, sNext, ePre, end)
    const distance = calcTwoPointsDistance(point, bezierPoint)
    if (distance < minDistance) {
      minDistance = distance
      closestPoint = bezierPoint
    }
  }

  return closestPoint
}

export const getNewPointAtDistance = (
  points: Point[],
  ratio: number,
): Point | undefined => {
  const totalLength = calcPolylineTotalLength(points)
  const targetLength = totalLength * ratio

  let length = 0
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]
    const end = points[i + 1]
    const segmentLength = calcTwoPointsDistance(start, end)
    if (length + segmentLength >= targetLength) {
      const ratio = (targetLength - length) / segmentLength
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      }
    } else {
      length += segmentLength
    }
  }
  return last(points)
}

/**
 * 计算一个坐标离折线（包括 PolylineEdge 和 LineEdge 直线）最近的一个点
 * @param point
 * @param edge
 */
export const calcLabelPositionOnPolyline = (
  point: Point,
  edge: BaseEdgeModel,
): Point => {
  let points = points2PointsList(edge.points)
  if (points.length === 0) {
    points = [edge.startPoint, edge.endPoint]
  }

  const { xDeltaPercent, yDeltaPercent, yDeltaDistance, xDeltaDistance } =
    getPointOffsetOfElementOutline(point, edge) ?? {}
  const isPointOnEdge = isPointOnPolyline(point, points)
  const ratio = pointPositionRatio(point, points)

  const start = head(points)
  const end = last(points)

  // 分别取路径中，x轴 和 y轴上的最大最小坐标值组合成一个矩形
  const { minX, minY, maxX, maxY } = getBBoxOfPoints(points, 10)

  if (!start || !end) return point

  if (xDeltaPercent && yDeltaPercent) {
    const positByPercent = {
      x: minX + (maxX - minX) * xDeltaPercent,
      y: minY + (maxY - minY) * yDeltaPercent,
    }
    return isPointOnEdge
      ? getNewPointAtDistance(points, ratio) ?? point // 函数什么意思
      : positByPercent
  }
  // 如果文本在凸包的上方或者下方
  if (xDeltaPercent && yDeltaDistance) {
    return {
      x: minX + (maxX - minX) * xDeltaPercent,
      y: yDeltaDistance < 0 ? minY + yDeltaDistance : maxY + yDeltaDistance,
    }
  }
  // 如果文本在凸包的左边或者右边
  if (yDeltaPercent && xDeltaDistance) {
    return {
      x: xDeltaDistance < 0 ? minX + xDeltaDistance : maxX + xDeltaDistance,
      y: minY + (maxY - minY) * yDeltaPercent,
    }
  }
  // 如果文本在凸包左上/左下/右上/右下
  if (xDeltaDistance && yDeltaDistance) {
    return {
      x: xDeltaDistance < 0 ? minX + xDeltaDistance : maxX + xDeltaDistance,
      y: yDeltaDistance < 0 ? minY + yDeltaDistance : maxY + yDeltaDistance,
    }
  }
  // 兜底
  return point
}

/**
 * 计算 Label 离边最近的点的坐标，用于更新为 Label 的坐标
 * @param label LabelConfig -> 当前 Label 的配置项
 * @param edge
 */
export const getLabelPositionOfLine = (
  label: LabelConfig,
  edge: BaseEdgeModel,
): Point => {
  const { x, y } = label
  if (edge.modelType === ModelType.BEZIER_EDGE) {
    return calcClosestPointOnBezierEdge({ x, y }, edge as BezierEdgeModel)
  }
  return calcLabelPositionOnPolyline({ x, y }, edge)
}
