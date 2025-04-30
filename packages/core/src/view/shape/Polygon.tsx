import { createElement as h } from 'preact/compat'
import { forEach, toPairs } from 'lodash-es'
import { LogicFlow } from '../..'

export type IPolygonProps = {
  points: LogicFlow.PointTuple[]
  x?: number
  y?: number
  className?: string
  radius?: number
}
/**
 * 生成带圆角的多边形路径
 * @param points 多边形顶点坐标数组
 * @param radius 圆角半径
 * @returns SVG 路径字符串
 */
export function createRoundedPolygonPath(points, radius): string {
  const pointList = points.map((point) => ({ x: point[0], y: point[1] }))
  const len = pointList.length
  if (len < 3) return ''

  const r = Math.abs(radius)
  let path = ''

  for (let i = 0; i < len; i++) {
    const prev = pointList[(i - 1 + len) % len]
    const curr = pointList[i]
    const next = pointList[(i + 1) % len]

    // 向量
    const v1 = { x: curr.x - prev.x, y: curr.y - prev.y }
    const v2 = { x: next.x - curr.x, y: next.y - curr.y }

    // 单位向量
    const len1 = Math.hypot(v1.x, v1.y)
    const len2 = Math.hypot(v2.x, v2.y)
    const u1 = { x: v1.x / len1, y: v1.y / len1 }
    const u2 = { x: v2.x / len2, y: v2.y / len2 }

    // 起点 = curr - u1 * r，终点 = curr + u2 * r
    const start = { x: curr.x - u1.x * r, y: curr.y - u1.y * r }
    const end = { x: curr.x + u2.x * r, y: curr.y + u2.y * r }

    if (i === 0) {
      path += `M ${start.x} ${start.y} `
    } else {
      path += `L ${start.x} ${start.y} `
    }

    // Q 控制点是当前拐角点
    path += `Q ${curr.x} ${curr.y} ${end.x} ${end.y} `
  }

  path += 'Z'
  return path
}

export function Polygon(props: IPolygonProps): h.JSX.Element {
  const { points = [], className, radius } = props
  const attrs: Record<string, any> = {
    fill: 'transparent',
    fillOpacity: 1,
    strokeWidth: 1,
    stroke: '#000',
    strokeOpacity: 1,
    points: '',
  }

  forEach(toPairs(props), ([k, v]: [k: string, v: any]) => {
    if (typeof v !== 'object') {
      attrs[k] = v
    }
  })

  if (className) {
    attrs.classNmae = `lf-basic-shape ${className}`
  } else {
    attrs.className = 'lf-basic-shape'
  }
  if (radius) {
    const path = createRoundedPolygonPath(points, radius)
    attrs.d = path
    return <path {...attrs} />
  } else {
    attrs.points = points.map((point) => point.join(',')).join(' ')
    return <polygon {...attrs} />
  }
}

export default Polygon
