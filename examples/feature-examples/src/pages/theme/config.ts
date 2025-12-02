export const data = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 150,
      y: 150,
      properties: {
        style: {
          radius: 5,
        },
      },
    },
    {
      id: '2',
      type: 'circle',
      x: 500,
      y: 50,
    },
    {
      id: '3',
      type: 'polygon',
      x: 150,
      y: 300,
    },
    {
      id: '4',
      type: 'diamond',
      x: 500,
      y: 200,
    },
    {
      id: '5',
      type: 'html',
      x: 150,
      y: 450,
      properties: {
        style: {
          radius: 15,
        },
      },
    },
    // {
    //   id: '6',
    //   type: 'diamond',
    //   x: 500,
    //   y: 350,
    //   properties: {
    //     style: {
    //       radius: 15,
    //     },
    //   },
    // },
    // {
    //   id: '7',
    //   type: 'polygon',
    //   x: 150,
    //   y: 600,
    //   properties: {
    //     style: {
    //       radius: 20,
    //     },
    //   },
    // },
    // {
    //   id: '8',
    //   type: 'diamond',
    //   x: 500,
    //   y: 500,
    //   properties: {
    //     style: {
    //       radius: 20,
    //     },
    //   },
    // },
  ],
  edges: [
    {
      id: 'e_1',
      type: 'polyline',
      sourceNodeId: '1',
      targetNodeId: '2',
      // text: 'radius: 5 + solid arrow',
      properties: {
        radius: 40,
        offset: 100,
        style: {
          startArrowType: 'solid',
          endArrowType: 'solid',
        },
      },
    },
    {
      id: 'e_2',
      type: 'polyline',
      sourceNodeId: '3',
      targetNodeId: '4',
      text: 'radius: 10 + hollow arrow',
      properties: {
        style: {
          startArrowType: 'hollow',
          endArrowType: 'hollow',
        },
      },
    },
    // {
    //   id: 'e_3',
    //   type: 'polyline',
    //   sourceNodeId: '5',
    //   targetNodeId: '6',
    //   text: 'radius: 15 + diamond arrow',
    //   properties: {
    //     style: {
    //       startArrowType: 'diamond',
    //       endArrowType: 'diamond',
    //     },
    //   },
    // },
    // {
    //   id: 'e_4',
    //   type: 'polyline',
    //   sourceNodeId: '7',
    //   targetNodeId: '8',
    //   text: 'radius: 20 + circle arrow',
    //   properties: {
    //     style: {
    //       startArrowType: 'circle',
    //       endArrowType: 'circle',
    //     },
    //   },
    // },
  ],
}

export const config = {
  container: {
    id: 'LF-theme',
  },
  width: 700,
  height: 600,
  grid: {
    size: 20,
    visible: true,
    type: 'mesh' as const,
    config: {
      color: '#D7DEEB',
      thickness: 4,
    },
    majorBold: true,
  },
}

// 类型定义
export interface FieldConfig {
  type: 'color' | 'number' | 'select' | 'text'
  label: string
  options?: Array<{ label: string; value: string | number | boolean }>
  min?: number
  max?: number
  step?: number
  placeholder?: string
}

export interface ThemeConfig {
  label: string
  category: 'basic' | 'node' | 'edge' | 'text' | 'other' | 'canvas'
  fields: string[]
  nestedFields?: Record<string, string[]>
}

export type FormValues = Record<string, any>

// 主题配置项定义
export const themeFieldConfigs: Record<string, ThemeConfig> = {
  // 基础主题
  baseNode: {
    label: '基础节点',
    category: 'basic',
    fields: ['fill', 'stroke', 'strokeWidth', 'radius'],
  },
  baseEdge: {
    label: '基础边',
    category: 'basic',
    fields: [
      'stroke',
      'strokeWidth',
      'strokeDasharray',
      'startArrowType',
      'endArrowType',
    ],
  },

  // 画布配置
  background: {
    label: '画布背景',
    category: 'canvas',
    fields: [
      'background',
      'backgroundImage',
      'backgroundRepeat',
      'backgroundPosition',
      'backgroundSize',
      'backgroundOpacity',
      'filter',
    ],
  },
  grid: {
    label: '网格配置',
    category: 'canvas',
    fields: ['size', 'visible', 'type', 'majorBoldEnabled'],
    nestedFields: {
      config: ['color', 'thickness'],
      majorBold: [
        'opacity',
        'boldIndices',
        'customBoldWidth',
        'dashBaseSize',
        'dashPattern',
      ],
    },
  },

  // 节点主题
  rect: {
    label: '矩形节点',
    category: 'node',
    fields: ['fill', 'stroke', 'strokeWidth', 'radius'],
  },
  circle: {
    label: '圆形节点',
    category: 'node',
    fields: ['fill', 'stroke', 'strokeWidth'],
  },
  diamond: {
    label: '菱形节点',
    category: 'node',
    fields: ['fill', 'stroke', 'strokeWidth', 'radius'],
  },
  ellipse: {
    label: '椭圆节点',
    category: 'node',
    fields: ['fill', 'stroke', 'strokeWidth'],
  },
  polygon: {
    label: '多边形节点',
    category: 'node',
    fields: ['fill', 'stroke', 'strokeWidth', 'radius'],
  },

  // 边主题
  line: {
    label: '直线',
    category: 'edge',
    fields: [
      'stroke',
      'strokeWidth',
      'strokeDasharray',
      'startArrowType',
      'endArrowType',
    ],
  },
  polyline: {
    label: '折线',
    category: 'edge',
    fields: [
      'stroke',
      'strokeWidth',
      'strokeDasharray',
      'startArrowType',
      'endArrowType',
    ],
  },
  bezier: {
    label: '贝塞尔曲线',
    category: 'edge',
    fields: [
      'stroke',
      'strokeWidth',
      'strokeDasharray',
      'startArrowType',
      'endArrowType',
    ],
    nestedFields: {
      adjustLine: ['stroke', 'strokeWidth'],
      adjustAnchor: ['r', 'fill', 'stroke', 'strokeWidth'],
    },
  },
  anchorLine: {
    label: '锚点连线',
    category: 'edge',
    fields: ['stroke', 'strokeWidth', 'strokeDasharray'],
  },

  // 文本主题
  text: {
    label: '文本节点',
    category: 'text',
    fields: ['color', 'fontSize', 'fontFamily', 'fontWeight'],
    nestedFields: {
      background: ['fill', 'stroke', 'strokeWidth', 'radius'],
    },
  },
  nodeText: {
    label: '节点文本',
    category: 'text',
    fields: [
      'color',
      'fontSize',
      'fontFamily',
      'fontWeight',
      'textWidth',
      'overflowMode',
      'lineHeight',
      'textAnchor',
    ],
    nestedFields: {
      background: ['fill', 'stroke', 'strokeWidth', 'radius'],
      wrapPadding: ['top', 'right', 'bottom', 'left'],
    },
  },
  edgeText: {
    label: '边文本',
    category: 'text',
    fields: [
      'color',
      'fontSize',
      'fontFamily',
      'fontWeight',
      'textWidth',
      'overflowMode',
    ],
    nestedFields: {
      background: ['fill', 'stroke', 'strokeWidth', 'radius', 'wrapPadding'],
    },
  },

  // 其他元素主题
  anchor: {
    label: '锚点',
    category: 'other',
    fields: ['r', 'fill', 'stroke', 'strokeWidth'],
    nestedFields: {
      hover: ['r', 'fill', 'stroke', 'strokeWidth', 'fillOpacity'],
    },
  },
  arrow: {
    label: '箭头',
    category: 'other',
    fields: [
      'offset',
      'verticalLength',
      'refX',
      'refY',
      'fill',
      'stroke',
      'strokeWidth',
      'strokeLinecap',
      'strokeLinejoin',
      'startArrowType',
      'endArrowType',
    ],
  },
  snapline: {
    label: '对齐线',
    category: 'other',
    fields: ['stroke', 'strokeWidth', 'strokeDasharray'],
  },
  rotateControl: {
    label: '旋转控制点',
    category: 'other',
    fields: ['fill', 'stroke', 'strokeWidth', 'r'],
  },
  resizeControl: {
    label: '缩放控制点',
    category: 'other',
    fields: ['fill', 'stroke', 'strokeWidth', 'r'],
  },
  resizeOutline: {
    label: '缩放外框',
    category: 'other',
    fields: ['fill', 'stroke', 'strokeWidth', 'strokeDasharray', 'radius'],
  },
  edgeAdjust: {
    label: '边调整点',
    category: 'other',
    fields: ['r', 'fill', 'stroke', 'strokeWidth'],
  },
  outline: {
    label: '选中外框',
    category: 'other',
    fields: ['fill', 'stroke', 'strokeWidth', 'strokeDasharray', 'radius'],
    nestedFields: {
      hover: ['stroke', 'strokeWidth'],
    },
  },
  edgeAnimation: {
    label: '边动画',
    category: 'other',
    fields: [
      'stroke',
      'strokeDasharray',
      'strokeDashoffset',
      'animationName',
      'animationDuration',
      'animationIterationCount',
      'animationTimingFunction',
      'animationDirection',
    ],
  },
}

// 字段类型配置
export const fieldTypeConfigs: Record<string, FieldConfig> = {
  // 颜色类型
  fill: { type: 'color', label: '填充颜色' },
  stroke: { type: 'color', label: '边框颜色' },
  color: { type: 'color', label: '颜色' },
  background: { type: 'color', label: '背景颜色' },

  // 数字类型
  strokeWidth: { type: 'number', label: '边框宽度', min: 0, step: 1 },
  radius: { type: 'number', label: '圆角半径', min: 0, step: 1 },
  rx: { type: 'number', label: '水平圆角', min: 0, step: 1 },
  ry: { type: 'number', label: '垂直圆角', min: 0, step: 1 },
  r: { type: 'number', label: '半径', min: 0, step: 1 },
  fontSize: { type: 'number', label: '字体大小', min: 8, step: 1 },
  textWidth: { type: 'number', label: '文本宽度', min: 50, step: 10 },
  lineHeight: { type: 'number', label: '行高', min: 1, step: 0.1 },
  offset: { type: 'number', label: '箭头偏移', min: 0, step: 1 },
  verticalLength: { type: 'number', label: '箭头垂直长度', min: 0, step: 1 },
  refX: { type: 'number', label: '参考X', step: 1 },
  refY: { type: 'number', label: '参考Y', step: 1 },
  fillOpacity: {
    type: 'number',
    label: '填充透明度',
    min: 0,
    max: 1,
    step: 0.1,
  },
  backgroundOpacity: {
    type: 'number',
    label: '背景透明度',
    min: 0,
    max: 1,
    step: 0.1,
  },
  size: { type: 'number', label: '网格大小', min: 1, step: 1 },
  thickness: { type: 'number', label: '网格线宽度', min: 1, step: 1 },
  // 高级网格行为（majorBold）配置项
  majorBoldEnabled: {
    type: 'select',
    label: '启用高级网格行为',
    options: [
      { label: '启用', value: true },
      { label: '禁用', value: false },
    ],
  },
  opacity: { type: 'number', label: '默认透明度', min: 0, max: 1, step: 0.05 },
  boldIndices: {
    type: 'text',
    label: '加粗索引(逗号分隔)',
    placeholder: '如: 5,10',
  },
  customBoldWidth: { type: 'number', label: '加粗线宽', min: 0, step: 0.5 },
  dashBaseSize: {
    type: 'number',
    label: '虚线周期基准(像素)',
    min: 1,
    step: 1,
  },
  dashPattern: {
    type: 'text',
    label: '虚线模式(逗号分隔)',
    placeholder: '如: 6,4',
  },

  // 布尔类型 - 使用select来渲染
  visible: {
    type: 'select',
    label: '是否可见',
    options: [
      { label: '显示', value: true },
      { label: '隐藏', value: false },
    ],
  },

  // 选择类型
  type: {
    type: 'select',
    label: '网格类型',
    options: [
      { label: '点状网格', value: 'dot' },
      { label: '交叉线网格', value: 'mesh' },
    ],
  },
  backgroundRepeat: {
    type: 'select',
    label: '背景重复',
    options: [
      { label: '重复', value: 'repeat' },
      { label: '水平重复', value: 'repeat-x' },
      { label: '垂直重复', value: 'repeat-y' },
      { label: '不重复', value: 'no-repeat' },
      { label: '初始值', value: 'initial' },
      { label: '继承', value: 'inherit' },
    ],
  },
  backgroundPosition: {
    type: 'select',
    label: '背景位置',
    options: [
      { label: '左上', value: 'left top' },
      { label: '居中', value: 'center' },
      { label: '右下', value: 'right bottom' },
      { label: '左', value: 'left' },
      { label: '右', value: 'right' },
      { label: '上', value: 'top' },
      { label: '下', value: 'bottom' },
    ],
  },
  overflowMode: {
    type: 'select',
    label: '溢出模式',
    options: [
      { label: '默认', value: 'default' },
      { label: '自动换行', value: 'autoWrap' },
      { label: '省略号', value: 'ellipsis' },
    ],
  },
  textAnchor: {
    type: 'select',
    label: '文本对齐',
    options: [
      { label: '左对齐', value: 'start' },
      { label: '居中', value: 'middle' },
      { label: '右对齐', value: 'end' },
    ],
  },
  startArrowType: {
    type: 'select',
    label: '起始箭头',
    options: [
      { label: '无', value: 'none' },
      { label: '实心', value: 'solid' },
      { label: '空心', value: 'hollow' },
      { label: '菱形', value: 'diamond' },
      { label: '圆形', value: 'circle' },
    ],
  },
  endArrowType: {
    type: 'select',
    label: '结束箭头',
    options: [
      { label: '无', value: 'none' },
      { label: '实心', value: 'solid' },
      { label: '空心', value: 'hollow' },
      { label: '菱形', value: 'diamond' },
      { label: '圆形', value: 'circle' },
    ],
  },
  strokeLinecap: {
    type: 'select',
    label: '线条端点',
    options: [
      { label: '平直', value: 'butt' },
      { label: '圆形', value: 'round' },
      { label: '方形', value: 'square' },
    ],
  },
  strokeLinejoin: {
    type: 'select',
    label: '线条连接',
    options: [
      { label: '尖角', value: 'miter' },
      { label: '圆角', value: 'round' },
      { label: '斜角', value: 'bevel' },
    ],
  },
  fontFamily: {
    type: 'select',
    label: '字体',
    options: [
      { label: '默认', value: 'inherit' },
      { label: '微软雅黑', value: 'Microsoft YaHei' },
      { label: '宋体', value: 'SimSun' },
      { label: 'Arial', value: 'Arial' },
      { label: 'Times New Roman', value: 'Times New Roman' },
    ],
  },
  fontWeight: {
    type: 'select',
    label: '字重',
    options: [
      { label: '正常', value: 'normal' },
      { label: '粗体', value: 'bold' },
      { label: '细体', value: 'lighter' },
    ],
  },
  animationTimingFunction: {
    type: 'select',
    label: '动画函数',
    options: [
      { label: '线性', value: 'linear' },
      { label: '缓入', value: 'ease-in' },
      { label: '缓出', value: 'ease-out' },
      { label: '缓入缓出', value: 'ease-in-out' },
    ],
  },
  animationDirection: {
    type: 'select',
    label: '动画方向',
    options: [
      { label: '正常', value: 'normal' },
      { label: '反向', value: 'reverse' },
      { label: '交替', value: 'alternate' },
      { label: '反向交替', value: 'alternate-reverse' },
    ],
  },

  // 字符串类型
  strokeDasharray: { type: 'text', label: '虚线样式', placeholder: '如: 5,5' },
  strokeDashoffset: { type: 'text', label: '虚线偏移' },
  animationName: { type: 'text', label: '动画名称' },
  animationDuration: { type: 'text', label: '动画时长', placeholder: '如: 2s' },
  animationIterationCount: {
    type: 'text',
    label: '动画次数',
    placeholder: '如: infinite',
  },
  wrapPadding: { type: 'text', label: '内边距', placeholder: '如: 5px,10px' },
  backgroundImage: {
    type: 'text',
    label: '背景图片',
    placeholder: "输入链接，格式：url('图片链接')",
  },
  backgroundSize: {
    type: 'text',
    label: '背景尺寸',
    placeholder: '如: cover, contain, 100px 50px',
  },
  filter: { type: 'text', label: '滤镜', placeholder: '如: blur(2px)' },
}

export default null
