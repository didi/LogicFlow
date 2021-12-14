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
   */
  [key: string]: any;
};

/**
 * rect主题样式
 * svg基础图形-矩形
 * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/rect
 */
export type RectTheme = {
  /**
   * 矩形的默认宽度
   */
  width: number;
  /**
   * 矩形的默认高度
   */
  height: number;
  /**
   * 圆角
   */
  rx: number;
  ry: number;
} & CommonTheme;

/**
 * circle主题样式
 * svg基础图形-圆形
 * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/circle
 */
export type CircleTheme = {
  /**
   * 默认半径
   */
  r: number;
} & CommonTheme;
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
export type EllipseTheme = {
  rx: number;
  ry: number;
} & CommonTheme;

/**
 * 锚点样式
 * svg基础图形-圆
 */
export type AnchorTheme = {
  r: number;
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
  /**
   * 文本一行最大宽度
   */
  textWidth?: number;
} & CommonTheme;

/**
 * 节点文本样式
 */
export type NodeTextTheme = {
  /**
   * 文本超出指定宽度处理方式
   * default: 不特殊处理，允许超出
   * autoWrap: 超出自动换行
   * ellipsis: 超出省略
   */
  overflowMode?: 'ellipsis' | 'autoWrap' | 'default';
} & TextTheme;
/**
 * 连线文本样式
 */
export type EdgeTextTheme = {
  /**
   * 文本超出指定宽度处理方式
   * default: 不特殊处理，允许超出
   * autoWrap: 超出自动换行
   * ellipsis: 超出省略
   */
  overflowMode?: 'ellipsis' | 'autoWrap';
  /**
   * 文本背景样式
   */
  background?: RectTheme;
} & TextTheme;

export type EdgeTheme = CommonTheme;

export type EdgePolylineTheme = {
  /**
   * 为了避免折线贴着节点导致折线和节点边重合
   * 设置折线与节点产生垂线的距离。
   * 详情见http://logic-flow.org/article/article03.html#%E7%9B%B4%E8%A7%92%E6%8A%98%E7%BA%BF
   */
  offset?: number;
} & EdgeTheme;

export type EdgeBezierTheme = {
  /**
   * 贝塞尔曲线控制点与锚点的距离
   */
  offset?: number;
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
   * 箭头垂直于连线的距离
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
   * 所有连线的通用主题设置
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
   * 锚点在hover状态下的样式
   */
  anchorHover?: AnchorTheme,
  /**
   * 统一文本样式
   */
  text?: TextTheme,
  /**
   * 节点文本样式
   */
  nodeText?: NodeTextTheme,
  /**
   * 连线文本样式
   */
  edgeText?: EdgeTextTheme,
  /**
   * 连线上箭头的样式
   */
  arrow?: ArrowTheme,
  /**
   * 从锚点拉出的连线的样式
   */
  anchorLine?: EdgeTheme,
  /**
   * 对齐线样式
   */
  snapline?: EdgeTheme,
  /**
   * 连线连段的调整点样式
   */
  edgeAdjust?: CircleTheme,
  /**
   * 节点选择状态下外侧的选框样式
   */
  outline?: OutlineTheme,
};

const baseNode = {
  fill: '#FFFFFF',
  stroke: '#000000',
  strokeWidth: 2,
};

const rect = {
  width: 100,
  height: 80,
  rx: 0,
  ry: 0,
};
const circle = {
  r: 50,
};
const ellipse = {
  rx: 55,
  ry: 45,
};
const diamond = {
  rx: 50,
  ry: 50,
};
const polygon = {};

const anchor = {
  ...baseNode,
  stroke: '#000000',
  strokeWidth: 1,
  r: 4,
};

const anchorHover = {
  fill: '#1E90FF',
  fillOpacity: 0.5,
  stroke: '#4169E1',
  strokeWidth: 1,
  r: 10,
};

const baseEdge = {
  stroke: '#000000',
  strokeWidth: 2,
  hoverStroke: '#000000',
  selectedStroke: '#000000',
  strokeDashArray: '1,0',
};

const edge = {};

const line = {};

const polyline = {
  offset: 30,
};

const bezier = {
  ...edge,
  offset: 100,
  adjustLineColor: '#4169E1',
  adjustAnchorStroke: '#4169E1',
  adjustAnchorFill: '#1E90FF',
  adjustAnchorFillOpacity: 0.5,
};

const anchorLine = {
  stroke: '#000000',
  strokeWidth: 2,
  strokeDasharray: '3,2',
};

const text = {
  color: '#000000',
  fontSize: 12,
};

const nodeText = {
  ...text,
};

const edgeText = {
  ...text,
};

const snapline = {
  stroke: '#1E90FF',
  strokeWidth: 1,
};

const arrow = {
  offset: 10, // 箭头长度
  verticalLength: 5, // 箭头垂直于连线的距离
};
// 调整连线起终点的圆形样式
const edgeAdjust = {
  r: 4,
  fill: '#FFFFFF',
  stroke: '#373738',
  strokeWidth: 2,
};

const outline = {
  fill: 'transparent',
  stroke: '#3f3f3f',
  strokeDasharray: '3,3',
  hover: {
    stroke: '#4d90ff',
  },
};

export const defaultTheme: Theme = {
  baseNode,
  rect,
  circle,
  diamond,
  ellipse,
  polygon,
  anchor,
  text,
  nodeText,
  edgeText,
  baseEdge,
  line,
  polyline,
  bezier,
  arrow,
  anchorLine,
  anchorHover,
  snapline,
  edgeAdjust,
  outline,
};
