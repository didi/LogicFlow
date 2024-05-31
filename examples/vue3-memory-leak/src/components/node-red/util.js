/* 求字符串的字节长度 */
export const getBytesLength = (word) => {
  if (!word) {
    return 0
  }
  let totalLength = 0
  for (let i = 0; i < word.length; i++) {
    const c = word.charCodeAt(i)
    if (word.match(/[A-Z]/)) {
      totalLength += 1.5
    } else if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
      totalLength += 1
    } else {
      totalLength += 1.8
    }
  }
  return totalLength
}
