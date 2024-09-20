import LogicFlow from '..'
import { EditConfigModel } from '..'

import PointTuple = LogicFlow.PointTuple

/**
 * 判断一个点是否在指定区域
 * @param point 当前点
 * @param leftTopPoint 区域左上角点
 * @param rightBottomPoint 区域的右下角点
 */
export const isPointInArea = (
  [x, y]: PointTuple,
  [leftTopX, leftTopY]: PointTuple,
  [rightBottomX, rightBottomY]: PointTuple,
): boolean =>
  x > leftTopX && x < rightBottomX && y > leftTopY && y < rightBottomY

/**
 * 判断鼠标点击选中元素的时候，是否为多选
 */
export const isMultipleSelect = (
  e: MouseEvent,
  editConfigModel: EditConfigModel,
): boolean => {
  const { multipleSelectKey } = editConfigModel
  let isMultiple = false
  switch (multipleSelectKey) {
    case 'meta':
      isMultiple = e.metaKey
      break
    case 'alt':
      isMultiple = e.altKey
      break
    case 'shift':
      isMultiple = e.shiftKey
      break
    case 'ctrl':
      isMultiple = e.ctrlKey // Mac上ctrl + 点击节点会触发上下文菜单，所以ctrl尽量用在非Mac系统
      break
    default:
      isMultiple = false
      break
  }
  return isMultiple
}
