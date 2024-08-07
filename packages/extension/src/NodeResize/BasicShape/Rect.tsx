import LogicFlow from '@logicflow/core'

import Point = LogicFlow.Point
import RectSize = LogicFlow.RectSize

type IProps = {
  className?: string
  radius?: number
  stroke?: string
  strokeDasharray?: string
} & Point &
  RectSize

export default function Rect(props: IProps) {
  const { x, y, width = 10, height = 10, radius, className } = props

  const leftTopX = x - width / 2
  const leftTopY = y - height / 2

  const attrs = {
    // default
    cx: 0,
    cy: 0,
    rx: radius || 0,
    ry: radius || 0,
    fill: 'transparent',
    fillOpacity: 1,
    strokeWidth: '1px',
    stroke: '#000',
    strokeOpacity: 1,
    className: `lf-basic-shape ${className}`,
    ...props,
    x: leftTopX,
    y: leftTopY,
  }
  return <rect {...attrs} />
}

Rect.defaultProps = {
  radius: 0,
  stroke: '',
  strokeDasharray: '',
  className: '',
}
