/**
 * 颜色
 * CSS属性用颜色
 * 如#000000，reg(0,0,0,0)
 * 如果是透明，可以传'none'
 */
export type Color = string;

/**
 * svg虚线
 * 格式为逗号分割字符串，如
 * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-dasharray
 */
export type DashArray = string;

export type CommonTheme = {
  /**
   * 填充颜色
   */
  fill?: Color;
  /**
   * 边框颜色
   */
  stroke?: Color;
  /**
   * 边框宽度
   */
  strokeWidth?: number;
  /**
   * 其他属性
   * 我们会把你定义的所有属性最终传递到DOM上
   * 详情请参考svg属性规范
   * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute
   * 注意: 请不要在主题中设置“形状属性”，例如：x、y、width、height、radius、r、rx、ry
   * @see https://docs.logic-flow.cn/docs/#/zh/api/themeApi?id=%e5%bd%a2%e7%8a%b6%e5%b1%9e%e6%80%a7）
   */
  [key: string]: any;
};

/**
 * rect主题样式
 * svg基础图形-矩形
 * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/rect
 */
export type RectTheme = CommonTheme;

/**
 * circle主题样式
 * svg基础图形-圆形
 * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/circle
 */
export type CircleTheme = CommonTheme;
/**
 * polygon主题样式
 * svg基础图形-多边形
 * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/polygon
 */
export type PolygonTheme = CommonTheme;

/**
 * ellipse主题样式
 * svg基础图形-椭圆
 * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/ellipse
 */
export type EllipseTheme = CommonTheme;

/**
 * 锚点样式
 * svg基础图形-圆
 */
export type AnchorTheme = {
  r?: number;
  hover?: {
    r: number;
  } & CommonTheme;
} & CommonTheme;

/**
 * 文本样式
 * svg文本
 * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/text
 */
export type TextTheme = {
  /**
   * 文本颜色
   */
  color?: Color;
  /**
   * 文本大小
   */
  fontSize?: number;
} & CommonTheme;

/**
 * 文本节点样式
 */
export type TextNodeTheme = {
  background?: RectTheme;
} & TextTheme;

/**
 * 节点上文本样式
 */
export type NodeTextTheme = {
  /**
   * 文本超出指定宽度处理方式
   * default: 不特殊处理，允许超出
   * autoWrap: 超出自动换行
   * ellipsis: 超出省略
   */
  overflowMode?: string;
  background?: RectTheme;
} & TextTheme;

/**
 * 边上文本样式
 */
export type EdgeTextTheme = {
  /**
   * 文本超出指定宽度处理方式
   * default: 不特殊处理，允许超出
   * autoWrap: 超出自动换行
   * ellipsis: 超出省略
   */
  overflowMode?: string;
  /**
   * 文本一行最大宽度
   */
  textWidth?: number;
  /**
   * 文本背景样式
   */
  background?: {
    /**
     * 背景区域padding
     * wrapPadding: '5px,10px'
     */
    wrapPadding?: string;
  } & RectTheme;
  /**
   * hover状态下文本样式
   */
  hover?: EdgeTextTheme;
} & TextTheme;

export type EdgeTheme = CommonTheme;

export type EdgePolylineTheme = EdgeTheme;

export type EdgeBezierTheme = {
  /**
   * 贝塞尔调整线主题
   */
  adjustLine?: EdgeTheme;
  /**
   * 贝塞尔调整锚点主题
   */
  adjustAnchor?: CircleTheme;
} & EdgeTheme;

/**
 * 箭头主题
 */
export type ArrowTheme = {
  /**
   * 箭头长度.
   * 以符号"->"为例, offset表示箭头大于号的宽度。
   */
  offset?: number,
  /**
   * 箭头垂直于边的距离
   * 以符号"->"为例, verticalLength表示箭头大于号的高度
   */
  verticalLength?: number,
} & CommonTheme;

export type OutlineTheme = {
  /**
   * hover状态下样式
   */
  hover?: CommonTheme;
} & CommonTheme;

/**
 * 边动画主题
 */
export type EdgeAnimation = {
  stroke?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string;
  animationName?: string;
  animationDuration?: string;
  animationIterationCount?: string;
  animationTimingFunction?: string;
  animationDirection?: string;
};

export type Theme = {
  /**
   * 所有节点的通用主题设置
   */
  baseNode?: CommonTheme,
  /**
   * 基础图形-矩形样式
   */
  rect?: RectTheme,
  /**
   * 基础图形-圆形样式
   */
  circle?: CircleTheme,
  /**
   * 基础图形-菱形样式
   */
  diamond?: PolygonTheme,
  /**
   * 基础图形-椭圆样式
   */
  ellipse?: EllipseTheme,
  /**
   * 基础图形-多边形样式
   */
  polygon?: PolygonTheme,
  /**
   * 所有边的通用主题设置
   */
  baseEdge?: EdgeTheme,
  /**
   * 基础图形-直线样式
   */
  line?: EdgeTheme,
  /**
  * 基础图形-折现样式
  */
  polyline?: EdgePolylineTheme,
  /**
  * 基础图形-贝塞尔曲线样式
  */
  bezier?: EdgeBezierTheme,
  /**
   * 锚点样式
   */
  anchor?: AnchorTheme,
  /**
   * 文本节点样式
   */
  text?: TextTheme,
  /**
   * 节点文本样式
   */
  nodeText?: NodeTextTheme,
  /**
   * 边文本样式
   */
  edgeText?: EdgeTextTheme,
  /**
   * 边上箭头的样式
   */
  arrow?: ArrowTheme,
  /**
   * 从锚点拉出的边的样式
   */
  anchorLine?: EdgeTheme,
  /**
   * 对齐线样式
   */
  snapline?: EdgeTheme,
  /**
   * 当开启了跳转边的起点和终点(adjustEdgeStartAndEnd:true)后
   * 边的两端会出现调整按钮
   * 边连段的调整点样式
   */
  edgeAdjust?: CircleTheme,
  /**
   * 节点选择状态下外侧的选框样式
   */
  outline?: OutlineTheme,
  /**
   * 边动画样式
   */
  edgeAnimation?: EdgeAnimation,
};

export const defaultTheme: Theme = {
  baseNode: {
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
  },
  baseEdge: {
    stroke: '#000000',
    strokeWidth: 2,
  },
  rect: {},
  circle: {},
  diamond: {},
  ellipse: {},
  polygon: {},
  text: {
    color: '#000000',
    stroke: 'none',
    fontSize: 12,
    background: {
      fill: 'transparent',
    },
  },
  anchor: {
    stroke: '#000000',
    fill: '#FFFFFF',
    r: 4,
    hover: {
      fill: '#949494',
      fillOpacity: 0.5,
      stroke: '#949494',
      r: 10,
    },
  },
  nodeText: {
    color: '#000000',
    overflowMode: 'default',
    lineHeight: 1.2,
    fontSize: 12,
  },
  edgeText: {
    textWidth: 100,
    overflowMode: 'default',
    fontSize: 12,
    background: {
      fill: '#FFFFFF',
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
      stroke: '#949494',
      fillOpacity: 1,
    },
  },
  arrow: {
    offset: 10, // 箭头长度
    verticalLength: 5, // 箭头垂直于边的距离
  },
  anchorLine: {
    stroke: '#000000',
    strokeWidth: 2,
    strokeDasharray: '3,2',
  },
  snapline: {
    stroke: '#949494',
    strokeWidth: 1,
  },
  edgeAdjust: {
    r: 4,
    fill: '#FFFFFF',
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
    strokeDasharray: '10 10',
    strokeDashoffset: '100%',
    animationName: 'lf_animate_dash',
    animationDuration: '20s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    animationDirection: 'normal',
  },
};
