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
 * @param bounds
 * @param group
 */
export function isAllowMoveTo(bounds: BoxBoundsPoint, group: BaseNodeModel) {
  const { minX, minY, maxX, maxY } = bounds
  const { x, y, width, height } = group

  return {
    x: minX >= x - width / 2 && maxX <= x + width / 2,
    y: minY >= y - height / 2 && maxY <= y + height / 2,
  }
}
