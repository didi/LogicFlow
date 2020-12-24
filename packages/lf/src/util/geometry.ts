export function snapToGrid(distance: number, gridSize: number) {
  // 保证 x, y 的值为 gridSize 的整数倍
  return gridSize * Math.round(distance / gridSize) || distance;
}
