import LogicFlow from '../LogicFlow'
import { DEFAULT_GRID_SIZE } from './index'

export const defaultTheme: LogicFlow.Theme = {
  baseNode: {
    fill: '#fff',
    stroke: '#474747',
    strokeWidth: 2,
    radius: 12,
  },
  baseEdge: {
    stroke: '#474747',
    strokeWidth: 2,
    radius: 12,
  },
  rect: {
    shadow: {
      dx: 0,
      dy: 0,
      stdDeviation: 4,
      floodColor: '#9CA1AA55',
    },
  },
  circle: {},
  diamond: {},
  ellipse: {},
  polygon: {},
  html: {
    fill: '#fff',
    stroke: 'transparent',
    shadow: {
      dx: 0,
      dy: 0,
      stdDeviation: 4,
      floodColor: '#9CA1AA55',
    },
  },
  text: {
    color: '#474747',
    stroke: 'none',
    fontSize: 12,
    background: {
      fill: 'transparent',
    },
  },
  nodeText: {
    color: '#474747',
    overflowMode: 'default',
    fontSize: 12,
    lineHeight: 1.2,
  },
  anchor: {
    stroke: '#474747',
    fill: '#fff',
    r: 4,
    hover: {
      r: 8,
      fill: '#707070',
      fillOpacity: 0.15,
      stroke: 'transparent',
    },
  },
  anchorLine: {
    stroke: '#474747',
    strokeWidth: 2,
    strokeDasharray: '3,2',
  },
  line: {},
  polyline: {},
  bezier: {
    fill: 'none',
    adjustLine: {
      stroke: '#949494',
    },
    adjustAnchor: {
      r: 4,
      fill: '#949494',
      fillOpacity: 1,
      stroke: '#949494',
    },
  },
  edgeText: {
    textWidth: 100,
    overflowMode: 'default',
    fontSize: 12,
    background: {
      fill: '#fff',
    },
  },
  arrow: {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    offset: 10,
    verticalLength: 5, // 箭头垂直于边的距离
  },
  snapline: {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    stroke: '#AAAAAA',
    strokeWidth: 1,
    strokeDasharray: '3,3',
  },
  edgeAdjust: {
    r: 4,
    fill: '#fff',
    stroke: '#474747',
    strokeWidth: 1,
  },
  outline: {
    fill: 'none',
    stroke: 'transparent', // 矩形默认不显示调整边框
    strokeWidth: 0,
  },
  edgeOutline: {
    fill: 'transparent',
    stroke: '#757575',
    strokeWidth: 1.5,
    strokeDasharray: '4,4',
    radius: 8,
    hover: {
      stroke: '#4271DF',
    },
  },
  edgeAnimation: {
    stroke: '#4271DF',
    strokeDasharray: '12,4,6,4',
    strokeDashoffset: '100%',
    animationName: 'lf_animate_dash',
    animationDuration: '20s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    animationDirection: 'normal',
  },
  rotateControl: {
    stroke: '#474747',
    fill: '#fff',
    strokeWidth: 1,
    hover: {
      fill: '#707070',
      fillOpacity: 0.15,
      stroke: 'transparent',
    },
  },
  resizeControl: {
    width: 8,
    height: 8,
    radius: 2,
    fill: '#fff',
    stroke: '#474747',
    hover: {
      width: 12,
      height: 12,
      fill: '#707070',
      fillOpacity: 0.15,
      stroke: 'transparent',
    },
  },
  resizeOutline: {
    fill: 'transparent',
    stroke: '#757575',
    strokeWidth: 1.5,
    strokeDasharray: '4,4',
    radius: 8,
    hover: {
      stroke: '#4271DF',
    },
  },
}
export const retroTheme: LogicFlow.Theme = {
  baseNode: {
    fill: '#fff',
    stroke: '#000',
    strokeWidth: 2,
  },

  baseEdge: {
    stroke: '#000',
    strokeWidth: 2,
  },

  rect: {},
  circle: {},
  diamond: {},
  ellipse: {},
  polygon: {},
  html: {},

  text: {
    color: '#000',
    stroke: 'none',
    fontSize: 12,
    background: {
      fill: 'transparent',
    },
  },

  anchor: {
    stroke: '#000',
    fill: '#fff',
    r: 4,
    hover: {
      r: 10,
      fill: '#949494',
      fillOpacity: 0.5,
      stroke: '#949494',
    },
  },

  anchorLine: {
    stroke: '#000',
    strokeWidth: 2,
    strokeDasharray: '3,2',
  },

  nodeText: {
    color: '#000',
    overflowMode: 'default',
    fontSize: 12,
    lineHeight: 1.2,
  },

  edgeText: {
    textWidth: 100,
    overflowMode: 'default',
    fontSize: 12,
    background: {
      fill: '#fff',
    },
  },

  line: {},
  polyline: {},

  bezier: {
    fill: 'none',
    adjustLine: {
      stroke: '#949494',
    },
    adjustAnchor: {
      r: 4,
      fill: '#949494',
      fillOpacity: 1,
      stroke: '#949494',
    },
  },

  arrow: {
    offset: 10,
    verticalLength: 5, // 箭头垂直于边的距离
  },

  snapline: {
    stroke: '#949494',
    strokeWidth: 1,
  },

  edgeAdjust: {
    r: 4,
    fill: '#fff',
    stroke: '#949494',
    strokeWidth: 2,
  },

  outline: {
    fill: 'transparent',
    stroke: '#949494',
    strokeDasharray: '3,3',
    hover: {
      stroke: '#949494',
    },
  },

  edgeOutline: {
    fill: 'transparent',
    stroke: '#949494',
    strokeDasharray: '3,3',
    hover: {
      stroke: '#949494',
    },
  },

  edgeAnimation: {
    stroke: 'red',
    strokeDasharray: '10,10',
    strokeDashoffset: '100%',
    animationName: 'lf_animate_dash',
    animationDuration: '20s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    animationDirection: 'normal',
  },

  rotateControl: {
    stroke: '#000',
    fill: '#fff',
    strokeWidth: 1.5,
  },

  resizeControl: {
    width: 7,
    height: 7,
    fill: '#fff',
    stroke: '#000',
  },

  resizeOutline: {
    fill: 'none',
    stroke: 'transparent', // 矩形默认不显示调整边框
    strokeWidth: 1,
    strokeDasharray: '3,3',
  },
}
export const darkTheme: LogicFlow.Theme = {
  baseNode: {
    fill: '#33353A',
    stroke: '#EAEAEA',
    strokeWidth: 2,
    radius: 12,
  },
  baseEdge: {
    stroke: '#EAEAEA',
    strokeWidth: 2,
    radius: 12,
  },
  rect: {},
  circle: {},
  diamond: {},
  ellipse: {},
  polygon: {},
  html: {
    fill: '#33353A',
    stroke: 'transparent',
    shadow: {
      dx: 0,
      dy: 0,
      stdDeviation: 4,
      floodColor: '#9CA1AA55',
    },
  },
  text: {
    color: '#EAEAEA',
    stroke: 'none',
    fontSize: 12,
    background: {
      fill: 'transparent',
    },
  },
  nodeText: {
    color: '#EAEAEA',
    overflowMode: 'default',
    fontSize: 12,
    lineHeight: 1.2,
  },
  anchor: {
    stroke: '#EAEAEA',
    fill: '#33353A',
    r: 4,
    hover: {
      r: 8,
      fill: '#707070',
      fillOpacity: 0.15,
      stroke: 'transparent',
    },
  },
  anchorLine: {
    stroke: '#EAEAEA',
    strokeWidth: 2,
    strokeDasharray: '3,2',
  },
  line: {},
  polyline: {},
  bezier: {
    fill: 'none',
    adjustLine: {
      stroke: '#EAEAEA',
    },
    adjustAnchor: {
      r: 4,
      fill: '#33353A',
      fillOpacity: 1,
      stroke: '#EAEAEA',
    },
  },
  edgeText: {
    textWidth: 100,
    overflowMode: 'default',
    fontSize: 12,
    background: {
      fill: '#EAEAEA',
    },
  },
  arrow: {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    offset: 10,
    verticalLength: 5, // 箭头垂直于边的距离
  },
  snapline: {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    stroke: '#949494',
    strokeWidth: 1,
  },
  edgeAdjust: {
    r: 4,
    fill: '#33353A',
    stroke: '#EAEAEA',
    strokeWidth: 1,
  },
  outline: {
    fill: 'none',
    stroke: 'transparent', // 矩形默认不显示调整边框
    strokeWidth: 0,
  },
  edgeOutline: {
    fill: 'transparent',
    stroke: '#EAEAEA',
    strokeWidth: 1.5,
    strokeDasharray: '4,4',
    radius: 8,
    hover: {
      stroke: '#4271DF',
    },
  },
  edgeAnimation: {
    stroke: '#4271DF',
    strokeDasharray: '12,4,6,4',
    strokeDashoffset: '100%',
    animationName: 'lf_animate_dash',
    animationDuration: '20s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    animationDirection: 'normal',
  },

  rotateControl: {
    stroke: '#EAEAEA',
    fill: '#33353A',
    strokeWidth: 1,
    hover: {
      fill: '#707070',
      fillOpacity: 0.15,
      stroke: 'transparent',
    },
  },

  resizeControl: {
    width: 8,
    height: 8,
    radius: 2,
    fill: '#33353A',
    stroke: '#EAEAEA',
    hover: {
      width: 12,
      height: 12,
      fill: '#707070',
      fillOpacity: 0.15,
      stroke: 'transparent',
    },
  },

  resizeOutline: {
    fill: 'transparent',
    stroke: '#EAEAEA',
    strokeWidth: 1.5,
    strokeDasharray: '4,4',
    radius: 8,
    hover: {
      stroke: '#4271DF',
    },
  },
}
export const colorfulTheme: LogicFlow.Theme = {
  baseNode: {
    fill: '#fff',
    stroke: '#474747',
    strokeWidth: 2,
    radius: 12,
  },
  baseEdge: {
    stroke: '#474747',
    strokeWidth: 2,
    radius: 12,
  },
  rect: { fill: '#72CBFF', stroke: '#3ABDF9', radius: 8 },
  circle: { fill: '#FFE075', stroke: '#F9CE3A', radius: 8 },
  ellipse: { fill: '#FFA8A8', stroke: '#FF6B66', radius: 8 },
  text: { fill: '#72CBFF', radius: 8, fontSize: 12 },
  diamond: { fill: '#96F7AF', stroke: '#40EF7E', radius: 8 },
  polygon: { fill: '#E0A8FF', stroke: '#C271FF', radius: 8 },
  nodeText: {
    color: '#474747',
    overflowMode: 'default',
    fontSize: 12,
    lineHeight: 1.2,
  },
  edgeText: {
    textWidth: 100,
    overflowMode: 'default',
    fontSize: 12,
    background: {
      fill: '#fff',
    },
  },
  html: {
    fill: '#fff',
    stroke: 'transparent',
    strokeWidth: 0,
  },
  anchor: {
    stroke: '#474747',
    fill: '#fff',
    r: 4,
    hover: {
      r: 8,
      fill: '#707070',
      fillOpacity: 0.15,
      stroke: 'transparent',
    },
  },
  anchorLine: {
    stroke: '#474747',
    strokeWidth: 2,
    strokeDasharray: '3,2',
  },
  line: {},
  polyline: { radius: 8 },
  bezier: {
    fill: 'none',
    adjustLine: {
      stroke: '#3ABDF9',
    },
    adjustAnchor: {
      r: 4,
      fill: '#3ABDF9',
      fillOpacity: 1,
      stroke: '#3ABDF9',
    },
  },
  edgeAdjust: {
    r: 4,
    fill: '#fff',
    stroke: '#474747',
    strokeWidth: 1,
  },
  arrow: {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    offset: 10,
    verticalLength: 5, // 箭头垂直于边的距离
  },
  snapline: {
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    stroke: '#949494',
    strokeWidth: 1,
  },
  outline: {
    radius: 8,
    fill: 'transparent',
    stroke: '#949494',
    strokeDasharray: '3,3',
    hover: {
      stroke: '#949494',
    },
  },
  edgeOutline: {
    fill: 'transparent',
    stroke: '#757575',
    strokeWidth: 1.5,
    strokeDasharray: '4,4',
    radius: 8,
    hover: {
      stroke: '#4271DF',
    },
  },
  edgeAnimation: {
    stroke: '#4271DF',
    strokeDasharray: '12,4,6,4',
    strokeDashoffset: '100%',
    animationName: 'lf_animate_dash',
    animationDuration: '20s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    animationDirection: 'normal',
  },
  rotateControl: {
    stroke: '#474747',
    fill: '#fff',
    strokeWidth: 1,
    hover: {
      fill: '#707070',
      fillOpacity: 0.15,
      stroke: 'transparent',
    },
  },
  resizeControl: {
    width: 8,
    height: 8,
    radius: 2,
    fill: '#fff',
    stroke: '#474747',
    hover: {
      width: 12,
      height: 12,
      fill: '#707070',
      fillOpacity: 0.15,
      stroke: 'transparent',
    },
  },
  resizeOutline: {
    fill: 'transparent',
    stroke: '#757575',
    strokeWidth: 1.5,
    strokeDasharray: '4,4',
    radius: 8,
    hover: {
      stroke: '#4271DF',
    },
  },
}

export const themeModeMap = {
  default: defaultTheme,
  colorful: colorfulTheme,
  dark: darkTheme,
  retro: retroTheme,
}

// 不同主题的背景色
export const darkBackground = {
  background: '#33353A',
}
export const colorfulBackground = {
  background: '#fefeff',
}
export const defaultBackground = {
  background: '#FBFCFE',
}
export const retroBackground = {
  background: '#ffffff',
}
export const backgroundModeMap = {
  colorful: colorfulBackground,
  dark: darkBackground,
  default: defaultBackground,
  retro: retroBackground,
}

// 不同主题的网格样式
export const darkGrid = {
  size: DEFAULT_GRID_SIZE,
  visible: true,
  type: 'mesh',
  config: {
    color: '#83838377',
    thickness: 2,
  },
  majorBold: true,
}
export const colorfulGrid = {
  size: DEFAULT_GRID_SIZE,
  visible: true,
  type: 'dot',
  config: {
    color: '#b7c2d9',
    thickness: 2,
  },
  majorBold: true,
}
export const defaultGrid = {
  size: DEFAULT_GRID_SIZE,
  visible: true,
  type: 'mesh',
  config: {
    color: '#E4E9F4',
    thickness: 2,
  },
  majorBold: true,
}
export const retroGrid = {
  size: DEFAULT_GRID_SIZE,
  visible: true,
  type: 'dot',
  config: {
    color: '#ababab',
    thickness: 1,
  },
  majorBold: false,
}
export const gridModeMap = {
  colorful: colorfulGrid,
  dark: darkGrid,
  retro: retroGrid,
  default: defaultGrid,
}

export default null
