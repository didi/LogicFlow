/**
 * 获取随机整数 [min, max]
 * @param min
 * @param max
 * @returns
 */
export const getRandom = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
