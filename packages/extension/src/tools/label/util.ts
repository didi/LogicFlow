import { head, last, get, isEmpty, min } from 'lodash-es'
import LogicFlow, {
  BaseNodeModel,
  BaseEdgeModel,
  ModelType,
} from '@logicflow/core'
import {
  getBboxPosit,
  getDistanceToSegment,
  labelIsInSegments,
  pointOnBezier,
  getDistance,
  totalLength,
} from './algorithm'
import LabelModel from './LabelModel'
import Point = LogicFlow.Point
import Position = LogicFlow.Position

export const points2PointsList = (points: string): Point[] => {
  const currentPositionList = points.split(' ')
  const pointsList: Position[] = []
  currentPositionList &&
    currentPositionList.forEach((item) => {
      const [x, y] = item.split(',')
      pointsList.push({
        x: Number(x),
        y: Number(y),
      })
    })
  return pointsList
}

export const defaultPosition = (
  index: number,
  model: BaseNodeModel | BaseEdgeModel,
) => {
  if (model.BaseType === 'node') {
    return defaultPositionOfNode(index, model)
  }
  return defaultPositionOfLine(index, model)
}

const defaultPositionOfNode = (index: number, model: BaseNodeModel) => {
  const { x, y, width, height } = model
  /**
   * 多文本在节点中的默认位置排列:
   * 中心 -> 左上 -> 右上 -> 左下 -> 右下 -> 中间按y轴堆积
   */
  switch (index) {
    case 0:
      return {
        x: x - 10, // 视图层div默认宽高是20
        y: y + 20 * index - 10, //如果初始化了多个文本，则在y轴位置上累加
      }
    case 1:
      return {
        x: x - width / 2 - 10,
        y: y - height / 2 - 10,
      }
    case 2:
      return {
        x: x + width / 2 - 10,
        y: y - height / 2 - 10,
      }
    case 3:
      return {
        x: x - width / 2 - 10,
        y: y + height / 2 - 10,
      }
    case 4:
      return {
        x: x + width / 2 - 10,
        y: y + height / 2 - 10,
      }
    default:
      return {
        x: x - 10,
        y: y + 20 * (index - 5) - 10,
      }
  }
}

const defaultPositionOfLine = (index: number = 0, model: BaseEdgeModel) => {
  const {
    textPosition: { x, y },
    modelType,
    pointsList,
  } = model
  if (modelType === ModelType.POLYLINE_EDGE) {
    /**
     * 折线label的默认位置排列:
     * 中心 -> 边上每个拐点 -> 中间按y轴堆积
     */
    if (!index) {
      return {
        x: x - 10, // 视图层div默认宽高是20
        y: y + 20 * index - 10, //如果初始化了多个文本，则在y轴位置上累加
      }
    }
    if (index < pointsList.length) {
      const { x: pointX, y: pointY } = pointsList[index]
      return {
        x: pointX - 10,
        y: pointY - 10,
      }
    }
    return {
      x: x - 10,
      y: y + 20 * (index - pointsList.length) - 10,
    }
  }
  /**
   * 其他线条label的默认位置排列：
   * 中心 -> 起终点 -> 中心按y轴堆积
   */
  const start = head(pointsList)
  const end = last(pointsList)
  switch (index) {
    case 1:
      return {
        x: get(start, 'x', x) - 10,
        y: get(start, 'y', y) - 10,
      }
    case 2:
      return {
        x: get(end, 'y', y) - 10,
        y: get(end, 'y', y) - 10,
      }
    default:
      return {
        x: x - 10, // 视图层div默认宽高是20
        y: y + 20 * index - 10, //如果初始化了多个文本，则在y轴位置上累加
      }
  }
}

export const getNodeBBoxInfo = (
  position: Point,
  width: number,
  height: number,
) => {
  const { x, y } = position
  const minX = x - width / 2
  const minY = y - height / 2
  const maxX = x + width / 2
  const maxY = y + height / 2
  return [
    { x: minX, y: minY }, // 左上
    { x: minX, y: maxY }, // 右上
    { x: maxX, y: minY }, // 左下
    { x: maxX, y: maxY }, // 右下
  ]
}

export const getNodeLabelPosition = (
  label: LabelModel,
  bBoxPoints: Position[],
) => {
  const { x, y, xDeltaPercent, yDeltaPercent, yDeltaDistance, xDeltaDistance } =
    label
  if (isEmpty(bBoxPoints)) return { x, y }
  const { x: minX, y: minY } = head(bBoxPoints) as Position
  const { x: maxX, y: maxY } = last(bBoxPoints) as Position
  if (xDeltaPercent && yDeltaPercent) {
    return {
      x: minX + (maxX - minX) * xDeltaPercent,
      y: minY + (maxY - minY) * yDeltaPercent,
    }
  }
  // 如果文本在节点的上方或者下方
  if (xDeltaPercent && yDeltaDistance) {
    return {
      x: minX + (maxX - minX) * xDeltaPercent,
      y: yDeltaDistance < 0 ? minY + yDeltaDistance : maxY + yDeltaDistance,
    }
  }
  // 如果文本在节点的左边或者右边
  if (yDeltaPercent && xDeltaDistance) {
    return {
      x: xDeltaDistance < 0 ? minX + xDeltaDistance : maxX + xDeltaDistance,
      y: minY + (maxY - minY) * yDeltaPercent,
    }
  }
  // 如果文本在节点左上/左下/右上/右下
  if (xDeltaDistance && yDeltaDistance) {
    return {
      x: xDeltaDistance < 0 ? minX + xDeltaDistance : maxX + xDeltaDistance,
      y: yDeltaDistance < 0 ? minY + yDeltaDistance : maxY + yDeltaDistance,
    }
  }
  // 兜底
  return { x, y }
}

/**
 * 节点旋转后重新计算文本位置
 */
export const pointPositionAfterRotate = (
  point: Point,
  angle: number,
  center: Point,
): Point => {
  const radians = (Math.PI / 180) * angle
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)

  const translatedX = point.x - center.x
  const translatedY = point.y - center.y

  // Rotate point
  const rotatedX = translatedX * cos - translatedY * sin
  const rotatedY = translatedX * sin + translatedY * cos

  // Translate point back
  return {
    x: rotatedX + center.x,
    y: rotatedY + center.y,
  }
}

/**
 * 通用方法，获取节点在元素上的偏移量
 * @param point 文本坐标
 * @param startPoint 边起点坐标
 * @param endPoint 边终点坐标
 * @returns 文本在x轴和y轴上的偏移百分比
 */
export const getLabelDeltaOfBbox = (
  point: Point,
  pointList: Point[],
  baseType,
) => {
  // 双击创建文本时不一定能精准地点在边上，所以增加10的容错空间
  const bBoxInfo = getBboxPosit(pointList, baseType === 'node' ? 0 : 10)
  const { x, y } = point
  const { minX, minY, maxX, maxY } = bBoxInfo
  let xDeltaPercent
  let yDeltaPercent
  let xDeltaDistance
  let yDeltaDistance
  /**
   * 文本在由路径点组成的凸包内，就记录偏移比例
   * 文本在凸包外，记录绝对距离
   * 用于边路径变化时计算文本新位置
   */
  if (minX < x && x < maxX) {
    xDeltaPercent = minX && maxX ? min([(x - minX) / (maxX - minX), 1]) : 0.5
  } else if (x <= minX) {
    xDeltaDistance = x - minX
  } else {
    xDeltaDistance = x - maxX
  }
  if (minY < y && y < maxY) {
    yDeltaPercent = minY && maxY ? min([(y - minY) / (maxY - minY), 1]) : 0.5
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

/**
 * 判断label是否在折线边上
 * @param point label坐标
 * @param pointList 折线边拐点坐标list
 * @returns boolean 是否在边上
 */
export const isPointInPolyline = (
  point: Point,
  pointList: Point[],
  tolerance: number = 20,
) => {
  return labelIsInSegments(point, pointList, tolerance)
}

/**
 *
 * @param point 文本坐标
 * @param points 贝塞尔曲线点坐标
 * @param steps
 * @returns
 */
export const getClosestPointOnBezier = (
  point: Point,
  pointsList: Point[],
  steps: number = 5,
) => {
  let minDistance = Infinity
  let closestPoint
  if (isEmpty(pointsList)) return point
  const [start, sNext, ePre, end] = pointsList
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const bezierPoint = pointOnBezier(t, start, sNext, ePre, end)
    const distance = getDistance(point, bezierPoint)
    if (distance < minDistance) {
      minDistance = distance
      closestPoint = bezierPoint
    }
  }

  return closestPoint
}

/**
 * 判断一个点是否在贝塞尔曲线上
 * @param point 点坐标
 * @param pointList 曲线调整点坐标数组
 * @param tolerance 容错范围
 * @param steps 循环次数，值越大获取的点在曲线上的投影的坐标越准确
 * @returns
 */
export const isPointInBezier = (
  point: Point,
  pointList: Point[],
  tolerance: number = 20,
  steps: number = 5,
) => {
  const [start, sNext, ePre, end] = pointList
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const bezierPoint = pointOnBezier(t, start, sNext, ePre, end)
    const distance = getDistance(point, bezierPoint)

    if (distance < tolerance) {
      return true
    }
  }

  return false
}

/**
 * 边移动后获取文本位置
 * @param point 边上文本位置
 * @params points 边拐点位置
 */
export const getTextPositionOfPolyline = (
  label: LabelModel,
  points: string,
): Point => {
  const {
    x,
    y,
    xDeltaPercent,
    yDeltaPercent,
    yDeltaDistance,
    xDeltaDistance,
    isInLine,
    ratio,
  } = label
  const pointsPosition = points2PointsList(points)
  const startPoint = head(pointsPosition)
  const endPoint = last(pointsPosition)
  // 分别取路径中 x轴和y轴上的最大最小坐标值组合成一个矩形
  const bBoxInfo = getBboxPosit(pointsPosition, 10)
  const { minX, minY, maxX, maxY } = bBoxInfo
  if (!startPoint || !endPoint) return { x, y }
  /**
   * 两种情况：
   * 1. 如果点在凸包（bBoxInfo）内部，就先计算出文本按照偏移比例计算后的位置positByPercent
   * 1.1 如果文本初始化时就在边上，计算positByPercent距离折线边最近的点，该点即为文本新坐标
   * 1.2 如果文本初始化不在边上，positByPercent就是文本新坐标
   * 2. 如果点在凸包外，就用新坐标加文本到凸包的绝对位置得出新坐标
   * tip：初始化文本时会计算文本是否在边框矩阵内，如果不在的话DeltaPercent会为undefined
   */
  if (xDeltaPercent && yDeltaPercent) {
    const positByPercent = {
      x: minX + (maxX - minX) * xDeltaPercent,
      y: minY + (maxY - minY) * yDeltaPercent,
    }
    return isInLine
      ? newPointPositionAtDistance(pointsPosition, ratio)
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
  return { x, y }
}

/**
 *
 * @param point 文本坐标
 * @param pointList 折线拐点坐标list
 * @returns 距离边最近的点的坐标
 */
export const getClosestPointOnPolyline = (point: Point, pointList: Point[]) => {
  // 有缺陷 待优化，如果两个点的横坐标/纵坐标相同，边移动过程中有概率出现两点重合的情况
  let minDistance = Infinity
  let closestPoint
  const { x, y } = point
  pointList.forEach((item, index) => {
    const segmentStart = item
    const segmentEnd = pointList[index + 1]
    if (!segmentStart || !segmentEnd) return
    const { x: startX, y: startY } = segmentStart
    const { x: endX, y: endY } = segmentEnd

    const xDistance = endX - startX // 线段起终点在x轴上的方向向量
    const yDistance = endY - startY // 线段起终点在y轴上的方向向量
    const distance = getDistanceToSegment(point, segmentStart, segmentEnd)
    if (distance < minDistance) {
      minDistance = distance
      /**
       * 计算边外点在线段上的投影点
       */
      const t =
        ((x - startX) * xDistance + (y - startY) * yDistance) /
        (Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
      // 为什么-10？
      // 因为start + t * Distance 计算出来的坐标是相对label左上角的，为了能让label在中间，所以需要减去label容器一半宽高
      // label宽高设置逻辑在extension/src/Label/LabelElement中
      closestPoint = {
        x: startX + t * xDistance - 10,
        y: startY + t * yDistance - 10,
      }
    }
  })
  return closestPoint
}

const pointToSegmentDistance = (
  point: Point,
  startPoint: Point,
  endPoint: Point,
): number => {
  // 计算线段长度的平方
  const l2 = getDistance(startPoint, endPoint) ** 2
  if (l2 === 0) return getDistance(point, startPoint)
  // 计算点在边上的投影
  let t =
    ((point.x - startPoint.x) * (endPoint.x - startPoint.x) +
      (point.y - startPoint.y) * (endPoint.y - startPoint.y)) /
    l2
  t = Math.max(0, Math.min(1, t))
  return getDistance(point, {
    x: startPoint.x + t * (endPoint.x - startPoint.x),
    y: startPoint.y + t * (endPoint.y - startPoint.y),
  })
}

export const pointPositionRatio = (
  point: Point,
  pointList: Point[],
): number => {
  let length = 0
  for (let i = 0; i < pointList.length - 1; i++) {
    const segmentStart = pointList[i]
    const segmentEnd = pointList[i + 1]
    const segmentLength = getDistance(segmentStart, segmentEnd)

    // Check if the point is within tolerance distance of the current segment
    if (pointToSegmentDistance(point, segmentStart, segmentEnd) <= 20) {
      const d1 = getDistance(segmentStart, point)
      length += d1
      const total = totalLength(pointList)
      // 小数点后1位四舍五入
      return Math.round((length / total) * 10) / 10
    } else {
      length += segmentLength
    }
  }
  return 0
}

export const pointAtDistance = (polyline: Point[], distance: number): Point => {
  let accumulatedDistance = 0
  for (let i = 0; i < polyline.length - 1; i++) {
    const segmentStart = polyline[i]
    const segmentEnd = polyline[i + 1]
    const segmentLength = getDistance(segmentStart, segmentEnd)

    if (accumulatedDistance + segmentLength >= distance) {
      const remainingDistance = distance - accumulatedDistance
      const ratio = remainingDistance / segmentLength
      return {
        x: segmentStart.x + ratio * (segmentEnd.x - segmentStart.x),
        y: segmentStart.y + ratio * (segmentEnd.y - segmentStart.y),
      }
    } else {
      accumulatedDistance += segmentLength
    }
  }
  return polyline[polyline.length - 1]
}

export const newPointPositionAtDistance = (
  newPolyline: Point[],
  ratio: number,
): Point => {
  const newTotalLength = totalLength(newPolyline)
  const distanceOnNew = ratio * newTotalLength
  return pointAtDistance(newPolyline, distanceOnNew)
}
