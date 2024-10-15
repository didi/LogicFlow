import LogicFlow from '@logicflow/core'

import { Card, Flex, Form, Radio, Divider, Slider, ColorPicker } from 'antd'
import { useState, useEffect, useRef } from 'react'
import styles from './index.less'

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: false,
  stopZoomGraph: false,
  stopMoveGraph: true,
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2,
    },
    circle: {
      fill: '#f5f5f5',
      stroke: '#666',
    },
    ellipse: {
      fill: '#dae8fc',
      stroke: '#6c8ebf',
    },
    polygon: {
      fill: '#d5e8d4',
      stroke: '#82b366',
    },
    diamond: {
      fill: '#ffe6cc',
      stroke: '#d79b00',
    },
    text: {
      color: '#b85450',
      fontSize: 12,
    },
  },
  allowRotate: true,
  allowResize: true,
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

export default function SelectionSelectExample() {
  const lfRef = useRef<LogicFlow>()
  const [gridVisible, setGridVisible] = useState(true)
  const [gridType, setGridType] = useState<'dot' | 'mesh'>('dot')
  const [gridSize, setGridSize] = useState(20)
  const containerRef = useRef<HTMLDivElement>(null)

  // 初始化 LogicFlow
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current!,
        grid: {
          size: 20,
        },
      })

      lf.render(data)
      lf.translateCenter()
      lfRef.current = lf
    }
  }, [])

  useEffect(() => {
    lfRef.current?.graphModel.updateGridOptions({ visible: gridVisible })
  }, [gridVisible])

  useEffect(() => {
    lfRef.current?.graphModel.updateGridOptions({ type: gridType })
  }, [gridType])

  return (
    <Card title="LogicFlow - Grid">
      <Flex wrap="wrap" gap="middle" align="center" justify="space-between">
        <Form layout="inline">
          <Form.Item label="网格显隐">
            <Radio.Group
              value={gridVisible}
              onChange={(e) => setGridVisible(e.target.value)}
            >
              <Radio.Button value={true}>显示网格</Radio.Button>
              <Radio.Button value={false}>隐藏网格</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="网格类型">
            <Radio.Group
              value={gridType}
              onChange={(e) => setGridType(e.target.value)}
            >
              <Radio.Button value={'dot'}>点状网格</Radio.Button>
              <Radio.Button value={'mesh'}>线状网格</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="网格大小">
            <div style={{ width: '100px' }}>
              <Slider
                min={5}
                max={40}
                step={1}
                value={gridSize}
                onChange={(value) => {
                  setGridSize(value)
                  lfRef.current?.graphModel.updateGridOptions({ size: value })
                }}
              />
            </div>
          </Form.Item>
          <Form.Item label="网格宽度">
            <div style={{ width: '100px' }}>
              <Slider
                min={1}
                max={gridSize / 4}
                step={1}
                defaultValue={1}
                onChange={(value) => {
                  lfRef.current?.graphModel.updateGridOptions({
                    config: { thickness: value },
                  })
                }}
              />
            </div>
          </Form.Item>
          <Form.Item label="网格颜色">
            <ColorPicker
              value={'#ababab'}
              onChange={(color) => {
                lfRef.current?.graphModel.updateGridOptions({
                  config: { color: color.toHexString() },
                })
              }}
            />
          </Form.Item>
        </Form>
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  )
}
