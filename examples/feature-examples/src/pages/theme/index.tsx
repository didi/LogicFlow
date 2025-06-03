import LogicFlow from '@logicflow/core'
import {
  Button,
  ColorPicker,
  Form,
  InputNumber,
  Select,
  Tabs,
  Input,
  message,
} from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import './index.less'

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

const data = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 150,
      y: 100,
      text: '矩形',
      properties: {
        radius: 8,
      },
    },
    {
      id: '2',
      type: 'circle',
      x: 350,
      y: 100,
      text: '圆形',
    },
    {
      id: '3',
      type: 'ellipse',
      x: 550,
      y: 100,
      text: '椭圆',
    },
    {
      id: '4',
      type: 'polygon',
      x: 150,
      y: 250,
      text: '多边形',
    },
    {
      id: '5',
      type: 'diamond',
      x: 350,
      y: 250,
      text: '菱形',
    },
    {
      id: '6',
      type: 'text',
      x: 550,
      y: 250,
      text: '纯文本节点',
    },
    {
      id: '7',
      type: 'html',
      x: 150,
      y: 400,
      text: 'html节点',
    },
  ],
  edges: [
    {
      id: 'e_1',
      type: 'polyline',
      sourceNodeId: '1',
      targetNodeId: '2',
    },
    {
      id: 'e_2',
      type: 'polyline',
      sourceNodeId: '2',
      targetNodeId: '3',
    },
    {
      id: 'e_3',
      type: 'polyline',
      sourceNodeId: '4',
      targetNodeId: '5',
    },
  ],
}

const config = {
  container: {
    id: 'LF-theme',
  },
  width: 700,
  height: 600,
  background: {
    backgroundImage:
      'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=)',
    backgroundRepeat: 'repeat',
    backgroundSize: '40px 40px',
  },
  grid: {
    size: 20,
    visible: true,
    type: 'dot' as const,
    config: {
      color: '#ababab',
      thickness: 1,
    },
  },
}

// 类型定义
interface FieldConfig {
  type: 'color' | 'number' | 'select' | 'text'
  label: string
  options?: Array<{ label: string; value: string | number | boolean }>
  min?: number
  max?: number
  step?: number
  placeholder?: string
}

interface ThemeConfig {
  label: string
  category: 'basic' | 'node' | 'edge' | 'text' | 'other' | 'canvas'
  fields: string[]
  nestedFields?: Record<string, string[]>
}

type FormValues = Record<string, any>

// 主题配置项定义
const themeFieldConfigs: Record<string, ThemeConfig> = {
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
    fields: ['size', 'visible', 'type'],
    nestedFields: {
      config: ['color', 'thickness'],
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
const fieldTypeConfigs: Record<string, FieldConfig> = {
  // 颜色类型
  fill: { type: 'color', label: '填充颜色' },
  stroke: { type: 'color', label: '边框颜色' },
  color: { type: 'color', label: '文字颜色' },
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

// 渲染表单项的组件
const renderFormField = (fieldName: string, fieldConfig: FieldConfig) => {
  const { type, label, options, min, max, step, placeholder } = fieldConfig

  switch (type) {
    case 'color':
      return (
        <Form.Item key={fieldName} label={label} name={fieldName}>
          <ColorPicker
            size="small"
            showText
            format="hex"
            onChange={(color) => {
              // 确保返回十六进制字符串
              return color.toHexString()
            }}
          />
        </Form.Item>
      )
    case 'number':
      return (
        <Form.Item key={fieldName} label={label} name={fieldName}>
          <InputNumber size="small" min={min} max={max} step={step} />
        </Form.Item>
      )
    case 'select':
      return (
        <Form.Item key={fieldName} label={label} name={fieldName}>
          <Select size="small" options={options} />
        </Form.Item>
      )
    case 'text':
      return (
        <Form.Item key={fieldName} label={label} name={fieldName}>
          <Input placeholder={placeholder} />
        </Form.Item>
      )
    default:
      return null
  }
}

// 独立的表单组件
const ThemeFormComponent: React.FC<{
  themeKey: string
  themeConfig: ThemeConfig
  initialValues: any
  onFormChange: (themeKey: string, changedValues: any, allValues: any) => void
}> = ({ themeKey, themeConfig, initialValues, onFormChange }) => {
  const [form] = Form.useForm()
  const { fields = [], nestedFields = {} } = themeConfig

  // 当初始值改变时，更新表单值
  useEffect(() => {
    form.setFieldsValue(initialValues)
  }, [form, initialValues])

  return (
    <Form
      form={form}
      layout="vertical"
      size="small"
      initialValues={initialValues}
      onValuesChange={(changedValues, allValues) =>
        onFormChange(themeKey, changedValues, allValues)
      }
    >
      {/* 渲染基础字段 */}
      {fields.map((fieldName) => {
        const fieldConfig = fieldTypeConfigs[fieldName]
        return fieldConfig ? renderFormField(fieldName, fieldConfig) : null
      })}

      {/* 渲染嵌套字段 */}
      {Object.entries(nestedFields).map(([nestedKey, nestedFieldNames]) => (
        <div
          key={nestedKey}
          style={{
            marginTop: 16,
            padding: 12,
            background: '#f9f9f9',
            borderRadius: 6,
          }}
        >
          <h4
            style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 'bold' }}
          >
            {nestedKey === 'background'
              ? '背景样式'
              : nestedKey === 'hover'
                ? '悬停样式'
                : nestedKey === 'adjustLine'
                  ? '调整线样式'
                  : nestedKey === 'adjustAnchor'
                    ? '调整锚点样式'
                    : nestedKey === 'wrapPadding'
                      ? '内边距'
                      : nestedKey === 'config'
                        ? '网格样式'
                        : nestedKey}
          </h4>
          {(nestedFieldNames as string[]).map((fieldName) => {
            const fieldConfig = fieldTypeConfigs[fieldName]
            return fieldConfig
              ? renderFormField(`${nestedKey}.${fieldName}`, fieldConfig)
              : null
          })}
        </div>
      ))}
    </Form>
  )
}

// 渲染主题表单
const renderThemeForm = (
  themeKey: string,
  themeConfig: ThemeConfig,
  formValues: FormValues,
  handleFormChange: (
    themeKey: string,
    changedValues: any,
    allValues: any,
  ) => void,
) => {
  const currentFormValues = formValues[themeKey] || {}

  return (
    <ThemeFormComponent
      themeKey={themeKey}
      themeConfig={themeConfig}
      initialValues={currentFormValues}
      onFormChange={handleFormChange}
    />
  )
}

const initialFormValues: FormValues = Object.keys(themeFieldConfigs).reduce(
  (acc, key) => {
    acc[key] = {}
    return acc
  },
  {} as FormValues,
)

export default function ThemeExample() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [themeModeList, setThemeModeList] = useState([
    { label: '默认主题', value: 'default' },
    { label: '圆角主题', value: 'radius' },
    { label: '彩色主题', value: 'colorful' },
    { label: '暗黑主题', value: 'dark' },
  ])
  const [themeMode, setThemeMode] = useState('default')
  const [formValues, setFormValues] = useState(initialFormValues)
  // 添加一个状态来跟踪哪些主题被修改过
  const [modifiedThemes, setModifiedThemes] = useState<Set<string>>(new Set())

  const handleFormChange = (
    themeKey: string,
    changedValues: any,
    allValues: any,
  ) => {
    console.log('handleFormChange', themeKey, changedValues, allValues)

    // 处理颜色值，将ColorPicker的对象转换为十六进制字符串
    const processedValues = { ...allValues }

    // 递归处理所有可能的颜色字段
    const processColorValues = (obj: any) => {
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
          // 检查是否是ColorPicker返回的颜色对象
          if (
            obj[key].toHexString &&
            typeof obj[key].toHexString === 'function'
          ) {
            obj[key] = obj[key].toHexString()
          } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            // 递归处理嵌套对象（如background, hover等）
            processColorValues(obj[key])
          }
        }
      }
    }

    processColorValues(processedValues)

    // 特殊处理背景和网格配置
    if (themeKey === 'background' && lfRef.current) {
      // 直接更新背景配置
      lfRef.current.graphModel.updateBackgroundOptions(processedValues)
    } else if (themeKey === 'grid' && lfRef.current) {
      // 直接更新网格配置
      const gridOptions = {
        ...processedValues,
        // 确保config字段正确处理
        config: processedValues.config
          ? {
              color: processedValues.config.color,
              thickness: processedValues.config.thickness,
            }
          : undefined,
      }
      // 过滤掉undefined值
      Object.keys(gridOptions).forEach((key) => {
        if (gridOptions[key] === undefined) {
          delete gridOptions[key]
        }
      })
      lfRef.current.graphModel.updateGridOptions(gridOptions)
    }

    // 标记当前主题已被修改
    setModifiedThemes((prev) => new Set([...prev, themeMode]))

    setFormValues((prev) => ({
      ...prev,
      [themeKey]: processedValues,
    }))
  }

  const handleThemeModeChange = (mode: string) => {
    if (!lfRef.current) return

    // 如果当前主题被修改过，保存修改的配置
    if (modifiedThemes.has(themeMode)) {
      const currentTheme = lfRef.current.getTheme()
      const modifiedConfig = Object.entries(formValues).reduce(
        (acc, [key, value]) => {
          if (value && Object.keys(value).length > 0) {
            acc[key] = value
          }
          return acc
        },
        {} as Record<string, any>,
      )

      // 将修改的配置保存到主题中
      LogicFlow.addThemeMode?.(themeMode, {
        ...currentTheme,
        ...modifiedConfig,
      })
    }

    // 切换到新主题前，先清空当前主题的配置
    lfRef.current.setTheme({}, mode)

    // 切换到新主题
    setThemeMode(mode)

    // 重置表单值为新主题的默认值
    const newTheme = lfRef.current.getTheme()
    const newFormValues: FormValues = {}

    // 将新主题的配置映射到表单结构
    Object.entries(themeFieldConfigs).forEach(([themeKey]) => {
      if (themeKey === 'background') {
        if (lfRef.current?.graphModel.background) {
          newFormValues[themeKey] = lfRef.current.graphModel.background
        }
      } else if (themeKey === 'grid') {
        if (lfRef.current?.graphModel.grid) {
          newFormValues[themeKey] = lfRef.current.graphModel.grid
        }
      } else if (newTheme[themeKey as keyof typeof newTheme]) {
        newFormValues[themeKey] = newTheme[themeKey as keyof typeof newTheme]
      }
    })

    // 清空表单值后重新设置
    setFormValues({})
    setTimeout(() => {
      setFormValues(newFormValues)
    }, 0)
  }

  // 从LogicFlow获取当前主题并设置到表单
  const loadCurrentThemeToForm = () => {
    if (lfRef.current) {
      const currentTheme = lfRef.current.getTheme()
      const graphModel = lfRef.current.graphModel

      // 将当前主题映射到表单结构
      const mappedFormValues: FormValues = {}
      Object.keys(themeFieldConfigs).forEach((themeKey) => {
        if (themeKey === 'background') {
          // 特殊处理背景配置
          if (
            graphModel.background &&
            typeof graphModel.background === 'object'
          ) {
            mappedFormValues[themeKey] = graphModel.background
          }
        } else if (themeKey === 'grid') {
          // 特殊处理网格配置
          if (graphModel.grid) {
            mappedFormValues[themeKey] = graphModel.grid
          }
        } else if (currentTheme[themeKey as keyof typeof currentTheme]) {
          mappedFormValues[themeKey] =
            currentTheme[themeKey as keyof typeof currentTheme]
        }
      })

      setFormValues(mappedFormValues)
    }
  }

  const handleAddThemeMode = () => {
    if (!lfRef.current) return

    // 获取当前完整的主题配置
    const currentCompleteTheme = lfRef.current.getTheme()
    const graphModel = lfRef.current.graphModel
    console.log('Complete current theme:', currentCompleteTheme)
    console.log('Current background:', graphModel.background)
    console.log('Current grid:', graphModel.grid)

    // 合并用户修改的配置到完整主题中
    const mergedTheme = { ...currentCompleteTheme } as any
    Object.entries(formValues).forEach(([themeKey, themeConfig]) => {
      if (themeConfig && Object.keys(themeConfig).length > 0) {
        if (themeKey === 'background') {
          mergedTheme.background = themeConfig
        } else if (themeKey === 'grid') {
          mergedTheme.grid = themeConfig
        } else {
          mergedTheme[themeKey] = {
            ...mergedTheme[themeKey],
            ...themeConfig,
          }
        }
      }
    })

    console.log('Merged theme for saving:', mergedTheme)

    const customModeName = `自定义主题${Date.now()}`
    const newThemeMode = {
      label: customModeName,
      value: customModeName.toLowerCase().replace(/\s+/g, '-'),
    }

    // 添加自定义主题模式
    lfRef.current.addThemeMode?.(newThemeMode.value, mergedTheme)
    setThemeModeList([...themeModeList, newThemeMode])
    setThemeMode(newThemeMode.value)
  }

  // 修改导出主题的处理逻辑
  const handleExportTheme = () => {
    if (!lfRef.current) return

    // 获取当前主题的配置
    const currentTheme = lfRef.current.getTheme()

    // 创建主题配置对象
    const themeConfig = {
      name: themeMode,
      // 如果当前主题被修改过，导出修改后的配置，否则导出原始配置
      theme: modifiedThemes.has(themeMode)
        ? {
            ...currentTheme,
            ...Object.entries(formValues).reduce(
              (acc, [key, value]) => {
                if (value && Object.keys(value).length > 0) {
                  acc[key] = value
                }
                return acc
              },
              {} as Record<string, any>,
            ),
          }
        : currentTheme,
      timestamp: new Date().toISOString(),
    }

    // 转换为JSON字符串
    const themeConfigStr = JSON.stringify(themeConfig, null, 2)

    // 创建Blob对象
    const blob = new Blob([themeConfigStr], { type: 'application/json' })

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `logicflow-theme-${themeMode}-${new Date().getTime()}.json`

    // 触发下载
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    message.success('主题配置导出成功')
  }

  // 修改导入主题的处理逻辑
  const handleImportTheme = () => {
    // 创建文件输入元素
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const themeConfig = JSON.parse(event.target?.result as string)

          // 验证导入的主题配置格式
          if (!themeConfig.theme || typeof themeConfig.theme !== 'object') {
            throw new Error('无效的主题配置格式')
          }

          // 添加新的主题模式
          const newThemeMode = {
            label: themeConfig.name || '导入的主题',
            value:
              themeConfig.name?.toLowerCase().replace(/\s+/g, '-') ||
              `imported-theme-${Date.now()}`,
          }

          // 检查主题模式是否已存在
          const existingMode = themeModeList.find(
            (mode) => mode.value === newThemeMode.value,
          )
          if (existingMode) {
            // 如果已存在，使用新的时间戳创建唯一值
            newThemeMode.value = `${newThemeMode.value}-${Date.now()}`
          }

          // 添加主题模式
          if (lfRef.current) {
            // 使用静态方法添加新主题
            LogicFlow.addThemeMode?.(newThemeMode.value, themeConfig.theme)

            // 更新主题列表
            setThemeModeList([...themeModeList, newThemeMode])

            // 切换到新主题前，先清空当前主题的配置
            lfRef.current.setTheme({}, newThemeMode.value)

            // 切换到新主题
            setThemeMode(newThemeMode.value)

            // 将导入的主题配置设置到表单中，但不标记为已修改
            const importedFormValues: FormValues = {}
            Object.entries(themeConfig.theme).forEach(([key, value]) => {
              if (themeFieldConfigs[key]) {
                importedFormValues[key] = value
              }
            })

            // 清空表单值后重新设置
            setFormValues({})
            setTimeout(() => {
              setFormValues(importedFormValues)
            }, 0)

            message.success('主题配置导入成功')
          }
        } catch (error) {
          message.error('导入失败：无效的主题配置文件')
          console.error('Import theme error:', error)
        }
      }

      reader.readAsText(file)
    }

    input.click()
  }

  // 修改 useEffect 中的主题监听逻辑
  useEffect(() => {
    if (lfRef.current) {
      // 清空当前主题配置
      lfRef.current.setTheme({}, themeMode)

      // 如果是修改过的主题，应用保存的配置
      if (modifiedThemes.has(themeMode)) {
        const modifiedConfig = Object.entries(formValues).reduce(
          (acc, [key, value]) => {
            if (value && Object.keys(value).length > 0) {
              acc[key] = value
            }
            return acc
          },
          {} as Record<string, any>,
        )

        if (Object.keys(modifiedConfig).length > 0) {
          lfRef.current.setTheme(modifiedConfig, themeMode)
        }
      }
    }
  }, [themeMode, modifiedThemes])

  // 修改表单值变化的监听逻辑
  useEffect(() => {
    if (lfRef.current && modifiedThemes.has(themeMode)) {
      // 只有在主题被修改过的情况下，才应用表单值的变化
      const modifiedConfig = Object.entries(formValues).reduce(
        (acc, [key, value]) => {
          if (value && Object.keys(value).length > 0) {
            acc[key] = value
          }
          return acc
        },
        {} as Record<string, any>,
      )

      if (Object.keys(modifiedConfig).length > 0) {
        lfRef.current.setTheme(modifiedConfig, themeMode)
      }
    }
  }, [formValues, themeMode, modifiedThemes])

  // 初始化 LogicFlow
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        height: 600,
        multipleSelectKey: 'shift',
        disabledTools: ['multipleSelect'],
        autoExpand: true,
        adjustEdgeStartAndEnd: true,
        allowRotate: true,
        edgeTextEdit: true,
        keyboard: {
          enabled: true,
        },
        // themeMode: 'radius',
        partial: true,
        background: {
          color: '#FFFFFF',
        },
        // 使用config中定义的网格配置，而不是简单的true
        grid: config.grid,
        edgeTextDraggable: true,
        edgeType: 'bezier',
        idGenerator(type) {
          return type + '_' + Math.random()
        },
        edgeGenerator: (sourceNode) => {
          // 限制'rect', 'diamond', 'polygon'节点的连线为贝塞尔曲线
          if (['rect', 'diamond', 'polygon'].includes(sourceNode.type))
            return 'bezier'
          return 'polyline'
        },
      })
      lf.render(data)
      lf.translateCenter()
      lfRef.current = lf

      // LogicFlow 初始化后，加载当前主题到表单
      setTimeout(() => {
        loadCurrentThemeToForm()
      }, 100)
    }
  }, [])

  // 按分类组织主题项
  const themeCategories: Record<
    string,
    { label: string; items: Array<ThemeConfig & { key: string }> }
  > = {
    basic: { label: '基础主题', items: [] },
    node: { label: '节点主题', items: [] },
    edge: { label: '边主题', items: [] },
    text: { label: '文本主题', items: [] },
    other: { label: '其他元素', items: [] },
    canvas: { label: '画布配置', items: [] },
  }

  Object.entries(themeFieldConfigs).forEach(([key, config]) => {
    themeCategories[config.category].items.push({ key, ...config })
  })

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 左侧画布 */}
      <div style={{ flex: 1, background: '#f0f2f5' }}>
        <div style={{ padding: 16 }}>
          <div
            style={{
              marginBottom: 16,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <span>主题模式:</span>
            <Select
              value={themeMode}
              style={{ width: 200 }}
              onChange={handleThemeModeChange}
              options={themeModeList}
            />
            <Button type="primary" onClick={handleAddThemeMode}>
              保存为自定义主题
            </Button>
            <Button onClick={handleExportTheme}>导出主题配置</Button>
            <Button onClick={handleImportTheme}>导入主题配置</Button>
          </div>
        </div>
        <div ref={containerRef} id="LF-theme" />
      </div>

      {/* 右侧表单面板 */}
      <div
        style={{
          width: 400,
          background: '#fff',
          borderLeft: '1px solid #e8e8e8',
          overflow: 'auto',
        }}
      >
        <div style={{ padding: 16 }}>
          <h3 style={{ margin: 0, marginBottom: 16 }}>主题配置</h3>

          <Tabs
            type="card"
            size="small"
            items={Object.entries(themeCategories).map(
              ([categoryKey, category]) => ({
                key: categoryKey,
                label: category.label,
                children: (
                  <div
                    style={{
                      maxHeight: 'calc(100vh - 200px)',
                      overflow: 'auto',
                    }}
                  >
                    {category.items.map((item) => (
                      <div
                        key={item.key}
                        style={{
                          marginBottom: 24,
                          padding: 16,
                          border: '1px solid #f0f0f0',
                          borderRadius: 8,
                        }}
                      >
                        <h4
                          style={{
                            margin: '0 0 12px 0',
                            color: '#666',
                            fontSize: 13,
                          }}
                        >
                          {item.label}
                        </h4>
                        {renderThemeForm(
                          item.key,
                          item,
                          formValues,
                          handleFormChange,
                        )}
                      </div>
                    ))}
                  </div>
                ),
              }),
            )}
          />
        </div>
      </div>
    </div>
  )
}
