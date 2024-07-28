import LogicFlow from '@logicflow/core'

import Position = LogicFlow.Position

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
  point: Position,
): Position {
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
  target: Position,
  center: Position,
  radian: number,
): Position {
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
