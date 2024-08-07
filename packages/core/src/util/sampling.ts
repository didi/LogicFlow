import { distance } from './node'
import LogicFlow from '../LogicFlow'

import Point = LogicFlow.Point
import Vector = LogicFlow.Vector

const SAMPLING_FREQUENCY = 100
const normal: Vector = {
  x: 1,
  y: 0,
  z: 0,
}

// 采样三次贝塞尔曲线上的点, 假设采样频率为SAMPLING_FREQUENCY, 取倒数第1-6/SAMPLING_FREQUENCY个点即t=1-6/SAMPLING_FREQUENCY
export function sampleCubic(
  p1: Point,
  cp1: Point,
  cp2: Point,
  p2: Point,
  offset: number,
) {
  const program = (t: number) => {
    if (t < 0 || t > 1) {
      throw new RangeError('The value range of parameter "t" is [0,1]')
    }
    return {
      x:
        p1.x * (1 - t) ** 3 +
        3 * cp1.x * t * (1 - t) ** 2 +
        3 * cp2.x * t ** 2 * (1 - t) +
        p2.x * t ** 3,
      y:
        p1.y * (1 - t) ** 3 +
        3 * cp1.y * t * (1 - t) ** 2 +
        3 * cp2.y * t ** 2 * (1 - t) +
        p2.y * t ** 3,
    }
  }
  // fix: https://github.com/didi/LogicFlow/issues/951
  // 计算贝塞尔曲线上与终点距离为offset的点，作为箭头的的垂点。
  let arrowDistance = 0
  let t = 2
  const { x: x1, y: y1 } = p2
  let point = p2
  while (arrowDistance < offset && t < 50) {
    point = program(1 - t / SAMPLING_FREQUENCY)
    const { x: x2, y: y2 } = point
    arrowDistance = distance(x1, y1, x2, y2)
    t++
  }
  return point
}

function crossByZ(v: Vector, v1: Vector) {
  return v.x * v1.y - v.y * v1.x
}

function dot(v: Vector, w: Vector) {
  const v1 = [v.x, v.y, v.z]
  const v2 = [w.x, w.y, w.z]
  return v2.reduce((prev, cur, index) => prev + cur * v1[index])
}

function angle(v1: Vector, v2: Vector) {
  const negative = crossByZ(v1, v2)
  const r = Math.acos(dot(normalize(v1), normalize(v2)))
  return negative >= 0 ? r : -r
}

function normalize(v: Vector): Vector {
  const len = Math.hypot(v.x, v.y)
  return {
    x: v.x / len,
    y: v.y / len,
    z: 0,
  }
}

export function getThetaOfVector(v: Vector) {
  return angle(normal, v)
}

export function degrees(radians: number) {
  return radians * (180 / Math.PI)
}
