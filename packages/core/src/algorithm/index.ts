// 各类算法的实现
export * from './outline'
export * from './edge'

/*
 * 计算垂直边的与起始点有一定距离对称，边垂直于边的点
 * 调用方：计算箭头位置，计算扩大变得点击区域
 */
export const getVerticalPointOfLine = (config) => {
  /*
   ** offset: 端点到垂直点的距离
   ** verticalLength: 两边点到垂直点的距离
   ** type: 标识求的是线段的开始端点/结束端点
   */
  const { start, end, offset, verticalLength, type } = config
  const pointPosition = {
    leftX: 0,
    leftY: 0,
    rightX: 0,
    rightY: 0,
  }
  // // 边与水平线的夹角
  const angleOfHorizontal = Math.atan((end.y - start.y) / (end.x - start.x))
  // 边和两边点的夹角
  const angleOfPoints = Math.atan(offset / verticalLength)
  // 点到起点的距离
  const len = Math.sqrt(verticalLength * verticalLength + offset * offset)
  if (type === 'start') {
    if (end.x >= start.x) {
      pointPosition.leftX =
        start.x + len * Math.sin(angleOfHorizontal + angleOfPoints)
      pointPosition.leftY =
        start.y - len * Math.cos(angleOfHorizontal + angleOfPoints)
      pointPosition.rightX =
        start.x - len * Math.sin(angleOfHorizontal - angleOfPoints)
      pointPosition.rightY =
        start.y + len * Math.cos(angleOfHorizontal - angleOfPoints)
    } else {
      pointPosition.leftX =
        start.x - len * Math.sin(angleOfHorizontal + angleOfPoints)
      pointPosition.leftY =
        start.y + len * Math.cos(angleOfHorizontal + angleOfPoints)
      pointPosition.rightX =
        start.x + len * Math.sin(angleOfHorizontal - angleOfPoints)
      pointPosition.rightY =
        start.y - len * Math.cos(angleOfHorizontal - angleOfPoints)
    }
  } else if (type === 'end') {
    if (end.x >= start.x) {
      pointPosition.leftX =
        end.x + len * Math.sin(angleOfHorizontal - angleOfPoints)
      pointPosition.leftY =
        end.y - len * Math.cos(angleOfHorizontal - angleOfPoints)
      pointPosition.rightX =
        end.x - len * Math.sin(angleOfHorizontal + angleOfPoints)
      pointPosition.rightY =
        end.y + len * Math.cos(angleOfHorizontal + angleOfPoints)
    } else {
      pointPosition.leftX =
        end.x - len * Math.sin(angleOfHorizontal - angleOfPoints)
      pointPosition.leftY =
        end.y + len * Math.cos(angleOfHorizontal - angleOfPoints)
      pointPosition.rightX =
        end.x + len * Math.sin(angleOfHorizontal + angleOfPoints)
      pointPosition.rightY =
        end.y - len * Math.cos(angleOfHorizontal + angleOfPoints)
    }
  }
  return pointPosition
}
