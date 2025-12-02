import LogicFlow from '../LogicFlow'
import PointTuple = LogicFlow.PointTuple
import Point = LogicFlow.Point

export function snapToGrid(point: number, gridSize: number, snapGrid: boolean) {
  // 开启节网格对齐时才根据网格尺寸校准坐标
  if (!snapGrid) return point
  // 保证 x, y 的值为 gridSize 的整数倍
  return gridSize * Math.round(point / gridSize) || point
}

// 获取节点偏移时，产生的偏移量。当节点基于gridSize进行了偏移后，
// 节点上的文本可以基于此方法移动对应的距离来保持与节点相对位置不变。
export function getGridOffset(distance: number, gridSize: number) {
  return distance % gridSize
}

/**
 * 多边形设置 points 后，坐标平移至原点 并 根据 width、height 缩放
 * @param points
 * @param width
 * @param height
 */
export function normalizePolygon(
  points?: PointTuple[],
  width?: number,
  height?: number,
): PointTuple[] {
  if (!points) return []

  // 计算边界框
  const minX = Math.min(...points.map((p) => p[0]))
  const maxX = Math.max(...points.map((p) => p[0]))
  const minY = Math.min(...points.map((p) => p[1]))
  const maxY = Math.max(...points.map((p) => p[1]))

  // 平移至原点
  const dx = -minX
  const dy = -minY
  const translatedPoints: PointTuple[] = points.map(([x, y]) => [
    x + dx,
    y + dy,
  ])

  // 计算边界框的宽度和高度
  const bboxWidth = maxX - minX
  const bboxHeight = maxY - minY

  // 计算缩放因子
  const scaleX = width ? width / bboxWidth : 1
  const scaleY = height ? height / bboxHeight : 1
  const scaleFactor = Math.min(scaleX, scaleY)

  // 缩放顶点
  return translatedPoints.map(([x, y]) => [x * scaleFactor, y * scaleFactor])
}

/**
 * 通用圆角生成：为菱形、多边形、折线在转折处生成与矩形视觉一致的圆角
 * - 圆角基于角平分线，切点距顶点的距离 t = r * tan(theta/2)
 * - 半径会根据相邻边长度进行钳制，避免超过边长造成断裂
 * - 多边形/菱形保持闭合；折线保持开口
 */

export const generateRoundedCorners = (
  points: Point[],
  radius: number,
  isClosedShape: boolean, // 是否是闭合图形
): Point[] => {
  const n = points.length
  if (n < 2 || radius <= 0) return points.slice()

  const toVec = (a: Point, b: Point) => ({ x: b.x - a.x, y: b.y - a.y })
  const len = (v: { x: number; y: number }) => Math.hypot(v.x, v.y)
  const norm = (v: { x: number; y: number }) => {
    const l = len(v) || 1
    return { x: v.x / l, y: v.y / l }
  }

  const result: Point[] = []

  // 用二次贝塞尔近似圆角，控制点取角点，避免复杂圆心计算
  const makeRoundCorner = (prev: Point, curr: Point, next: Point): Point[] => {
    const vPrev = toVec(curr, prev)
    const vNext = toVec(curr, next)
    const dPrev = len(vPrev)
    const dNext = len(vNext)
    if (dPrev < 1e-6 || dNext < 1e-6) return [curr]

    const uPrev = norm(vPrev)
    const uNext = norm(vNext)
    const t = Math.min(radius, dPrev * 0.45, dNext * 0.45)

    const start = { x: curr.x + uPrev.x * t, y: curr.y + uPrev.y * t }
    const end = { x: curr.x + uNext.x * t, y: curr.y + uNext.y * t }

    // 二次贝塞尔采样：B(s) = (1-s)^2*start + 2(1-s)s*curr + s^2*end
    const steps = 10 // 3段近似，简洁且效果稳定
    const pts: Point[] = [start]
    for (let k = 1; k < steps; k++) {
      const s = k / steps
      const a = 1 - s
      pts.push({
        x: a * a * start.x + 2 * a * s * curr.x + s * s * end.x,
        y: a * a * start.y + 2 * a * s * curr.y + s * s * end.y,
      })
    }
    pts.push(end)
    return pts
  }

  for (let i = 0; i < n; i++) {
    const prevIdx = i === 0 ? (isClosedShape ? n - 1 : 0) : i - 1
    const nextIdx = i === n - 1 ? (isClosedShape ? 0 : n - 1) : i + 1
    const prev = points[prevIdx]
    const curr = points[i]
    const next = points[nextIdx]

    const isEndpoint = !isClosedShape && (i === 0 || i === n - 1)
    if (isEndpoint) {
      // 折线两端不处理圆角
      result.push(curr)
    } else {
      const arc = makeRoundCorner(prev, curr, next)
      arc.forEach((p) => result.push(p))
    }
  }

  // 去重处理：避免连续重复点
  const dedup: Point[] = []
  for (let i = 0; i < result.length; i++) {
    const p = result[i]
    if (
      dedup.length === 0 ||
      Math.hypot(
        p.x - dedup[dedup.length - 1].x,
        p.y - dedup[dedup.length - 1].y,
      ) > 1e-6
    ) {
      dedup.push(p)
    }
  }

  // 闭合图形：确保首尾不重复闭合
  if (isClosedShape && dedup.length > 1) {
    const first = dedup[0]
    const last = dedup[dedup.length - 1]
    if (Math.hypot(first.x - last.x, first.y - last.y) < 1e-6) {
      dedup.pop()
    }
  }

  return dedup
}
