import { cloneDeep, merge } from 'lodash-es'
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

/* 主题（全局样式）相关工具方法 */
export const setupTheme = (
  customTheme?: Partial<LogicFlow.Theme>,
): LogicFlow.Theme => {
  let theme = cloneDeep(defaultTheme)

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

/* 更新 theme 方法 */
export const updateTheme = setupTheme
