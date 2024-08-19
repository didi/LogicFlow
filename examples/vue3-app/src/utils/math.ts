/**
 * 获取随机整数 [min, max],不包含 [excludemMin, excludeMax]
 * @param min
 * @param max
 * @returns
 */
export const getRandom = (min: number, max: number, excludemMin?: number, excludeMax?: number) => {
  let res = Math.floor(Math.random() * (max - min + 1) + min)

  if (
    excludemMin !== undefined &&
    excludeMax !== undefined &&
    res >= excludemMin &&
    res <= excludeMax
  ) {
    res = getRandom(min, max, excludemMin, excludeMax)
  }

  return res
}
