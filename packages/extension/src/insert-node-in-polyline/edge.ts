import LogicFlow, { PolylineEdgeModel, BaseNodeModel } from '@logicflow/core'

import Point = LogicFlow.Point

// 这个里面的函数有些在core中已经存在，为了解耦关系，没有引用

enum SegmentDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

/**
 * 判断一个点是否在线段中
 * @param point 判断的点
 * @param start 线段的起点
 * @param end 线段的终点
 * @param deviation 误差范围
 * @returns boolean
 */
export const isInSegment = (point, start, end, deviation = 0) => {
  const distance = distToSegment(point, start, end)
  return distance <= deviation
}

function sqr(x) {
  return x * x
}

function dist2(v, w) {
  return sqr(v.x - w.x) + sqr(v.y - w.y)
}

export const distToSegmentSquared = (p, v, w) => {
  const l2 = dist2(v, w)
  if (l2 === 0) return dist2(p, v)
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2
  t = Math.max(0, Math.min(1, t))
  return dist2(p, {
    x: v.x + t * (w.x - v.x),
    y: v.y + t * (w.y - v.y),
  })
}

export const distToSegment = (point: Point, start: Point, end: Point) =>
  Math.sqrt(distToSegmentSquared(point, start, end))

/* 获取节点bbox */
const getNodeBBox = (node: BaseNodeModel) => {
  const { x, y, width, height } = node
  const bBox = {
    minX: x - width / 2,
    minY: y - height / 2,
    maxX: x + width / 2,
    maxY: y + height / 2,
    x,
    y,
    width,
    height,
    centerX: x,
    centerY: y,
  }
  return bBox
}

/* 判断线段的方向 */
const segmentDirection = (start: Point, end: Point) => {
  let direction
  if (start.x === end.x) {
    direction = SegmentDirection.VERTICAL
  } else if (start.y === end.y) {
    direction = SegmentDirection.HORIZONTAL
  }
  return direction
}

// 节点是够在线段内，求出节点与线段的交点
export const crossPointInSegment = (
  node: BaseNodeModel,
  start: Point,
  end: Point,
) => {
  const bBox = getNodeBBox(node)
  const direction = segmentDirection(start, end)
  const maxX = Math.max(start.x, end.x)
  const minX = Math.min(start.x, end.x)
  const maxY = Math.max(start.y, end.y)
  const minY = Math.min(start.y, end.y)
  const { x, y, width, height } = node
  if (direction === SegmentDirection.HORIZONTAL) {
    // 同一水平线
    if (maxX >= bBox.maxX && minX <= bBox.minX) {
      return {
        startCrossPoint: {
          x: start.x > end.x ? x + width / 2 : x - width / 2,
          y: start.y,
        },
        endCrossPoint: {
          x: start.x > end.x ? x - width / 2 : x + width / 2,
          y: start.y,
        },
      }
    }
  } else if (direction === SegmentDirection.VERTICAL) {
    // 同一垂直线
    if (maxY >= bBox.maxY && minY <= bBox.minY) {
      return {
        startCrossPoint: {
          x: start.x,
          y: start.y > end.y ? y + height / 2 : y - height / 2,
        },
        endCrossPoint: {
          x: start.x,
          y: start.y > end.y ? y - height / 2 : y + height / 2,
        },
      }
    }
  }
}

interface SegmentCross {
  crossIndex: number
  crossPoints: {
    startCrossPoint: Point
    endCrossPoint: Point
  }
}

// 节点是否在线段内
// eslint-disable-next-line max-len
export const isNodeInSegment = (
  node: BaseNodeModel,
  polyline: PolylineEdgeModel,
  deviation = 0,
): SegmentCross => {
  const { x, y } = node
  const { pointsList } = polyline
  for (let i = 0; i < pointsList.length - 1; i++) {
    if (
      isInSegment(
        {
          x,
          y,
        },
        pointsList[i],
        pointsList[i + 1],
        deviation,
      )
    ) {
      const bBoxCross = crossPointInSegment(
        node,
        pointsList[i],
        pointsList[i + 1],
      )
      if (bBoxCross) {
        return {
          crossIndex: i + 1,
          crossPoints: bBoxCross,
        }
      }
    }
  }
  return {
    crossIndex: -1,
    crossPoints: {
      startCrossPoint: {
        x: 0,
        y: 0,
      },
      endCrossPoint: {
        x: 0,
        y: 0,
      },
    },
  }
}
