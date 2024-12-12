import LogicFlow from '../LogicFlow'
import PointTuple = LogicFlow.PointTuple

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
