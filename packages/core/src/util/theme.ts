import { cloneDeep, merge, assign } from 'lodash-es'
import LogicFlow from '../LogicFlow'

export const defaultTheme: LogicFlow.Theme = {
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
export const radiusMode: any = {
  rect: { radius: 8 },
  diamond: { radius: 8 },
  polygon: { radius: 8 },
  polyline: { radius: 8 },
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
  resizeOutline: {
    radius: 8,
    fill: 'none',
    stroke: 'transparent', // 矩形默认不显示调整边框
    strokeWidth: 1,
    strokeDasharray: '3,3',
  },
}
export const darkMode: any = {
  baseNode: {
    fill: '#23272e',
    stroke: '#fefeff',
  },
  baseEdge: {
    stroke: '#fefeff',
  },
  rect: { radius: 8 },
  diamond: { radius: 8 },
  polygon: { radius: 8 },
  polyline: { radius: 8 },
  nodeText: {
    color: '#fefeff',
    overflowMode: 'default',
    fontSize: 12,
    lineHeight: 1.2,
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
  resizeOutline: {
    radius: 8,
    fill: 'none',
    stroke: 'transparent', // 矩形默认不显示调整边框
    strokeWidth: 1,
    strokeDasharray: '3,3',
  },
}
export const colorfulMode: any = {
  rect: { fill: '#72CBFF', stroke: '#3ABDF9', radius: 8 },
  circle: { fill: '#FFE075', stroke: '#F9CE3A', radius: 8 },
  ellipse: { fill: '#FFA8A8', stroke: '#FF6B66', radius: 8 },
  text: { fill: '#72CBFF', radius: 8 },
  diamond: { fill: '#96F7AF', stroke: '#40EF7E', radius: 8 },
  polygon: { fill: '#E0A8FF', stroke: '#C271FF', radius: 8 },
  polyline: { radius: 8 },
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
  resizeOutline: {
    radius: 8,
    fill: 'none',
    stroke: 'transparent', // 矩形默认不显示调整边框
    strokeWidth: 1,
    strokeDasharray: '3,3',
  },
}

export const themeModeMap = {
  colorful: colorfulMode,
  dark: darkMode,
  radius: radiusMode,
  default: defaultTheme,
}

// 不同主题的背景色
export const darkBackground = {
  background: '#23272e',
}
export const colorfulBackground = {
  background: '#fefeff',
}
export const defaultBackground = {
  background: '#ffffff',
}
export const backgroundModeMap = {
  colorful: colorfulBackground,
  dark: darkBackground,
  radius: defaultBackground,
  default: defaultBackground,
}

// 不同主题的网格样式
export const darkGrid = {
  color: '#66676a',
  thickness: 1,
}
export const colorfulGrid = {
  color: '#dadada',
  thickness: 1,
}
export const defaultGrid = {
  color: '#acacac',
  thickness: 1,
}
export const gridModeMap = {
  colorful: colorfulGrid,
  dark: darkGrid,
  radius: defaultGrid,
  default: defaultGrid,
}

/* 主题（全局样式）相关工具方法 */
export const setupTheme = (
  customTheme?: Partial<LogicFlow.Theme>,
  themeMode?: 'radius' | 'dark' | 'colorful' | 'default' | string,
): LogicFlow.Theme => {
  let theme = cloneDeep(defaultTheme)
  if (themeMode) {
    theme = merge(theme, themeModeMap[themeMode])
  }
  if (customTheme) {
    /**
     * 为了不让默认样式被覆盖，使用 merge 方法
     * @docs https://lodash.com/docs/4.17.15#merge
     * 例如：锚点主题 hover，用户传入如下 ->
     * lf.setTheme({
     *   anchor: {
     *     fill: 'red'
     *   }
     * })
     *
     * 预期得到的结果如下：
     * {
     *   // ...
     *   anchor: {
     *     stroke: '#000',
     *     fill: 'red',
     *     r: 4,
     *     hover: {
     *       r: 10,
     *       fill: '#949494',
     *       fillOpacity: 0.5,
     *       stroke: '#949494',
     *     },
     *   },
     *   // ...
     * }
     */
    theme = merge(theme, customTheme)
  }
  return theme
}

export const addThemeMode = (
  themeMode: string,
  style: Partial<LogicFlow.Theme>,
): void => {
  if (themeModeMap[themeMode]) {
    console.warn(`theme mode ${themeMode} already exists`)
    return
  }
  themeModeMap[themeMode] = style
  backgroundModeMap[themeMode] = style.background || defaultBackground
  gridModeMap[themeMode] = style.grid || defaultGrid
}

export const removeThemeMode = (themeMode: string): void => {
  delete themeModeMap[themeMode]
  delete backgroundModeMap[themeMode]
  delete gridModeMap[themeMode]
}

export const clearThemeMode = (): void => {
  assign(themeModeMap, {
    colorful: {},
    dark: {},
    radius: {},
    default: {},
  })
  assign(backgroundModeMap, {
    colorful: {},
    dark: {},
    radius: {},
    default: {},
  })
  assign(gridModeMap, {
    colorful: {},
    dark: {},
    radius: {},
    default: {},
  })
}

/* 更新 theme 方法 */
export const updateTheme = setupTheme
