export function snapToGrid(distance: number, gridSize: number) {
  // 保证 x, y 的值为 gridSize 的整数倍
  return gridSize * Math.round(distance / gridSize) || distance;
}
// 获取节点偏移是，产生的偏移量。当节点基于gridSize进行了偏移后，
// 节点上的文本可以基于此方法移动对应的距离来保持与节点相对位置不变。
export function getGridOffset(distance: number, gridSize: number) {
  return distance % gridSize;
}
