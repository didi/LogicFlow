import LogicFlow from '@logicflow/core'

const theme: Partial<LogicFlow.Theme> = {
  baseNode: {
    fill: 'rgb(255, 230, 204)',
    stroke: '#00796b',
    strokeDasharray: '3,3',
  },
  rect: {
    fill: '#FFFFFF',
    strokeDasharray: '10, 1',
    className: 'custom-cls',
    radius: 30,
  },
  circle: {
    r: 10,
    fill: '#9a9b9c',
  },
  diamond: {
    fill: '#238899',
  },
  ellipse: {
    strokeWidth: 3,
  },
  polygon: {
    strokeDasharray: 'none',
  },
  anchor: {
    r: 3,
    fill: '#9a9312',
    hover: {
      fill: '#d84315',
    },
  },
  nodeText: {
    fontSize: 16,
    color: '#d84315',
    overflowMode: 'autoWrap',
  },
  baseEdge: {
    strokeWidth: 1,
    strokeDasharray: '3,3',
  },
  edgeText: {
    fontSize: 12,
    textWidth: 60,
    overflowMode: 'autoWrap',
    background: {
      fill: '#919810',
    },
  },
  polyline: {
    offset: 20,
    strokeDasharray: 'none',
    strokeWidth: 2,
  },
  bezier: {
    stroke: '#d84315',
    adjustLine: {
      strokeWidth: 2,
      stroke: '#d84315',
    },
    adjustAnchor: {
      stroke: 'blue',
      fill: '#00796b',
    },
  },
  arrow: {
    offset: 10, // 箭头长度
    verticalLength: 3, // 箭头垂直于边的距离
    fill: 'none',
    stroke: '#00796b',
  },
  anchorLine: {
    stroke: '#d84315',
  },
  snapline: {
    stroke: '#d84315',
  },
  edgeAdjust: {
    r: 10,
  },
  outline: {
    stroke: '#d84315',
    hover: {
      stroke: '#00796b',
    },
  },
}

export default theme
