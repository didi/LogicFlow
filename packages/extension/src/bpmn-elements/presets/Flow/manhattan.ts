import { BBoxType } from './flow'
import LogicFlow from '@logicflow/core'

import Point = LogicFlow.Point

class NodeBase {
  x: any
  y: any
  G: number
  H: number
  isProcessed: boolean
  connection: any
  from: any

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.G = 0
    this.H = 0
    this.isProcessed = false
    this.connection = null
    this.from = null
  }

  get F() {
    return this.G + this.H
  }

  setProcessed() {
    this.isProcessed = true
  }

  setConnection(connection: any) {
    this.connection = connection
  }

  setFrom(from: any) {
    this.from = from
  }

  setG(g: number) {
    this.G = g
  }

  setH(h: number) {
    this.H = h
  }

  getManhattanDistanceTo(point: { x: number; y: number }) {
    const { x: x1, y: y1 } = this
    const { x: x2, y: y2 } = point
    return Math.abs(x1 - x2) + Math.abs(y1 - y2)
  }
}

export class PriorityQueue {
  heap: any[]

  constructor() {
    this.heap = []
  }

  enqueue(node: { x: never; y: never }, priority: number) {
    this.heap.push({
      node,
      priority,
    })
    this.bubbleUp(this.heap.length - 1)
  }

  dequeue() {
    const min = this.heap[0]
    const end = this.heap.pop()
    if (this.heap.length > 0) {
      this.heap[0] = end
      this.sinkDown(0)
    }
    return min
  }

  bubbleUp(index: number) {
    const node = this.heap[index]
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      const parent = this.heap[parentIndex]
      if (node.priority >= parent.priority) break
      this.heap[parentIndex] = node
      this.heap[index] = parent
      index = parentIndex
    }
  }

  sinkDown(index: number) {
    const leftChildIndex = 2 * index + 1
    const rightChildIndex = 2 * index + 2
    let smallestChildIndex = index
    const { length } = this.heap

    if (
      leftChildIndex < length &&
      this.heap[leftChildIndex].priority <
        this.heap[smallestChildIndex].priority
    ) {
      smallestChildIndex = leftChildIndex
    }

    if (
      rightChildIndex < length &&
      this.heap[rightChildIndex].priority <
        this.heap[smallestChildIndex].priority
    ) {
      smallestChildIndex = rightChildIndex
    }

    if (smallestChildIndex !== index) {
      const swapNode = this.heap[smallestChildIndex]
      this.heap[smallestChildIndex] = this.heap[index]
      this.heap[index] = swapNode
      this.sinkDown(smallestChildIndex)
    }
  }

  isEmpty() {
    return this.heap.length === 0
  }
}

function expandBBox(bbox: BBoxType, offset: number) {
  const { minX, minY, maxX, maxY } = bbox
  return {
    minX: minX - offset,
    minY: minY - offset,
    maxX: maxX + offset,
    maxY: maxY + offset,
  }
}

function getPointsFromBBoxBorder(bbox: BBoxType) {
  const { minX, minY, maxX, maxY } = bbox
  return [
    {
      x: minX,
      y: minY,
    },
    {
      x: minX + (maxX - minX) / 2,
      y: minY,
    },
    {
      x: maxX,
      y: minY,
    },
    {
      x: maxX,
      y: minY + (maxY - minY) / 2,
    },
    {
      x: maxX,
      y: maxY,
    },
    {
      x: minX + (maxX - minX) / 2,
      y: maxY,
    },
    {
      x: minX,
      y: maxY,
    },
    {
      x: minX,
      y: minY + (maxY - minY) / 2,
    },
  ]
}

function getHull(points: any[]) {
  const xs = points.map((item: { x: any }) => item.x)
  const ys = points.map((item: { y: any }) => item.y)
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  }
}

function isPointInsideTheBoxes(point: NodeBase | Point, bboxes: BBoxType[]) {
  let flag = false
  for (const bbox of bboxes) {
    if (isBBoxContainThePoint(bbox, point)) {
      flag = true
      break
    }
  }
  return flag
}

function isBBoxContainThePoint(bbox: BBoxType, p: NodeBase | Point) {
  const { x, y } = p
  const { minX, minY, maxX, maxY } = bbox
  // ignore the point on the border
  return x > minX && x < maxX && y > minY && y < maxY
}

function isSegmentsIntersected(seg1: any[], seg2: any[]) {
  const [p0, p1] = seg1
  const [p2, p3] = seg2
  const s1x = p1.x - p0.x
  const s1y = p1.y - p0.y
  const s2x = p3.x - p2.x
  const s2y = p3.y - p2.y

  const s =
    (-s1y * (p0.x - p2.x) + s1x * (p0.y - p2.y)) / (-s2x * s1y + s1x * s2y)
  const t =
    (s2x * (p0.y - p2.y) - s2y * (p0.x - p2.x)) / (-s2x * s1y + s1x * s2y)

  return s >= 0 && s <= 1 && t >= 0 && t <= 1
}

function getVerticesFromBBox(bbox: BBoxType) {
  const { minX, minY, maxX, maxY } = bbox
  return [
    {
      x: minX,
      y: minY,
    },
    {
      x: maxX,
      y: minY,
    },
    {
      x: maxX,
      y: maxY,
    },
    {
      x: minX,
      y: maxY,
    },
  ]
}

function isSegmentCrossingBBox(line: any, bbox: BBoxType) {
  const [p1, p2] = line
  const { minX, minY, maxX, maxY } = bbox
  const width = Math.abs(maxX - minX)
  const height = Math.abs(maxY - minY)
  if (width === 0 && height === 0) {
    return false
  }
  const [pa, pb, pc, pd] = getVerticesFromBBox(bbox)
  let count = 0
  if (isSegmentsIntersected([p1, p2], [pa, pb])) {
    count++
  }
  if (isSegmentsIntersected([p1, p2], [pa, pd])) {
    count++
  }
  if (isSegmentsIntersected([p1, p2], [pb, pc])) {
    count++
  }
  if (isSegmentsIntersected([p1, p2], [pc, pd])) {
    count++
  }
  return count !== 0
}

function aStarFindPathByGrid(
  startNode: NodeBase,
  endNode: NodeBase,
  step: number,
  bboxes: any[],
  outside: BBoxType,
) {
  let toSearch = [startNode]
  const searchSet = new Set()

  while (toSearch.length) {
    let current = toSearch[0]

    for (const item of toSearch) {
      if (item.F < current.F || (item.F === current.F && item.H < current.H)) {
        current = item
      }
    }

    if (`${current.x}/${current.y}` === `${endNode.x}/${endNode.y}`) {
      const res = [
        {
          x: current.x,
          y: current.y,
        },
      ]
      while (current.connection) {
        const { connection } = current
        res.push({
          x: connection.x,
          y: connection.y,
        })
        current = current.connection
      }
      return res.reverse()
    }

    const val = `${current.x}/${current.y}`

    !searchSet.has(val) && searchSet.add(val)

    toSearch = toSearch.filter(
      (item) => `${current.x}/${current.y}` !== `${item.x}/${item.y}`,
    )

    const neighborsRes = findNeighborsByGridStep(
      current,
      step,
      bboxes,
      outside,
    ).filter((item) => {
      const flag = !isPointInsideTheBoxes(item, bboxes)
      return flag
    })

    const tmpRes: NodeBase[] = []
    neighborsRes.forEach((item: NodeBase) => {
      const key = `${item.x}/${item.y}`
      if (!searchSet.has(key)) {
        tmpRes.push(item)
        tmpRes.push(item)
      }
    })

    for (const neighbor of tmpRes) {
      if (neighbor.isProcessed) continue
      const inSearch = toSearch.includes(current)
      const costToNeighbor =
        current.G + current.getManhattanDistanceTo(neighbor)

      if (!inSearch || costToNeighbor < neighbor.G) {
        neighbor.setG(costToNeighbor)
        neighbor.setConnection(current)
        current.setFrom(neighbor)

        if (!inSearch) {
          neighbor.setH(neighbor.getManhattanDistanceTo(endNode))
          toSearch.push(neighbor)
        }
      }
    }
  }
  return null
}

function findNeighborsByGridStep(
  cur: NodeBase,
  step: number,
  bboxes: any,
  outside: BBoxType,
) {
  const neighbors: NodeBase[] = []
  const { x, y } = cur
  const { minX, minY, maxX, maxY } = outside
  const x1 = x - step
  const x2 = x + step
  const y1 = y - step
  const y2 = y + step

  // eslint-disable-next-line no-shadow
  function isValid(
    cur: NodeBase | Point,
    neighbor: NodeBase | Point,
    bboxes: BBoxType[],
  ) {
    let flag =
      !isPointInsideTheBoxes(neighbor, bboxes) &&
      !isPointInsideTheBoxes(cur, bboxes)
    if (!flag) return false
    for (const bbox of bboxes) {
      if (
        isSegmentCrossingBBox(
          [
            {
              x: cur.x,
              y: cur.y,
            },
            {
              x: neighbor.x,
              y: neighbor.y,
            },
          ],
          bbox,
        )
      ) {
        flag = false
        break
      }
    }
    return flag
  }

  if (x1 >= minX) {
    isValid(
      cur,
      {
        x: x1,
        y,
      },
      bboxes,
    ) && neighbors.push(new NodeBase(x1, y))
  }
  if (x2 <= maxX) {
    isValid(
      cur,
      {
        x: x2,
        y,
      },
      bboxes,
    ) && neighbors.push(new NodeBase(x2, y))
  }
  if (y1 >= minY) {
    isValid(
      cur,
      {
        x,
        y: y1,
      },
      bboxes,
    ) && neighbors.push(new NodeBase(x, y1))
  }
  if (y2 <= maxY) {
    isValid(
      cur,
      {
        x,
        y: y2,
      },
      bboxes,
    ) && neighbors.push(new NodeBase(x, y2))
  }
  return neighbors
}

function getAnchorWithOffset({ bbox }: any, node: NodeBase, offset: number) {
  const { minX, minY, maxX, maxY } = bbox
  const { x, y } = node
  if (x === minX) {
    return {
      x: x - offset,
      y,
    }
  }
  if (x === maxX) {
    return {
      x: x + offset,
      y,
    }
  }
  if (y === minY) {
    return {
      x,
      y: y - offset,
    }
  }
  if (y === maxY) {
    return {
      x,
      y: y + offset,
    }
  }
}

function perpendicularDistance(
  point: NodeBase,
  lineStart: NodeBase,
  lineEnd: NodeBase,
) {
  const { x: x1, y: y1 } = lineStart
  const { x: x2, y: y2 } = lineEnd
  const { x, y } = point

  if (x1 === x2) {
    // 线段是垂直的
    return Math.abs(x - x1)
  }

  if (y1 === y2) {
    // 线段是水平的
    return Math.abs(y - y1)
  }

  // 计算点到线段垂直点的坐标
  const px =
    x1 +
    ((x2 - x1) * ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1))) /
      ((x2 - x1) ** 2 + (y2 - y1) ** 2)
  const py =
    y1 +
    ((y2 - y1) * ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1))) /
      ((x2 - x1) ** 2 + (y2 - y1) ** 2)

  // 计算曼哈顿距离
  return Math.abs(x - px) + Math.abs(y - py)
}

function perpendicularToStraight(line: string | any[]) {
  // Step 1: Convert perpendicular segments to straight lines
  const straightLine = [line[0]]
  for (let i = 0; i < line.length - 2; i++) {
    const point1 = line[i]
    const point2 = line[i + 1]
    const point3 = line[i + 2]

    if (
      isVertical(point1, point2, point3) ||
      isHorizontal(point1, point2, point3)
    ) {
      // Remove point2 to make it a straight line
      continue
    }

    straightLine.push(point2)
  }
  straightLine.push(line[line.length - 1])

  // Step 2: Douglas-Peucker algorithm to remove redundant points
  // return straightLine;
  const epsilon = 1.0 // Adjust epsilon based on your requirements
  return douglasPeucker(straightLine, epsilon)
}

function isVertical(p1: { x: any }, p2: { x: any }, p3: { x: any }) {
  return p1.x === p2.x && p2.x === p3.x
}

function isHorizontal(p1: { y: any }, p2: { y: any }, p3: { y: any }) {
  return p1.y === p2.y && p2.y === p3.y
}

function douglasPeucker(points: string | any[], epsilon: number) {
  let dmax = 0
  let index = 0

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(
      points[i],
      points[0],
      points[points.length - 1],
    )
    if (d > dmax) {
      index = i
      dmax = d
    }
  }

  if (dmax > epsilon) {
    const left = douglasPeucker(points.slice(0, index + 1), epsilon)
    const right = douglasPeucker(points.slice(index), epsilon)

    return left.slice(0, left.length - 1).concat(right)
  }
  return [points[0], points[points.length - 1]]
}

// 每三个点如果其横坐标或者纵坐标都相同，则取其二
function getSimplePath(path: string | any[]) {
  // if (path.length < 5) return path;
  path = circleDetection(path)
  const res: NodeBase[] = []
  for (let i = 0; i < path.length; ) {
    const point1 = path[i]
    const point2 = path[i + 1]
    const point3 = path[i + 2]
    if (!point3) {
      res.push(point1)
      i++
      continue
    }
    if (
      (point1.x === point2.x && point2.x === point3.x) ||
      (point1.y === point2.y && point2.y === point3.y)
    ) {
      res.push(point1)
      res.push(point3)
      i += 3
    } else {
      res.push(point1)
      i++
    }
  }
  return res
}

// 回环检测 & 处理
function circleDetection(path: string | any[]) {
  if (path.length < 6) return path

  const res: Array<NodeBase | Point> = []
  for (let i = 0; i < path.length; ) {
    const point1 = path[i]
    const point2 = path[i + 1]
    const point4 = path[i + 3]
    const point5 = path[i + 4]
    if (!point5) {
      res.push(point1)
      i++
      continue
    }
    if (isSegmentsIntersected([point1, point2], [point4, point5])) {
      let x = 0
      let y = 0
      if (point1.x === point2.x) {
        x = point1.x
        y = point4.y
      } else {
        x = point4.x
        y = point1.y
      }
      res.push({
        x,
        y,
      })
      res.push(point5)
      i += 4
      continue
    }
    res.push(point1)
    i++
  }
  return res
}

export function getOrient(start: NodeBase, end: NodeBase) {
  const { x: x1, y: y1 } = start
  const { x: x2, y: y2 } = end
  let prefix = ''
  let suffix = ''
  if (x1 >= x2) {
    prefix = 'left'
  } else {
    prefix = 'right'
  }
  if (y1 >= y2) {
    suffix = 'top'
  } else {
    suffix = 'bottom'
  }
  return `${prefix}:${suffix}`
}

export function ManhattanLayout(
  startAnchor: any,
  endAnchor: any,
  startNode: { bbox: any },
  endNode: { bbox: any },
  // obstacles,
  offset: any,
) {
  // get expanded bbox
  const { bbox: startBBox } = startNode
  const { bbox: endBBox } = endNode
  const startExpandBBox = expandBBox(startNode.bbox, offset)
  const endExpandBBox = expandBBox(endNode.bbox, offset)
  // get points from bbox border
  const points1 = getPointsFromBBoxBorder(startExpandBBox)
  const points2 = getPointsFromBBoxBorder(endExpandBBox)
  // is bbox overlap
  // const overlap = isBBoxOverlap(startBBox, endBBox);
  const outsideBBox = getHull([...points1, ...points2])

  const sNode = getAnchorWithOffset(startNode, startAnchor, offset)
  const eNode = getAnchorWithOffset(endNode, endAnchor, offset)

  const sNodeBase = new NodeBase(sNode!.x, sNode!.y)
  const eNodeBase = new NodeBase(eNode!.x, eNode!.y)

  const path = aStarFindPathByGrid(
    eNodeBase,
    sNodeBase,
    10,
    // obstacles,
    [startBBox, endBBox],
    // [startExpandBBox, endExpandBBox],
    outsideBBox,
  )

  if (path) {
    const simplifiedPath = perpendicularToStraight(path)

    return getSimplePath([endAnchor, ...simplifiedPath, startAnchor].reverse())
  }
}
