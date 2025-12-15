export function computeBaseHeight(
  measuredHeight: number,
  _showTitle?: boolean,
  _titleHeight?: number,
) {
  const extra = _showTitle
    ? typeof _titleHeight === 'number'
      ? _titleHeight
      : 28
    : 0
  return Math.max(1, Math.round(measuredHeight) - extra)
}

export function shouldUpdateSize(
  prevW?: number,
  prevH?: number,
  w?: number,
  h?: number,
) {
  if (!w || !h) return false
  return !(prevW === Math.round(w) && prevH === Math.round(h))
}
