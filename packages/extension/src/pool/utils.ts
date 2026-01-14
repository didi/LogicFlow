import { BaseNodeModel, Model } from '@logicflow/core'
import BoxBoundsPoint = Model.BoxBoundsPoint

/**
 *
 * @param bounds
 * @param group
 */
export function isBoundsInGroup(bounds: BoxBoundsPoint, group: BaseNodeModel) {
  const { minX, minY, maxX, maxY } = bounds
  const { x, y, width, height } = group
  return (
    minX >= x - width / 2 &&
    maxX <= x + width / 2 &&
    minY >= y - height / 2 &&
    maxY <= y + height / 2
  )
}

/**
 * 判断 bounds 是否可以移动到下一个范围
 * @param groupBounds
 * @param node
 * @param deltaX
 * @param deltaY
 */
export function isAllowMoveTo(
  groupBounds: BoxBoundsPoint,
  node: BaseNodeModel,
  deltaX: number,
  deltaY: number,
) {
  const { minX, minY, maxX, maxY } = groupBounds
  const { x, y, width, height } = node

  // DONE: 计算节点坐标 (x, y) 可移动的范围，并判断 x + deltaX, y + deltaY 是否在范围内
  const allowMoveMinX = minX + width / 2
  const allowMoveMinY = minY + height / 2
  const allowMoveMaxX = maxX - width / 2
  const allowMoveMaxY = maxY - height / 2

  return {
    x: x + deltaX >= allowMoveMinX && x + deltaX <= allowMoveMaxX,
    y: y + deltaY >= allowMoveMinY && y + deltaY <= allowMoveMaxY,
  }
}
