import LogicFlow, { h, PolylineEdge, PolylineEdgeModel } from '@logicflow/core'

class CustomAnimateEdge extends PolylineEdge {
  // 重写 getEdge 方法，定义边的渲染
  getEdge() {
    const { model } = this.props
    const { points, arrowConfig } = model
    const style = model.getEdgeStyle()
    const animationStyle = model.getEdgeAnimationStyle()
    const {
      strokeDasharray,
      strokeDashoffset,
      animationName,
      animationDuration,
      animationIterationCount,
      animationTimingFunction,
      animationDirection,
    } = animationStyle

    return h('g', {}, [
      h(
        'linearGradient',
        {
          id: 'linearGradient-1',
          x1: '0%',
          y1: '0%',
          x2: '100%',
          y2: '100%',
          spreadMethod: 'repeat',
        },
        [
          h('stop', {
            offset: '0%',
            stopColor: '#36bbce',
          }),
          h('stop', {
            offset: '100%',
            stopColor: '#e6399b',
          }),
        ],
      ),
      h('defs', {}, [
        h(
          'filter',
          {
            id: 'filter-1',
            x: '-0.2',
            y: '-0.2',
            width: '200%',
            height: '200%',
          },
          [
            h('feOffset', {
              result: 'offOut',
              in: 'SourceGraphic',
              dx: 0,
              dy: 10,
            }),
            h('feGaussianBlur', {
              result: 'blurOut',
              in: 'offOut',
              stdDeviation: 10,
            }),
            h('feBlend', {
              mode: 'normal',
              in: 'SourceGraphic',
              in2: 'blurOut',
            }),
          ],
        ),
      ]),
      h('polyline', {
        points,
        ...style,
        ...arrowConfig,
        strokeDasharray,
        stroke: 'url(#linearGradient-1)',
        filter: 'url(#filter-1)',
        fill: 'none',
        strokeLinecap: 'round',
        style: {
          strokeDashoffset: strokeDashoffset,
          animationName,
          animationDuration,
          animationIterationCount,
          animationTimingFunction,
          animationDirection,
        },
      }),
    ])
  }
}

class CustomAnimateEdgeModel extends PolylineEdgeModel {
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
  getEdgeAnimationStyle() {
    const style = super.getEdgeAnimationStyle()
    style.strokeDasharray = '40 160'
    style.animationDuration = '10s'
    style.stroke = 'rgb(130, 179, 102)'
    return style
  }
}

export default {
  type: 'customAnimatePolyline',
  model: CustomAnimateEdgeModel,
  view: CustomAnimateEdge,
}
