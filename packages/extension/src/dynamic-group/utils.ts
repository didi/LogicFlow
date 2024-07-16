import { BaseNodeModel, Model } from '@logicflow/core'
import BoxBoundsPoint = Model.BoxBoundsPoint

/**
 *
 * @param bounds
 * @param group
 */
export function isBoundsInGroup(bounds: BoxBoundsPoint, group: BaseNodeModel) {
  const { x1, y1, x2, y2 } = bounds
  const { x, y, width, height } = group
  return (
    x1 >= x - width / 2 &&
    x2 <= x + width / 2 &&
    y1 >= y - height / 2 &&
    y2 <= y + height / 2
  )
}

/**
 * 判断 bounds 是否可以移动到下一个范围
 * @param bounds
 * @param group
 */
export function isAllowMoveTo(bounds: BoxBoundsPoint, group: BaseNodeModel) {
  const { x1, y1, x2, y2 } = bounds
  const { x, y, width, height } = group

  return {
    x: x1 >= x - width / 2 && x2 <= x + width / 2,
    y: y1 >= y - height / 2 && y2 <= y + height / 2,
  }
}
