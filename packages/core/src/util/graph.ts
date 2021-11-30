export const getById = (id, data) => {
  let result;
  for (let i = 0; i < data.length; i++) {
    if (data[i].id === id) {
      result = data[i];
    }
  }
  return result;
};

/**
 * 判断一个点是否在指定区域
 * @param point 当前点
 * @param leftTopPoint 区域左上角点
 * @param rightBottomPoint 区域的右下角点
 */
export const isPointInArea = (
  [x, y], [leftTopX, leftTopY], [rightBottomX, rightBottomY],
): boolean => (x > leftTopX && x < rightBottomX && y > leftTopY && y < rightBottomY);

/**
 * 判断鼠标点击选中元素的时候，是否为多选
 */
export const isMultipleSelect = (e: MouseEvent, editConfig): boolean => {
  const { multipleSelectKey, metaKeyMultipleSelected } = editConfig;
  // todo: 兼容最早的metaKeyMultipleSelected配置方式。1.0版本考虑去掉
  if (metaKeyMultipleSelected && e.metaKey) return true;
  let isMultiple = false;
  switch (multipleSelectKey) {
    case 'meta':
      isMultiple = e.metaKey;
      break;
    case 'alt':
      isMultiple = e.altKey;
      break;
    case 'shift':
      isMultiple = e.shiftKey;
      break;
    default:
      isMultiple = false;
      break;
  }
  return isMultiple;
};
