import { pick } from 'lodash-es'
import { getBytesLength } from './edge'
import LogicFlow from '../LogicFlow'
import {
  GraphModel,
  Model,
  BaseNodeModel,
  CircleNodeModel,
  RectNodeModel,
  EllipseNodeModel,
  PolygonNodeModel,
} from '../model'
import { SegmentDirection } from '../constant'
import { isInSegment } from '../algorithm/edge'

import Point = LogicFlow.Point
import Direction = LogicFlow.Direction
import NodeConfig = LogicFlow.NodeConfig
import LineSegment = LogicFlow.LineSegment

/* 获取所有锚点 */
export const getAnchors = (data): Point[] => {
  const { anchors } = data
  return anchors
}

type NodeContaint = {
  node: BaseNodeModel
  anchorIndex: number
  anchor: Model.AnchorConfig
}

/* 手动边时获取目标节点的信息：目标节点，目标节点的锚点index以及坐标 */
export const targetNodeInfo = (
  position: Point,
  graphModel: GraphModel,
): NodeContaint => {
  const { nodes } = graphModel
  let nodeInfo
  for (let i = nodes.length - 1; i >= 0; i--) {
    const targetNode = nodes[i]
    const inNode = isInNodeBbox(position, targetNode)
    if (inNode) {
      const anchorInfo = targetNode.getTargetAnchor(position)
      if (anchorInfo) {
        // 不能连接到没有锚点的节点
        const currentNodeInfo = {
          node: targetNode,
          anchorIndex: anchorInfo.index,
          anchor: anchorInfo.anchor,
        }
        // fix: 489 多个节点重合时，连线连接上面的那一个。
        if (!nodeInfo || isNodeHigher(targetNode, nodeInfo.node, graphModel)) {
          nodeInfo = currentNodeInfo
        }
      }
    }
  }
  return nodeInfo
}
/**
 * 比较两个节点
 */
const isNodeHigher = (node1, node2, graphModel) => {
  if (node1.zIndex > node2.zIndex) {
    return true
  }
  return (
    graphModel.nodesMap[node1.id].index > graphModel.nodesMap[node2.id].index
  )
}

/* 手动边时获取目标节点上，距离目标位置最近的锚点 */
export const getClosestAnchor = (
  position: Point,
  node: BaseNodeModel,
): Model.AnchorInfo => {
  const anchors = getAnchors(node)
  let closest
  let minDistance = Number.MAX_SAFE_INTEGER
  for (let i = 0; i < anchors.length; i++) {
    const len = distance(position.x, position.y, anchors[i].x, anchors[i].y)
    if (len < minDistance) {
      minDistance = len
      closest = {
        index: i,
        anchor: {
          ...anchors[i],
          x: anchors[i].x,
          y: anchors[i].y,
          id: anchors[i].id,
        },
      }
    }
  }
  return closest
}

/* 两点之间距离 */
export const distance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number => Math.hypot(x1 - x2, y1 - y2)

/* 是否在某个节点内，手否进行连接，有offset控制粒度，与outline有关，可以优化 */
export const isInNode = (position: Point, node: BaseNodeModel): boolean => {
  let inNode = false
  const offset = 0
  const bBox = getNodeBBox(node)
  if (
    position.x >= bBox.minX - offset &&
    position.x <= bBox.maxX + offset &&
    position.y >= bBox.minY - offset &&
    position.y <= bBox.maxY + offset
  ) {
    inNode = true
  }
  return inNode
}
export const isInNodeBbox = (position: Point, node): boolean => {
  let inNode = false
  const offset = 5
  const bBox = getNodeBBox(node)
  if (
    position.x >= bBox.minX - offset &&
    position.x <= bBox.maxX + offset &&
    position.y >= bBox.minY - offset &&
    position.y <= bBox.maxY + offset
  ) {
    inNode = true
  }
  return inNode
}

export type NodeBBox = {
  x: number
  y: number
  width: number
  height: number
  minX: number
  minY: number
  maxX: number
  maxY: number
  centerX: number
  centerY: number
}

/* 获取节点bbox */
export const getNodeBBox = (node: BaseNodeModel): NodeBBox => {
  const { x, y, width, height } = node
  return {
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
}
type RadiusCircle = {
  x: number
  y: number
  r: number
}
export const getRectRadiusCircle = (node: BaseNodeModel): RadiusCircle[] => {
  const { x, y, width, height, radius } = node as RectNodeModel
  return [
    {
      x: x - width / 2 + radius,
      y: y - height / 2 + radius,
      r: radius,
    },
    {
      x: x + width / 2 - radius,
      y: y - height / 2 + radius,
      r: radius,
    },
    {
      x: x - width / 2 + radius,
      y: y + height / 2 - radius,
      r: radius,
    },
    {
      x: x + width / 2 - radius,
      y: y + height / 2 - radius,
      r: radius,
    },
  ]
}

export const getClosestRadiusCenter = (
  point: Point,
  direction: Direction,
  node: BaseNodeModel,
): Point => {
  const radiusCenter = getRectRadiusCircle(node as RectNodeModel)
  let closestRadiusPoint
  let minDistance = Number.MAX_SAFE_INTEGER
  radiusCenter.forEach((item) => {
    const radiusDistance = distance(point.x, point.y, item.x, item.y)
    if (radiusDistance < minDistance) {
      minDistance = radiusDistance
      closestRadiusPoint = item
    }
  })
  return getCrossPointWithCircle(point, direction, closestRadiusPoint)
}
/* 求点在垂直或者水平方向上与圆形的交点 */
export const getCrossPointWithCircle = (
  point: Point,
  direction: Direction,
  node: BaseNodeModel,
): Point => {
  let crossPoint
  const { x, y, r } = node as CircleNodeModel
  if (direction === SegmentDirection.HORIZONTAL) {
    // 水平，x轴
    const crossLeft = x - Math.sqrt(r * r - (point.y - y) * (point.y - y))
    const crossRight = x + Math.sqrt(r * r - (point.y - y) * (point.y - y))
    const crossX =
      Math.abs(crossLeft - point.x) < Math.abs(crossRight - point.x)
        ? crossLeft
        : crossRight
    crossPoint = {
      x: crossX,
      y: point.y,
    }
  } else if (direction === SegmentDirection.VERTICAL) {
    // 垂直，y轴
    const crossTop = y - Math.sqrt(r * r - (point.x - x) * (point.x - x))
    const crossBottom = y + Math.sqrt(r * r - (point.x - x) * (point.x - x))
    const crossY =
      Math.abs(crossTop - point.y) < Math.abs(crossBottom - point.y)
        ? crossTop
        : crossBottom
    crossPoint = {
      x: point.x,
      y: crossY,
    }
  }
  return crossPoint
}

/* 判断点所在边的方向 */
export const pointEdgeDirection = (
  point: Point,
  node: BaseNodeModel,
): Direction => {
  const dx = Math.abs(point.x - node.x)
  const dy = Math.abs(point.y - node.y)
  return dx / node.width > dy / node.height
    ? SegmentDirection.VERTICAL
    : SegmentDirection.HORIZONTAL
}

// 判断矩形外框上一点是否在矩形直行线上
export const inStraightLineOfRect = (
  point: Point,
  node: BaseNodeModel,
): boolean => {
  const rect = node as RectNodeModel
  let isInStraight = false
  const rectBox = {
    minX: rect.x - rect.width / 2 + rect.radius,
    maxX: rect.x + rect.width / 2 - rect.radius,
    minY: rect.y - rect.height / 2 + rect.radius,
    maxY: rect.y + rect.height / 2 - rect.radius,
  }
  const { x, y, width, height } = rect
  if (point.y === y + height / 2 || point.y === y - height / 2) {
    isInStraight = point.x > rectBox.minX && point.x < rectBox.maxX
  } else if (point.x === x + width / 2 || point.x === x - width / 2) {
    isInStraight = point.y > rectBox.minY && point.y < rectBox.maxY
  }
  return isInStraight
}

/* 求点在垂直或者水平方向上与椭圆的交点 */
export const getCrossPointWithEllipse = (
  point: Point,
  direction: Direction,
  node: BaseNodeModel,
) => {
  let crossPoint
  const { x, y, rx, ry } = node as EllipseNodeModel
  if (direction === SegmentDirection.HORIZONTAL) {
    // 水平
    const crossLeft =
      x -
      Math.sqrt(rx * rx - ((point.y - y) * (point.y - y) * rx * rx) / (ry * ry))
    const crossRight =
      x +
      Math.sqrt(rx * rx - ((point.y - y) * (point.y - y) * rx * rx) / (ry * ry))
    const crossX =
      Math.abs(crossLeft - point.x) < Math.abs(crossRight - point.x)
        ? crossLeft
        : crossRight
    crossPoint = {
      x: crossX,
      y: point.y,
    }
  } else if (direction === SegmentDirection.VERTICAL) {
    // 垂直
    const crossTop =
      y -
      Math.sqrt(ry * ry - ((point.x - x) * (point.x - x) * ry * ry) / (rx * rx))
    const crossBottom =
      y +
      Math.sqrt(ry * ry - ((point.x - x) * (point.x - x) * ry * ry) / (rx * rx))
    const crossY =
      Math.abs(crossTop - point.y) < Math.abs(crossBottom - point.y)
        ? crossTop
        : crossBottom
    crossPoint = {
      x: point.x,
      y: crossY,
    }
  }
  return crossPoint
}

/* 求点在垂直或者水平方向上与多边形的交点 */
export const getCrossPointWithPolygon = (
  point: Point,
  direction: Direction,
  node: BaseNodeModel,
): Point => {
  const { pointsPosition } = node as PolygonNodeModel
  let minDistance = Number.MAX_SAFE_INTEGER
  let crossPoint
  const segments: LineSegment[] = []
  for (let i = 0; i < pointsPosition.length; i++) {
    segments.push({
      start: pointsPosition[i],
      end: pointsPosition[(i + 1) % pointsPosition.length],
    })
  }
  segments.forEach((item) => {
    const { start, end } = item
    let a = start
    let b = end
    if (start.x > end.x) {
      a = end
      b = start
    }
    let pointXY = {
      x: point.x,
      y: point.y,
    }
    // 如果多边形当前线段是垂直,求交点
    if (a.x === b.x && direction === SegmentDirection.HORIZONTAL) {
      pointXY = {
        x: a.x,
        y: point.y,
      }
    }
    // 如果多边形当前线段是水平,求交点
    if (a.y === b.y && direction === SegmentDirection.VERTICAL) {
      pointXY = {
        x: point.x,
        y: a.y,
      }
    }
    // 如果线段不是水平或者垂直, 使用向量方程进行计算
    if (a.x !== b.x && a.y !== b.y) {
      const k = (b.y - a.y) / (b.x - a.x)
      const m = (a.x * b.y - b.x * a.y) / (a.x - b.x)
      if (direction === SegmentDirection.HORIZONTAL) {
        pointXY = {
          x: (point.y - m) / k,
          y: point.y,
        }
      } else if (direction === SegmentDirection.VERTICAL) {
        pointXY = {
          x: point.x,
          y: k * point.x + m,
        }
      }
    }
    // 如果交点在线段上
    const inSegment = isInSegment(pointXY, start, end)
    if (inSegment) {
      const currentDistance = distance(pointXY.x, pointXY.y, point.x, point.y)
      if (currentDistance < minDistance) {
        minDistance = currentDistance
        crossPoint = pointXY
      }
    }
  })
  return crossPoint
}

// 规范节点初始化数据
export const pickNodeConfig = (data): NodeConfig => {
  const nodeData = pick(data, [
    'id',
    'type',
    'x',
    'y',
    'text',
    'properties',
    'virtual', // 区域节点是否为dnd添加的虚拟节点
    'rotate',
  ])
  return nodeData
}

/**
 * 基于节点的边，重新获取新的节点
 */
export const getNodeAnchorPosition = (center, point, width, height) => {
  let { x, y } = center
  if (point.x > center.x) {
    x = center.x + width / 2
  } else if (point.x < center.x) {
    x = center.x - width / 2
  }
  if (point.y > center.y) {
    y = center.y + height / 2
  } else if (point.y < center.y) {
    y = center.y - height / 2
  }
  return {
    x,
    y,
  }
}

// 获取文案高度，自动换行，利用dom计算高度
export const getHtmlTextHeight = ({ rows, style, rowsLength, className }) => {
  const dom = document.createElement('div')
  dom.style.fontSize = style.fontSize
  dom.style.width = style.width
  dom.className = className
  dom.style.lineHeight = style.lineHeight
  dom.style.padding = style.padding
  if (style.fontFamily) {
    dom.style.fontFamily = style.fontFamily
  }
  if (rowsLength > 1) {
    rows.forEach((row) => {
      const rowDom = document.createElement('div')
      rowDom.textContent = row
      dom.appendChild(rowDom)
    })
  } else {
    dom.textContent = rows
  }
  document.body.appendChild(dom)
  const height = dom.clientHeight
  document.body.removeChild(dom)
  return height
}
// 获取文案高度，自动换行，利用dom计算高度
export const getSvgTextWidthHeight = ({ rows, rowsLength, fontSize }) => {
  let longestBytes = 0
  rows &&
    rows.forEach((item) => {
      const rowByteLength = getBytesLength(item)
      longestBytes = rowByteLength > longestBytes ? rowByteLength : longestBytes
    })
  // 背景框宽度，最长一行字节数/2 * fontsize + 2
  // 背景框宽度， 行数 * fontsize + 2
  return {
    width: Math.ceil(longestBytes / 2) * fontSize + fontSize / 4,
    height: rowsLength * (fontSize + 2) + fontSize / 4,
  }
}

/**
 * @description 格式化边校验信息
 */
export const formateAnchorConnectValidateData = (data) => {
  if (typeof data !== 'object') {
    return {
      isAllPass: !!data,
      msg: data ? '' : '不允许连接',
    }
  }
  return data
}
