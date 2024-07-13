import LogicFlow, { h, PolylineEdge, PolylineEdgeModel } from '@logicflow/core'

class CustomPolyline extends PolylineEdge {
  // 自定义边箭头
  // 在自定义连线 view 的时候，可以重写getEndArrow和getStartArrow方法来实现自定义连线两端的图形，这两个方法可以返回的任意svg图形。
  // 这里以通过连线properties属性中的 arrowType 来控制连线不同的外观为例。
  getEndArrow() {
    const { model } = this.props
    const {
      properties: { arrowType },
    } = model
    const { stroke, strokeWidth } = model.getArrowStyle()
    const pathAttr = {
      stroke,
      strokeWidth,
    }
    // 空心箭头
    if (arrowType === 'empty') {
      return h('path', {
        ...pathAttr,
        fill: '#FFF',
        d: 'M -10 0  -20 -5 -30 0 -20 5 z',
      })
    } else if (arrowType === 'half') {
      // 半箭头
      return h('path', {
        ...pathAttr,
        d: 'M 0 0 -10 5',
      })
    }
    return h('path', {
      ...pathAttr,
      fill: stroke,
      d: 'M 0 0 -10 -5 -10 5 z',
    })
  }
}

class CustomPolylineModel extends PolylineEdgeModel {
  initEdgeData(data: LogicFlow.EdgeConfig) {
    super.initEdgeData(data)
    this.customTextPosition = true
  }
  // 自定义边文本位置
  getTextPosition(): LogicFlow.Point {
    const { textPosition = 'center' } = this.properties
    const position = super.getTextPosition()
    const currentPositionList = this.points.split(' ')
    const pointsList: LogicFlow.Position[] = []
    currentPositionList &&
      currentPositionList.forEach((item) => {
        const [x, y] = item.split(',')
        pointsList.push({ x: Number(x), y: Number(y) })
      })
    if (textPosition === 'center') {
      return position
    }
    if (textPosition === 'start') {
      if (pointsList.length > 1) {
        const { x: x1, y: y1 } = pointsList[0]
        const { x: x2, y: y2 } = pointsList[1]
        let distance = 50
        if (x1 === x2) {
          // 垂直
          if (y2 < y1) {
            distance = -50
          }
          position.y = y1 + distance
          position.x = x1
        } else {
          if (x2 < x1) {
            distance = -50
          }
          position.x = x1 + distance
          position.y = y1 - 10
        }
      }
      return position
    }
    if (textPosition === 'end') {
      if (pointsList.length > 1) {
        const { x: x1, y: y1 } = pointsList[pointsList.length - 2]
        const { x: x2, y: y2 } = pointsList[pointsList.length - 1]
        let distance = 50
        if (x1 === x2) {
          // 垂直
          if (y2 > y1) {
            distance = -50
          }
          position.y = y2 + distance
          position.x = x2
        } else {
          if (x2 < x1) {
            distance = -50
          }
          position.x = x2 - distance
          position.y = y2 - 10
        }
      }
      return position
    }
    return position
  }
  // 自定义动画
  setAttributes() {
    const { openAnimation } = this.properties
    this.isAnimation = !!openAnimation
  }
  // 自定义动画
  getEdgeAnimationStyle() {
    const style = super.getEdgeAnimationStyle()
    style.strokeDasharray = '15 5'
    style.animationDuration = '10s'
    style.stroke = 'rgb(130, 179, 102)'
    return style
  }
  // 自定义边样式：颜色、宽度、线段类型等
  getEdgeStyle() {
    const style = super.getEdgeStyle()
    const { edgeWeight, highlight } = this.properties
    style.strokeWidth = edgeWeight ? 5 : 3
    style.stroke = highlight ? 'red' : 'black'
    return style
  }
}

export default {
  type: 'customPolyline',
  model: CustomPolylineModel,
  view: CustomPolyline,
}
