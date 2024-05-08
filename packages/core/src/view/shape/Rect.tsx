import LogicFlow from '../../LogicFlow'

import Point = LogicFlow.Point
import RectSize = LogicFlow.RectSize

type IRectProps = {
  className?: string
  radius?: number
} & Point &
  RectSize

export function Rect(props: IRectProps) {
  const { x, y, width, height, className, radius } = props

  const leftTopX = x - width / 2
  const leftTopY = y - height / 2
  const attrs: Record<string, any> = {}
  Object.entries(props).forEach(([k, v]) => {
    const valueType = typeof v
    if (valueType !== 'object') {
      attrs[k] = v
    }
  })

  if (className) {
    attrs.className = `lf-basic-shape ${className}`
  } else {
    attrs.className = 'lf-shape'
  }
  if (radius) {
    attrs.rx = radius
    attrs.ry = radius
  }
  attrs.x = leftTopX
  attrs.y = leftTopY
  return <rect {...attrs} />
}

Rect.defaultProps = {
  className: '',
  radius: '',
}

export default Rect
