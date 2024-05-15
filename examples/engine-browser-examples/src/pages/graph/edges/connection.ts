import LogicFlow, { h, PolylineEdge, PolylineEdgeModel } from '@logicflow/core'
import ArrowConfig = LogicFlow.ArrowConfig

class ConnectionView extends PolylineEdge {
  getAdjustPointShape(x: number, y: number): h.JSX.Element {
    return h('g', {}, [
      h('image', {
        x: x - 9,
        y: y - 9,
        width: 18,
        height: 18,
        cursor: 'move',
        href: 'data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMnB4IiBoZWlnaHQ9IjIycHgiIHZlcnNpb249IjEuMSI+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iNyIgc3Ryb2tlPSIjZmZmIiBmaWxsPSIjMjliNmYyIi8+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iMyIgc3Ryb2tlPSIjZmZmIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjwvc3ZnPg==',
      }),
    ])
  }

  getTextStyle() {
    return {
      background: {
        fill: 'white',
        height: 20,
        stroke: 'transparent',
        radius: 0,
      },
    }
  }

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

class ConnectionModel extends PolylineEdgeModel {
  setAttributes() {
    this.textWidth = 200
    const { properties } = this
    if (properties.isActived) {
      this.stroke = 'red'
    }
    if (properties.arrow) {
      this.arrowConfig.markerEnd = (properties.arrow as ArrowConfig).markerEnd // TODO: 定义 properties 类型
    }
  }

  getArrowStyle() {
    const style = super.getArrowStyle()
    style.stroke = 'green'
    return style
  }
}

export default {
  type: 'connection',
  view: ConnectionView,
  model: ConnectionModel,
}
