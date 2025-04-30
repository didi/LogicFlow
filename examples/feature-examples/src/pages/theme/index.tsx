import LogicFlow from '@logicflow/core'

import {
  Card,
  Form,
  Divider,
  Row,
  Col,
  ColorPicker,
  Collapse,
  Radio,
  InputNumber,
} from 'antd'
import { useEffect, useRef, useState } from 'react'
// import styles from './index.less'

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

const formList = [
  { key: 'baseNode', label: '节点样式' },
  { key: 'baseEdge', label: '边样式' },
  { key: 'rect', label: '矩形节点样式' },
  { key: 'circle', label: '圆形样式' },
  { key: 'diamond', label: '菱形样式' },
  { key: 'ellipse', label: '椭圆样式' },
  { key: 'polygon', label: '多边形样式' },
  { key: 'line', label: '直线样式' },
  { key: 'polyline', label: '折线样式' },
  { key: 'bezier', label: '贝塞尔曲线样式' },
  { key: 'anchorLine', label: '从锚点拉出的边的样式' },
  { key: 'text', label: '文本节点样式' },
  { key: 'nodeText', label: '节点文本样式' },
  { key: 'edgeText', label: '边文本样式' },
  { key: 'inputText', label: '输入框样式' },
  { key: 'anchor', label: '锚点样式' },
  { key: 'arrow', label: '边上箭头的样式' },
  { key: 'snapline', label: '对齐线样式' },
  { key: 'rotateControl', label: '节点旋转控制点样式' },
  { key: 'resizeControl', label: '节点旋转控制点样式' },
  { key: 'resizeOutline', label: '节点调整大小时的外框样式' },
]

const defaultTheme = {
  baseNode: {
    fill: '#fff',
    stroke: '#000',
    strokeWidth: 2,
    strokeLinejoin: 'round',
    radius: 8,
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
const colorfulTheme = {
  baseNode: {
    fill: '#fefaec',
    stroke: '#625772',
    strokeWidth: 2,
  },
  baseEdge: {
    stroke: '#625772',
    strokeWidth: 2,
  },
  rect: {
    fill: '#fefaec',
    stroke: '#f38181',
    strokeWidth: 2,
  },
  circle: {
    fill: '#fefaec',
    stroke: '#a9eee6',
    strokeWidth: 4,
  },
  diamond: {
    fill: '#fefaec',
    stroke: '#fce38a',
    strokeWidth: 4,
  },
  ellipse: {
    fill: '#eaffd0',
    stroke: '#95e1d3',
    strokeWidth: 4,
  },
  polygon: {
    fill: '#fce38a',
    stroke: '#f38181',
    strokeWidth: 4,
  },
  line: {
    stroke: '#2d4059',
    strokeWidth: 2,
  },
  polyline: {
    stroke: '#ff7e67',
    strokeWidth: 2,
    strokeDasharray: '5,5',
  },
  bezier: {
    stroke: '#c86b85',
    strokeWidth: 2,
    strokeDasharray: '10,10',
  },
  anchorLine: {
    stroke: '#ffc93c',
    strokeWidth: 8,
    strokeDasharray: '15,15',
  },
  text: {
    color: '#ff6f3c',
    fontSize: 14,
  },
  nodeText: {
    color: '#7e6bc4',
    fontSize: 14,
    fontWeight: 800,
  },
  edgeText: {
    color: '#ffaa64',
    fontSize: 14,
  },
  inputText: {
    color: '#ffaa64',
    background: 'transparent',
    fontSize: 14,
  },
  anchor: {
    fill: '#ffaa64',
    stroke: '#fff5a5',
  },
  arrow: {
    stroke: '#f8b595',
    strokeWidth: 1,
  },
  snapline: {
    stroke: '#f67280',
    strokeWidth: 1,
  },
  rotateControl: {
    fill: '#f8b595',
    stroke: '#6c5b7c',
  },
  resizeControl: {
    fill: '#a4e5d9',
    stroke: '#649dad',
  },
  resizeOutline: {
    stroke: '#a4e5d9',
  },
  edgeAdjust: {
    fill: '#fb929e',
    stroke: '#fff6f6',
  },
  outline: {
    hover: {
      stroke: '#7098da',
    },
    stroke: '#a393eb',
    strokeWidth: 2,
  },
  edgeAnimation: {},
}
const darkTheme = {
  baseNode: {
    fill: '#282c34',
    stroke: '#FF79C6',
    strokeWidth: 2,
  },
  baseEdge: {
    stroke: '#FF79C6',
    strokeWidth: 2,
  },
  rect: {
    fill: '#282c34',
    stroke: '#8dc87e',
    strokeWidth: 2,
  },
  circle: {
    fill: '#282c34',
    stroke: '#62b2eb',
    strokeWidth: 4,
  },
  diamond: {
    fill: '#282c34',
    stroke: '#ec5c72',
    strokeWidth: 4,
  },
  ellipse: {
    fill: '#282c34',
    stroke: '#FFB86C',
    strokeWidth: 4,
  },
  polygon: {
    fill: '#282c34',
    stroke: '#cd67d5',
    strokeWidth: 4,
  },
  line: {
    stroke: '#FF2222',
    strokeWidth: 2,
  },
  polyline: {
    stroke: '#1B2B34',
    strokeWidth: 2,
    strokeDasharray: '5,5',
  },
  bezier: {
    stroke: '#282A36',
    strokeWidth: 2,
    strokeDasharray: '10,10',
  },
  anchorLine: {
    stroke: '#DCDCAA',
    strokeWidth: 8,
    strokeDasharray: '15,15',
  },
  text: {
    color: '#90549b',
    fontSize: 14,
  },
  nodeText: {
    color: '#D4D4D4',
    fontSize: 14,
    fontWeight: 800,
  },
  edgeText: {
    color: '#D4D4D4',
    fontSize: 14,
  },
  inputText: {
    color: '#CE9178',
    background: 'transparent',
    fontSize: 14,
  },
  anchor: {
    fill: '#282c34',
    stroke: '#D7BA7D',
  },
  arrow: {
    stroke: '#FF6600',
    strokeWidth: 1,
  },
  snapline: {
    stroke: '#666666',
    strokeWidth: 1,
  },
  rotateControl: {
    fill: '#282c34',
    stroke: '#FF79C6',
  },
  resizeControl: {
    fill: '#282c34',
    stroke: '#D7BA7D',
  },
  resizeOutline: {
    stroke: '#FF6600',
  },
  edgeAdjust: {
    fill: '#fb929e',
    stroke: '#fff6f6',
  },
  outline: {
    hover: {
      stroke: '#FF6600',
    },
    stroke: '#FF007F',
    strokeWidth: 2,
  },
  edgeAnimation: {},
}

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
}

const data = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 150,
      y: 100,
      text: '矩形',
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

const initialFormValues = formList.reduce((acc, item) => {
  acc[item.key] = { fill: '', stroke: '', strokeWidth: 1 }
  return acc
}, {})

export default function SelectionSelectExample() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [form] = Form.useForm()
  const [formValues, setFormValues] = useState(initialFormValues)

  useEffect(() => {
    lfRef.current?.setTheme(formValues)
  }, [formValues])
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
        style: defaultTheme,
        partial: true,
        background: {
          color: '#FFFFFF',
        },
        grid: true,
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
    }
  }, [])
  const handleFormChange = (key: any, changedValues: any, allValues: any) => {
    // 处理颜色值，转换为十六进制
    const processedValues = { ...allValues }

    // 检查是否有颜色值需要转换
    Object.keys(changedValues).forEach((key) => {
      // 处理常见的颜色属性字段
      if (key === 'fill' || key === 'stroke' || key === 'color') {
        if (changedValues[key] && changedValues[key].toHexString) {
          processedValues[key] = changedValues[key].toHexString()
        }
      }
    })
    setFormValues({
      ...formValues,
      [key]: processedValues,
    })
  }

  const renderCard = (key) => (
    <div>
      <Form
        form={form}
        layout="vertical"
        size="small"
        // 关键是添加这一行，确保表单显示最新值
        initialValues={formValues[key]}
        fields={Object.entries(formValues[key] || {}).map(([name, value]) => ({
          name,
          value,
        }))}
        onValuesChange={(changedValues, allValues) =>
          handleFormChange(key, changedValues, allValues)
        }
      >
        <Form.Item label="背景颜色" name="fill">
          <ColorPicker initialValues="#1677ff" size="small" showText />
        </Form.Item>
        <Form.Item label="边框宽度" name="strokeWidth">
          <InputNumber size="small" />
        </Form.Item>
        <Form.Item label="边框颜色" name="stroke">
          <ColorPicker initialValues="#1677ff" size="small" showText />
        </Form.Item>
      </Form>
    </div>
  )

  const customPanel = () => (
    <div style={{ height: '400px', overflow: 'auto' }}>
      {formList.map((item) => (
        <Collapse key={item.key} defaultActiveKey={[]} ghost>
          <Collapse.Panel header={item.label} key="1">
            {renderCard(item.key)}
          </Collapse.Panel>
        </Collapse>
      ))}
    </div>
  )

  const handleThemeChange = (e: any) => {
    const theme = e.target.value
    let newValues

    if (theme === 'defaultTheme') {
      newValues = defaultTheme
    } else if (theme === 'colorfulTheme') {
      newValues = colorfulTheme
    } else {
      newValues = darkTheme
    }

    // 更新状态
    setFormValues(newValues)

    // 重置表单值
    form.setFieldsValue(newValues)
  }

  return (
    <Card title="LogicFlow - Theme">
      <Row>
        <Col span={6}>
          <h3>主题设置</h3>
          <Radio.Group
            initialValues="defaultTheme"
            buttonStyle="solid"
            onChange={handleThemeChange}
          >
            <Radio value="defaultTheme">默认主题</Radio>
            <Radio value="colorfulTheme">彩色主题</Radio>
            <Radio value="darkTheme">暗黑主题</Radio>
          </Radio.Group>
          <Divider />
          <h3>样式定制</h3>
          {customPanel()}
        </Col>
        <Col span={18}>
          <h3>效果预览</h3>
          <div ref={containerRef} id="graph"></div>
        </Col>
      </Row>
    </Card>
  )
}
